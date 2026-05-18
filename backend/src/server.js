import express from "express";
import path from "path";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger, securityHeaders } from "./middleware/logger.js";

import chatRoutes from "./routes/chatRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import problemsRoutes from "./routes/problemsRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import interviewRoutesV2 from "./routes/interviewRoutesV2.js";
import userRoutesV2 from "./routes/userRoutesV2.js";
import jobRoutesV2 from "./routes/jobRoutesV2.js";
import deepgramRoutes from "./routes/deepgramRoutes.js";

const app = express();

const __dirname = path.resolve();

// middleware
app.use(express.json());
// credentials:true meaning?? => server allows a browser to include cookies on request
const allowedOrigins = new Set([
  ENV.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Security and logging middleware
app.use(securityHeaders);
app.use(requestLogger);

// Log Clerk configuration on startup
console.log("🔐 Clerk configuration:");
console.log("   Publishable Key:", ENV.CLERK_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing");
console.log("   Secret Key:", ENV.CLERK_SECRET_KEY ? "✅ Set" : "❌ Missing");

// Clerk middleware - explicitly configured with secret key for Bearer token support
app.use(clerkMiddleware({
  secretKey: ENV.CLERK_SECRET_KEY,
  publishableKey: ENV.CLERK_PUBLISHABLE_KEY
}));

// Health check FIRST - before any other routes
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

app.use("/api/chat", chatRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/rooms/:roomId/participants", participantRoutes);
app.use("/api/rooms/:roomId/chat", chatRoutes);
app.use("/api/rooms/:roomId/activity", activityRoutes);
// Use v2 user routes for all user endpoints
app.use("/api/user", userRoutesV2);
app.use("/api/user/v2", userRoutesV2);
app.use("/api/resume", resumeRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/interview", interviewRoutesV2); // Prisma-based interview routes
app.use("/api/jobs", jobRoutesV2); // Job queue status + deepgram
app.use("/api/deepgram", deepgramRoutes);

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Global error handler MUST be last
app.use(errorHandler);

const startServer = async () => {
  try {
    // Start server immediately (for health checks)
    const server = app.listen(ENV.PORT, "0.0.0.0", () => {
      console.log("✅ Server started on port:", ENV.PORT);
      console.log("✅ Health check ready at /health");
    });

    server.on("error", (error) => {
      console.error("❌ Server error:", error);
      process.exit(1);
    });

    // Test Prisma connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ PostgreSQL (Prisma) connected successfully");
      console.log("✅ Using Supabase PostgreSQL database");
      console.log("✅ Socket.IO ready for real-time collaboration");
      // Ensure pgvector extension and helper function exist for RAG similarity
      try {
        await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector;`;
      } catch (extErr) {
        console.warn('Could not ensure pgvector extension exists (may require superuser):', extErr?.message || extErr);
      }

      const matchFunc = `
CREATE OR REPLACE FUNCTION match_resume_chunks(query_embedding vector, match_count int, resume_id_filter uuid)
RETURNS TABLE(id uuid, "resumeId" uuid, content text, score float)
AS $$
BEGIN
  RETURN QUERY
  SELECT rc.id, rc."resumeId", rc.content, 1 - (rc.embedding <#> query_embedding) as score
  FROM "ResumeChunk" rc
  WHERE (resume_id_filter IS NULL OR rc."resumeId" = resume_id_filter)
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
`;
      try {
        await prisma.$executeRawUnsafe(matchFunc);
        console.log('✅ match_resume_chunks function created/updated');
      } catch (mfErr) {
        console.warn('Could not create match_resume_chunks function:', mfErr?.message || mfErr);
      }
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError.message);
      console.error("Make sure DATABASE_URL is set correctly in .env");
      console.warn("⚠️ Starting server without a confirmed DB connection. API endpoints that require Prisma may fail until the database is reachable.");
    }
  } catch (error) {
    console.error("❌ Fatal error starting server:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

startServer();
