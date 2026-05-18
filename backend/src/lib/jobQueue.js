import { prisma } from "./prisma.js";
import { generateEvaluationReport } from "./groq.js";
import { ENV } from "./env.js";

/**
 * Job Queue Service
 * Handles async tasks like evaluation generation, report creation
 * Uses PostgreSQL as the queue backend (no external service needed)
 */

export class JobQueue {
  /**
   * Enqueue a new job
   */
  static async enqueue(type, payload, maxRetries = 3) {
    try {
      const job = await prisma.job.create({
        data: {
          type,
          status: "PENDING",
          payload: JSON.stringify(payload),
          maxRetries,
        },
      });

      console.log(`[JobQueue] Enqueued ${type} job:`, job.id);
      return job;
    } catch (error) {
      console.error("[JobQueue] Error enqueuing job:", error);
      throw error;
    }
  }

  /**
   * Process pending jobs (called by cron or manual trigger)
   */
  static async processPendingJobs(limit = 10) {
    try {
      const jobs = await prisma.job.findMany({
        where: {
          status: "PENDING",
        },
        orderBy: {
          createdAt: "asc",
        },
        take: limit,
      });

      console.log(`[JobQueue] Processing ${jobs.length} pending jobs`);

      for (const job of jobs) {
        await this.processJob(job);
      }

      return jobs.length;
    } catch (error) {
      console.error("[JobQueue] Error processing jobs:", error);
      throw error;
    }
  }

  /**
   * Process a single job
   */
  static async processJob(job) {
    try {
      // Mark as processing
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "PROCESSING" },
      });

      const payload = JSON.parse(job.payload);
      let result;

      // Handle different job types
      switch (job.type) {
        case "evaluate":
          result = await this.handleEvaluationJob(payload);
          break;

        case "generate_report":
          result = await this.handleReportJob(payload);
          break;

        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      // Mark as completed
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          result: JSON.stringify(result),
          processedAt: new Date(),
        },
      });

      console.log(`[JobQueue] Completed job ${job.id}`);
    } catch (error) {
      console.error(`[JobQueue] Error processing job ${job.id}:`, error);

      // Increment attempts and retry if needed
      const newAttempts = job.attempts + 1;
      const newStatus = newAttempts >= job.maxRetries ? "FAILED" : "PENDING";

      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: newStatus,
          attempts: newAttempts,
          error: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Handle evaluation job
   */
  static async handleEvaluationJob(payload) {
    const { sessionId } = payload;

    console.log(`[JobQueue] Running evaluation for session ${sessionId}`);

    const report = await generateEvaluationReport(sessionId);

    // Save evaluation to database
    await prisma.evaluation.create({
      data: {
        sessionId,
        technicalScore: report.technical_score,
        communicationScore: report.communication_score,
        confidenceScore: report.confidence_score,
        behavioralScore: report.behavioral_score,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        improvements: report.improvements,
        detailedFeedback: report.summary,
      },
    });

    return { success: true, sessionId };
  }

  /**
   * Handle report generation job
   */
  static async handleReportJob(payload) {
    const { sessionId, format = "pdf" } = payload;

    console.log(`[JobQueue] Generating ${format} report for session ${sessionId}`);

    // TODO: Implement report generation (PDF, HTML, etc.)
    // For now, just return success

    return { success: true, sessionId, format };
  }

  /**
   * Get job status
   */
  static async getJobStatus(jobId) {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) return null;

      return {
        id: job.id,
        type: job.type,
        status: job.status,
        attempts: job.attempts,
        maxRetries: job.maxRetries,
        result: job.result ? JSON.parse(job.result) : null,
        error: job.error,
        processedAt: job.processedAt,
        createdAt: job.createdAt,
      };
    } catch (error) {
      console.error("[JobQueue] Error getting job status:", error);
      throw error;
    }
  }
}

/**
 * Cron job handler - call this periodically to process queue
 * Example: Every 30 seconds via setInterval or external cron service
 */
export async function processJobQueueCron() {
  try {
    const processed = await JobQueue.processPendingJobs(10);
    if (processed > 0) {
      console.log(`[Cron] Processed ${processed} jobs`);
    }
  } catch (error) {
    console.error("[Cron] Error in job queue processor:", error);
  }
}

// Start cron if not in test environment
if (ENV.NODE_ENV !== "test") {
  setInterval(processJobQueueCron, 30000); // Every 30 seconds
}

export default JobQueue;
