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

const app = express();

const __dirname = path.resolve();

// Create HTTP server for Socket.IO
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// middleware
app.use(express.json());
// credentials:true meaning?? => server allows a browser to include cookies on request
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

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
app.use("/api/user", userRoutes);

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
    server.listen(ENV.PORT, () => {
      console.log("✅ Server started on port:", ENV.PORT);
      console.log("✅ Health check ready at /health");
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
    process.exit(1);
  }
};

startServer();
