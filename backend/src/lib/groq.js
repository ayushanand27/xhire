import Groq from "groq-sdk";
import { prisma } from "./prisma.js";
import { ENV } from "./env.js";
import fetch from 'node-fetch';

const client = new Groq({
  apiKey: ENV.GROQ_API_KEY,
});

const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const EVALUATION_MODEL = "llama3-70b-8192";
const JSON_RESPONSE_FORMAT = { type: "json_object" };

function extractText(response) {
  const text = response?.choices?.[0]?.message?.content;
  if (typeof text === "string") return text;
  if (Array.isArray(text)) {
    return text.map((part) => (typeof part === "string" ? part : part?.text ?? "")).join("");
  }
  return "";
}

function parseJsonContent(content, contextLabel = "Groq response") {
  const trimmed = content.trim();
  const withoutFences = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(withoutFences);
  } catch (error) {
    console.error(`❌ Failed to parse JSON from ${contextLabel}`);
    console.error("--- Raw Groq response start ---");
    console.error(content);
    console.error("--- Raw Groq response end ---");
    throw new Error(
      `Groq returned invalid JSON for ${contextLabel}. Please retry the request.`
    );
  }
}

async function complete(
  prompt,
  {
    max_tokens = 1000,
    temperature = 0.2,
    model = DEFAULT_MODEL,
    systemPrompt = "",
    response_format = JSON_RESPONSE_FORMAT,
  } = {}
) {
  const response = await client.chat.completions.create({
    model,
    max_tokens,
    temperature,
    response_format,
    messages: [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      { role: "user", content: prompt },
    ],
  });

  const text = extractText(response);
  if (!text) throw new Error("Empty Groq response");
  return text;
}

/**
 * Generate interview questions using Groq based on resume + JD context
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

Return only valid JSON, no preamble, no explanation, no markdown code blocks.
Return ONLY a JSON array of strings, each question on a new line. Example format:
["Question 1?", "Question 2?", "Question 3?"]`;

    const content = await complete(prompt, {
      max_tokens: 1000,
      temperature: 0.7,
      model: DEFAULT_MODEL,
      systemPrompt:
        "You are a senior technical interviewer. Ask challenging, specific, and creative follow-up questions grounded in the candidate's resume and job description.",
    });
    const questions = parseJsonContent(content, "interview question generation");
    return Array.isArray(questions) ? questions : [questions];
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

/**
 * Evaluate candidate's answer using Groq
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

Return only valid JSON, no preamble, no explanation, no markdown code blocks.
Return a JSON object:
{
  "technical_accuracy": <0-10>,
  "completeness": <0-10>,
  "clarity": <0-10>,
  "depth": <0-10>,
  "feedback": "Brief feedback on strengths and areas for improvement",
  "follow_up": "Suggested follow-up question to probe deeper"
}`;

    const content = await complete(prompt, {
      max_tokens: 500,
      temperature: 0.2,
      model: EVALUATION_MODEL,
      systemPrompt:
        "You are a strict senior engineer evaluating technical interview answers. Be concise, evidence-based, and consistent.",
    });
    return parseJsonContent(content, "answer evaluation");
  } catch (error) {
    console.error("Error evaluating answer:", error);
    throw error;
  }
}

/**
 * Generate final evaluation report using Groq
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
}

Return only valid JSON, no preamble, no explanation, no markdown code blocks.`;

    const content = await complete(prompt, {
      max_tokens: 1500,
      temperature: 0.2,
      model: EVALUATION_MODEL,
      systemPrompt:
        "You are a senior recruiter generating a final interview evaluation. Be critical, specific, and consistent.",
    });
    return parseJsonContent(content, "session evaluation report");
  } catch (error) {
    console.error("Error generating evaluation report:", error);
    throw error;
  }
}

/**
 * Parse resume PDF text using Groq
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
}

Return only valid JSON, no preamble, no explanation, no markdown code blocks.`;

    const content = await complete(prompt, {
      max_tokens: 800,
      temperature: 0.2,
      model: DEFAULT_MODEL,
      systemPrompt:
        "You are an expert resume parser. Return only structured JSON with no extra commentary.",
    });
    return parseJsonContent(content, "resume parsing");
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
}

export { client };

/**
 * Get an embedding vector for a given input string.
 * Tries to be resilient to different SDK response shapes.
 */
/**
 * Get an embedding using Hugging Face Inference API (sentence-transformers/all-MiniLM-L6-v2)
 * Returns a 384-dim float array.
 */
export async function getEmbedding(input, { model = 'sentence-transformers/all-MiniLM-L6-v2' } = {}) {
  if (!input) throw new Error('Empty input for embedding');
  if (!ENV.HUGGINGFACE_API_KEY) throw new Error('Hugging Face API key not set (HUGGINGFACE_API_KEY)');

  const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ENV.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: input }),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => null);
    throw new Error(`Hugging Face embedding failed: ${resp.status} ${txt || resp.statusText}`);
  }

  const data = await resp.json();
  // The HF pipeline returns either [embedding] or [[embedding]] depending on batching
  let emb = null;
  if (Array.isArray(data) && data.length > 0) {
    if (Array.isArray(data[0]) && typeof data[0][0] === 'number') emb = data[0];
    else if (Array.isArray(data[0]) && Array.isArray(data[0][0])) emb = data[0][0];
    else if (typeof data[0] === 'number') emb = data;
  }

  if (!emb || !Array.isArray(emb)) throw new Error('Unexpected HF embedding response');
  return emb;
}
