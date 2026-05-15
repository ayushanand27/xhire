import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma.js";
import { ENV } from "./env.js";

const client = new Anthropic({
  apiKey: ENV.ANTHROPIC_API_KEY,
});

/**
 * Generate interview questions using Claude based on resume + JD context
 * Uses the resume chunks as context for RAG-based question generation
 */
export async function generateInterviewQuestions(sessionId, numQuestions = 3) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        resume: { include: { chunks: true } },
        jd: true,
      },
    });

    if (!session) throw new Error("Session not found");
    if (!session.resume || !session.jd) throw new Error("Resume or JD missing");

    // Get top 3 resume chunks by relevance (simplified — in production use vector search)
    const resumeContext = session.resume.chunks
      .slice(0, 3)
      .map((chunk) => chunk.content)
      .join("\n---\n");

    const prompt = `You are an expert technical interviewer. Based on the candidate's resume and job description, generate ${numQuestions} challenging interview questions.

RESUME CONTEXT:
${resumeContext}

JOB DESCRIPTION:
${session.jd.content}

Generate ${numQuestions} technical interview questions that:
1. Test the candidate's relevant skills mentioned in the resume
2. Align with the job requirements
3. Explore problem-solving ability
4. Be progressively harder

Return ONLY a JSON array of strings, each question on a new line. Example format:
["Question 1?", "Question 2?", "Question 3?"]`;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const questions = JSON.parse(content.text);
    return Array.isArray(questions) ? questions : [questions];
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

/**
 * Evaluate candidate's answer using Claude
 * Scores across technical, communication, and confidence dimensions
 */
export async function evaluateAnswer(
  sessionId,
  question,
  answer,
  context = ""
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { resume: true, jd: true },
    });

    if (!session) throw new Error("Session not found");

    const prompt = `You are an expert interviewer evaluating a candidate's response.

QUESTION: "${question}"
CANDIDATE'S ANSWER: "${answer}"

CONTEXT:
${context}

Evaluate this answer on:
1. Technical Accuracy (0-10)
2. Completeness (0-10)
3. Communication Clarity (0-10)
4. Depth of Understanding (0-10)

Return a JSON object:
{
  "technical_accuracy": <0-10>,
  "completeness": <0-10>,
  "clarity": <0-10>,
  "depth": <0-10>,
  "feedback": "Brief feedback on strengths and areas for improvement",
  "follow_up": "Suggested follow-up question to probe deeper"
}`;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    return JSON.parse(content.text);
  } catch (error) {
    console.error("Error evaluating answer:", error);
    throw error;
  }
}

/**
 * Generate final evaluation report using Claude
 * Synthesizes all answers into an overall assessment
 */
export async function generateEvaluationReport(sessionId) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        messages: true,
        proctorEvents: true,
        resume: true,
        jd: true,
      },
    });

    if (!session) throw new Error("Session not found");

    // Build conversation transcript
    const transcript = session.messages
      .map(
        (m) =>
          `[${m.role}]: ${m.content.substring(0, 200)}${m.content.length > 200 ? "..." : ""}`
      )
      .join("\n");

    // Count violations
    const warningCount = session.proctorEvents.filter(
      (e) => e.severity === "WARNING"
    ).length;

    const prompt = `You are an expert recruiter generating a final interview evaluation report.

INTERVIEW TRANSCRIPT:
${transcript}

PROCTORING WARNINGS: ${warningCount}
INTERVIEW TYPE: ${session.type}
INTERVIEW DURATION: Calculate from messages timestamps if available

Generate a JSON evaluation report with these fields:
{
  "overall_score": <0-100>,
  "technical_score": <0-100>,
  "communication_score": <0-100>,
  "confidence_score": <0-100>,
  "behavioral_score": <0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["action1", "action2", "action3"],
  "summary": "2-3 sentence overall assessment",
  "recommendation": "HIRE | DO_NOT_HIRE | MAYBE"
}`;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    return JSON.parse(content.text);
  } catch (error) {
    console.error("Error generating evaluation report:", error);
    throw error;
  }
}

/**
 * Parse resume PDF text using Claude
 * Extracts structured data for skills, experience, education
 */
export async function parseResume(resumeText) {
  try {
    const prompt = `Extract structured information from this resume. Return a JSON object:

RESUME TEXT:
${resumeText}

Return:
{
  "skills": ["skill1", "skill2", ...],
  "yearsOfExperience": <number>,
  "education": ["degree1", "degree2"],
  "summary": "Brief professional summary",
  "highlights": ["highlight1", "highlight2", "highlight3"]
}`;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    return JSON.parse(content.text);
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
}

export { client };
