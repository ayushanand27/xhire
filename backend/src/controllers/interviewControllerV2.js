import { prisma } from "../lib/prisma.js";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  parseResume,
  getEmbedding,
} from "../lib/groq.js";
import { client } from "../lib/groq.js";
import { JobQueue } from "../lib/jobQueue.js";
import { generateEvaluationReport } from "../lib/groq.js";

const toOverallScore = (evaluation) => {
  if (!evaluation) return null;

  const scores = [
    evaluation.technicalScore,
    evaluation.communicationScore,
    evaluation.confidenceScore,
    evaluation.behavioralScore,
  ].filter((value) => Number.isFinite(Number(value)));

  if (!scores.length) return null;

  return Math.round(scores.reduce((sum, value) => sum + Number(value), 0) / scores.length);
};

// Simple helper: chunk text by words (approximate tokenization)
function chunkTextByWords(text, wordsPerChunk = 300) {
  if (!text) return [];
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const slice = words.slice(i, i + wordsPerChunk).join(' ');
    chunks.push(slice);
  }
  return chunks;
}

function dot(a, b) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

function magnitude(a) {
  return Math.sqrt(a.reduce((s, v) => s + v * v, 0));
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return -1;
  const mag = magnitude(a) * magnitude(b);
  if (mag === 0) return -1;
  return dot(a, b) / mag;
}

const toSessionSummary = (session) => ({
  id: session.id,
  type: session.type,
  status: session.status,
  createdAt: session.createdAt,
  startedAt: session.startedAt,
  endedAt: session.endedAt,
  overallScore: toOverallScore(session.evaluation),
  evaluation: session.evaluation
    ? {
        technicalScore: session.evaluation.technicalScore,
        communicationScore: session.evaluation.communicationScore,
        confidenceScore: session.evaluation.confidenceScore,
        behavioralScore: session.evaluation.behavioralScore,
      }
    : null,
});

/**
 * Create a new interview session
 * POST /api/interview
 */
export async function createInterview(req, res) {
  try {
    const { userId } = req.auth;
    const { type, resumeText, jdText } = req.body;

    if (!type || !resumeText || !jdText) {
      return res.status(400).json({
        error: "Missing required fields: type, resumeText, jdText",
      });
    }

    if (!["MOCK", "PROCTORED"].includes(type)) {
      return res.status(400).json({ error: "Invalid interview type" });
    }

    // Parse resume with Groq
    const parsedResume = await parseResume(resumeText);

    // Create or get resume record
    const resume = await prisma.resume.create({
      data: {
        userId,
        filename: "uploaded-resume.txt",
        extractedText: resumeText,
        skills: parsedResume.skills || [],
      },
    });

    // Chunk resume text into ~300-word pieces and create embeddings for RAG
    try {
      const chunks = chunkTextByWords(resumeText || '', 300);
      for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i];
          try {
          const embedding = await getEmbedding(content);
          // Store embedding into pgvector column using parameterized raw SQL
          const embStr = '[' + embedding.join(',') + ']';
          await prisma.$executeRaw`INSERT INTO "ResumeChunk" ("id","resumeId","content","embedding","chunkIndex","createdAt") VALUES (gen_random_uuid(), ${resume.id}, ${content}, ${embStr}::vector, ${i}, now())`;
        } catch (embedErr) {
          console.warn('Failed to embed resume chunk', i, embedErr.message);
          // create chunk without embedding via Prisma to keep schema consistent
          await prisma.resumeChunk.create({
            data: { resumeId: resume.id, content, chunkIndex: i },
          });
        }
      }
    } catch (chunkErr) {
      console.warn('Failed to chunk/embed resume for RAG:', chunkErr.message);
    }

    // Create job description
    const jd = await prisma.jobDescription.create({
      data: {
        userId,
        content: jdText,
        skillsRequired: parsedResume.skills || [],
      },
    });

    // Create session
    const session = await prisma.session.create({
      data: {
        candidateId: userId,
        resumeId: resume.id,
        jdId: jd.id,
        type,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      success: true,
      sessionId: session.id,
      resumeId: resume.id,
      jdId: jd.id,
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Create a lightweight session from existing resumeId and jdId
 * POST /api/interview/session
 * body: { resumeId, jdId, type }
 */
export async function createSession(req, res) {
  try {
    const { resumeId, jdId, type = 'MOCK' } = req.body;
    const user = req.user;

    if (!resumeId || !jdId) {
      return res.status(400).json({ error: 'Missing resumeId or jdId' });
    }

    // Verify resume and jd belong/ exist
    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    const jd = await prisma.jobDescription.findUnique({ where: { id: jdId } });
    if (!resume || !jd) return res.status(404).json({ error: 'Resume or JD not found' });

    const session = await prisma.session.create({
      data: {
        candidateId: user.id,
        resumeId: resume.id,
        jdId: jd.id,
        type,
        status: 'PENDING',
      },
    });

    return res.status(201).json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Start an interview session
 * POST /api/interview/:id/start
 */
export async function startInterview(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.candidateId !== userId && session.recruiterId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (session.status !== "PENDING") {
      return res.status(400).json({ error: "Session already started or ended" });
    }

    // Update session status
    const updated = await prisma.session.update({
      where: { id },
      data: {
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });

    // Generate initial questions
    const questions = await generateInterviewQuestions(id, 3);

    return res.status(200).json({
      success: true,
      sessionId: id,
      status: "ACTIVE",
      questions,
    });
  } catch (error) {
    console.error("Error starting interview:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Submit an answer to an interview question
 * POST /api/interview/:id/answer
 */
export async function submitAnswer(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.auth;
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        error: "Missing required fields: question, answer",
      });
    }

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session || session.candidateId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (session.status !== "ACTIVE") {
      return res.status(400).json({ error: "Session not active" });
    }

    // Store the answer as a message
    const message = await prisma.message.create({
      data: {
        sessionId: id,
        role: "CANDIDATE",
        content: answer,
      },
    });

    // Evaluate the answer
    const evaluation = await evaluateAnswer(id, question, answer);

    // Generate AI follow-up question
    const aiMessage = await prisma.message.create({
      data: {
        sessionId: id,
        role: "AI",
        content:
          evaluation.follow_up ||
          "Can you tell me more about your approach?",
      },
    });

    return res.status(200).json({
      success: true,
      evaluation,
      nextQuestion: aiMessage.content,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Log a proctoring event (warning, violation, etc.)
 * POST /api/interview/:id/proctor/event
 */
export async function logProctorEvent(req, res) {
  try {
    const { id } = req.params;
    const { eventType, severity } = req.body;

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.type !== "PROCTORED") {
      return res
        .status(400)
        .json({ error: "Proctoring only for PROCTORED interviews" });
    }

    // Create proctor event
    const event = await prisma.proctorEvent.create({
      data: {
        sessionId: id,
        eventType,
        severity: severity || "WARNING",
        warningNum: session.warningCount + 1,
      },
    });

    // Update warning count
    let newWarningCount = session.warningCount + 1;
    let shouldTerminate = false;

    if (newWarningCount >= 3) {
      shouldTerminate = true;
    }

    const updated = await prisma.session.update({
      where: { id },
      data: {
        warningCount: newWarningCount,
        status: shouldTerminate ? "TERMINATED" : "ACTIVE",
        endedAt: shouldTerminate ? new Date() : null,
      },
    });

    if (shouldTerminate) {
      console.log(`Session ${id} terminated due to 3 warnings`);
    }

    return res.status(200).json({
      success: true,
      warningCount: newWarningCount,
      terminated: shouldTerminate,
    });
  } catch (error) {
    console.error("Error logging proctor event:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Complete interview and trigger evaluation
 * POST /api/interview/:id/complete
 */
export async function completeInterview(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        messages: true,
        proctorEvents: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.candidateId !== userId && session.recruiterId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!["ACTIVE", "TERMINATED"].includes(session.status)) {
      return res.status(400).json({ error: "Session not in correct state" });
    }

    // Mark session as completed
    const updated = await prisma.session.update({
      where: { id },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
      },
    });

    // Enqueue evaluation job
    const job = await JobQueue.enqueue("evaluate", { sessionId: id });

    return res.status(200).json({
      success: true,
      sessionId: id,
      status: "COMPLETED",
      evaluationJobId: job.id,
      message: "Interview completed. Evaluation in progress.",
    });
  } catch (error) {
    console.error("Error completing interview:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get interview details
 * GET /api/interview/:id
 */
export async function getInterview(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        messages: true,
        proctorEvents: true,
        evaluation: true,
        resume: true,
        jd: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (
      session.candidateId !== userId &&
      session.recruiterId !== userId
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error("Error getting interview:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * List user's interviews
 * GET /api/interview/my
 */
export async function listMyInterviews(req, res) {
  try {
    const { userId } = req.auth;

    const sessions = await prisma.session.findMany({
      where: {
        OR: [{ candidateId: userId }, { recruiterId: userId }],
      },
      include: {
        messages: true,
        evaluation: true,
        resume: true,
        jd: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(sessions);
  } catch (error) {
    console.error("Error listing interviews:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * List user's interview sessions for candidate dashboard
 * GET /api/interview/sessions
 */
export async function listSessions(req, res) {
  try {
    const { userId } = req.auth;

    const sessions = await prisma.session.findMany({
      where: {
        OR: [{ candidateId: userId }, { recruiterId: userId }],
      },
      include: {
        evaluation: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      sessions: sessions.map(toSessionSummary),
    });
  } catch (error) {
    console.error("Error listing sessions:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Generate a single interview question from resume + JD + conversation history
 * POST /api/interview/question
 * body: { resumeId, jdContent, conversationHistory: [{role, content}], questionNumber }
 */
export async function generateQuestion(req, res) {
  try {
    const { resumeId, jdContent, conversationHistory = [], questionNumber = 1 } = req.body;

    if (!resumeId || !jdContent) {
      return res.status(400).json({ error: "Missing resumeId or jdContent" });
    }

    const resume = await prisma.resume.findUnique({ where: { id: resumeId }, include: { chunks: true } });
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    // Build conversation context
    const convoText = Array.isArray(conversationHistory)
      ? conversationHistory
          .map((m) => `[${m.role || "user"}]: ${m.content}`)
          .join("\n")
      : String(conversationHistory || "");

    // Use RAG: embed the JD + convo and find top-5 most similar resume chunks
    let resumeContext = resume.extractedText || "";
    try {
      const chunks = Array.isArray(resume.chunks) ? resume.chunks : [];
      if (chunks.length > 0) {
        const queryEmbedding = await getEmbedding(`${jdContent}\n${convoText}`);
        const embStr = '[' + queryEmbedding.join(',') + ']';

        // Ensure SQL helper function exists for matching (creates function if not present)
        // Call the matching function to get top chunks for this resume (match_resume_chunks is created at server startup)
        let rows = [];
        try {
          rows = await prisma.$queryRaw`SELECT id, "resumeId", content, score FROM match_resume_chunks(${embStr}::vector, 5, ${resume.id})`;
        } catch (qErr) {
          console.warn('match_resume_chunks call failed, falling back to direct similarity query', qErr.message);
          try {
            rows = await prisma.$queryRaw`SELECT id, "resumeId", content, 1 - (embedding <#> ${embStr}::vector) as score FROM "ResumeChunk" WHERE "resumeId" = ${resume.id} ORDER BY embedding <=> ${embStr}::vector LIMIT 5`;
          } catch (q2) {
            console.warn('Direct similarity query failed', q2.message);
            rows = [];
          }
        }

        if (rows && rows.length > 0) {
          const top = rows.map((r) => r.content);
          resumeContext = top.join('\n---\n');
        }
      }
    } catch (ragErr) {
      console.warn('RAG retrieval failed, falling back to full resume text', ragErr.message);
      resumeContext = resume.extractedText || '';
    }

    const prompt = `You are an expert technical interviewer. Using the candidate's resume context and the job description, generate a single interview question (#${questionNumber}) that is relevant, clear, and probes depth.

RESUME CONTEXT:
${resumeContext}

JOB DESCRIPTION:
${jdContent}

CONVERSATION HISTORY:
${convoText}

Return only the question as a single line.`;

    // Use Groq client streaming API to forward chunks as they arrive
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    // Allow CORS preflight clients
    res.flushHeaders?.();

    // The Groq SDK supports streaming async iteration similar to OpenAI
    // Use the stream interface and forward deltas as they arrive
    const stream = await client.chat.completions.stream.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    try {
      for await (const chunk of stream) {
        // chunk.choices[0].delta.content contains incremental text
        const delta = chunk?.choices?.[0]?.delta?.content || "";
        if (delta) {
          res.write(`data: ${delta}\n\n`);
        }
      }

      // Signal completion to the client
      res.write("event: done\n\n");
      res.end();
    } catch (streamErr) {
      console.error("Streaming error from Groq:", streamErr);
      try {
        res.write(`event: error\ndata: ${streamErr.message || 'stream error'}\n\n`);
        res.end();
      } catch (e) {
        // ignore
      }
    }
  } catch (error) {
    console.error("Error generating question:", error);
    return res.status(500).json({ error: error.message || "Failed to generate question" });
  }
}

/**
 * Accept a final transcript/message and store it as a candidate message
 * POST /api/interview/message
 * body: { sessionId, content }
 */
export async function postMessage(req, res) {
  try {
    const { sessionId, content } = req.body;
    const { user } = req;

    if (!sessionId || !content) {
      return res.status(400).json({ error: 'Missing sessionId or content' });
    }

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Only allow candidate for now
    if (session.candidateId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const message = await prisma.message.create({
      data: {
        sessionId,
        role: 'CANDIDATE',
        content,
      },
    });

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error posting message:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Evaluate an interview session using Groq and save results to Evaluation table
 * POST /api/interview/evaluate
 * body: { sessionId }
 */
export async function evaluateSession(req, res) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { messages: true, resume: true, jd: true },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Use existing Groq helper to generate an evaluation report
    const report = await generateEvaluationReport(sessionId);

    // Map fields from report to Evaluation model
    const technicalScore = Number(report.technical_score) || Number(report.technicalScore) || 0;
    const communicationScore = Number(report.communication_score) || Number(report.communicationScore) || 0;
    const confidenceScore = Number(report.confidence_score) || Number(report.confidenceScore) || 0;
    const behavioralScore = Number(report.behavioral_score) || Number(report.behavioralScore) || 0;

    const strengths = Array.isArray(report.strengths) ? report.strengths : [];
    const weaknesses = Array.isArray(report.weaknesses) ? report.weaknesses : [];
    const improvements = Array.isArray(report.improvements) ? report.improvements : [];
    const detailedFeedback = report.feedback || report.summary || report.report || '';

    // Upsert evaluation for session
    const existing = await prisma.evaluation.findUnique({ where: { sessionId } });
    let evaluation;
    if (existing) {
      evaluation = await prisma.evaluation.update({
        where: { sessionId },
        data: {
          technicalScore,
          communicationScore,
          confidenceScore,
          behavioralScore,
          strengths,
          weaknesses,
          improvements,
          detailedFeedback,
        },
      });
    } else {
      evaluation = await prisma.evaluation.create({
        data: {
          sessionId,
          technicalScore,
          communicationScore,
          confidenceScore,
          behavioralScore,
          strengths,
          weaknesses,
          improvements,
          detailedFeedback,
        },
      });
    }

    return res.status(200).json({ success: true, evaluation, report });
  } catch (error) {
    console.error('Error evaluating session:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default {
  createInterview,
  startInterview,
  submitAnswer,
  logProctorEvent,
  completeInterview,
  getInterview,
  listMyInterviews,
};
