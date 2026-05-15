import { prisma } from "../lib/prisma.js";
import { JobQueue } from "../lib/jobQueue.js";

/**
 * Get job status
 * GET /api/jobs/:id
 */
export async function getJobStatus(req, res) {
  try {
    const { id } = req.params;

    const status = await JobQueue.getJobStatus(id);

    if (!status) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.status(200).json(status);
  } catch (error) {
    console.error("Error getting job status:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get Deepgram connection URL for STT
 * GET /api/interview/deepgram/connection-url
 */
export async function getDeepgramConnectionUrl(req, res) {
  try {
    const { DeepgramTranscriber } = await import("../lib/deepgram.js");

    const transcriber = new DeepgramTranscriber();
    const url = transcriber.getClientConnectionUrl({
      interim_results: "true",
      utterance_end_ms: "1000",
      vad_events: "true",
    });

    return res.status(200).json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("Error getting Deepgram URL:", error);
    return res.status(500).json({ error: error.message });
  }
}

export default {
  getJobStatus,
  getDeepgramConnectionUrl,
};
