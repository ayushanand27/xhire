import express from "express";
import path from "path";
import cors from "cors";
import { createServer } from "http";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import { initializeSocket } from "./lib/socket.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import roomRoutes from "./routes/roomRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import recordingRoutes from "./routes/recordingRoutes.js";
import streamWebhookRoutes from "./routes/streamWebhookRoutes.js";
import problemsRoutes from "./routes/problemsRoutes.js";

const app = express();

const __dirname = path.resolve();

// Create HTTP server for Socket.IO
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

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
  })
);

// Log Clerk configuration on startup
console.log("🔐 Clerk configuration:");
console.log("   Publishable Key:", ENV.CLERK_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing");
console.log("   Secret Key:", ENV.CLERK_SECRET_KEY ? "✅ Set" : "❌ Missing");

// Clerk middleware - explicitly configured with secret key for Bearer token support
app.use(clerkMiddleware({
  secretKey: ENV.CLERK_SECRET_KEY,
  publishableKey: ENV.CLERK_PUBLISHABLE_KEY
}));

app.use("/api/inngest", serve({ client: inngest, functions }));

// Health check FIRST - before any other routes
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/rooms/:roomId/participants", participantRoutes);
app.use("/api/rooms/:roomId/chat", chatRoutes);
app.use("/api/rooms/:roomId/activity", activityRoutes);
app.use("/api/rooms/:roomId/recordings", recordingRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/stream/webhook", streamWebhookRoutes);

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const startServer = async () => {
  try {
    // Start server immediately (for health checks)
    server.listen(ENV.PORT, "0.0.0.0", () => {
      console.log("✅ Server started on port:", ENV.PORT);
      console.log("✅ Health check ready at /health");
    });

    server.on("error", (error) => {
      console.error("❌ Server error:", error);
      process.exit(1);
    });

    // Connect to DB in the background
    try {
      await connectDB();
      console.log("✅ Database connected successfully");
      console.log("✅ Socket.IO ready for real-time collaboration");
    } catch (dbError) {
      console.warn("⚠️  Database connection failed, but server is running");
      console.warn("Database error:", dbError.message);
      // Server still runs for health checks, DB will retry
    }
  } catch (error) {
    console.error("❌ Fatal error starting server:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

startServer();
