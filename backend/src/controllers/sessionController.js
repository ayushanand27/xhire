import { chatClient, streamClient } from "../lib/stream.js";
import { Session } from "../models/Session.js";

const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const getSafeErrorMessage = (error) => {
  const msg = error?.message || "Unknown error";
  if (msg.includes("STREAM_API_KEY") || msg.includes("STREAM_API_SECRET")) {
    return "Stream is not configured on the server. Set STREAM_API_KEY and STREAM_API_SECRET.";
  }
  if (msg.toLowerCase().includes("timed out")) {
    return "Session provisioning timed out. Please try again.";
  }
  return "Internal Server Error";
};

export async function createSession(req, res) {
  let callId = null;
  let clerkId = null;
  let session = null;
  try {
    const { title, problem, difficulty } = req.body;
    const userId = req.user._id;
    clerkId = req.user.clerkId;

    console.log(`\ud83d\udc64 User ${req.user.email} creating session...`);

    const sessionTitle =
      (typeof title === "string" && title.trim()) ||
      (typeof problem === "string" && problem.trim() ? `${problem.trim()} Session` : "Live Session");

    // generate a unique call id for stream video
    callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create session in db
    const payload = { title: sessionTitle, host: userId, callId };
    if (typeof problem === "string" && problem.trim()) payload.problem = problem.trim();
    if (typeof difficulty === "string" && difficulty.trim()) payload.difficulty = difficulty.trim().toLowerCase();

    session = await Session.create(payload);

    // Provision Stream resources with a hard timeout so the request never hangs.
    // Frontend axios timeout is 20s; keep server-side under that.
    const streamClientInstance = streamClient.getInstance();
    const chatClientInstance = chatClient.getInstance();

    console.log(`🎥 Provisioning Stream resources for session ${session._id}...`);
    const startTime = Date.now();

    await withTimeout(
      Promise.all([
        streamClientInstance.video.call("default", callId).getOrCreate({
          data: {
            created_by_id: clerkId,
            custom: {
              sessionId: session._id.toString(),
              title: sessionTitle,
              problem: session.problem || null,
              difficulty: session.difficulty || null,
            },
          },
        }),
        chatClientInstance
          .channel("messaging", callId, {
            name: sessionTitle,
            created_by_id: clerkId,
            members: [clerkId],
          })
          .create(),
      ]),
      15000,
      "Stream provisioning"
    );

    const elapsed = Date.now() - startTime;
    console.log(`✅ Stream resources provisioned in ${elapsed}ms`);

    return res.status(201).json({ session });
  } catch (error) {
    console.log("❌ Error in createSession controller:", error.message);
    console.log("Error details:", {
      name: error.name,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });

    // Best-effort cleanup of any partially-provisioned Stream resources.
    if (callId) {
      try {
        const streamClientInstance = streamClient.getInstance();
        const chatClientInstance = chatClient.getInstance();
        const call = streamClientInstance.video.call("default", callId);
        const channel = chatClientInstance.channel("messaging", callId);
        await withTimeout(Promise.allSettled([call.delete({ hard: true }), channel.delete()]), 8000, "Stream cleanup");
      } catch (cleanupError) {
        console.warn("Stream cleanup skipped/failed:", cleanupError.message);
      }
    }

    // Avoid leaving a dangling DB session when Stream provisioning fails.
    if (session?._id) {
      try {
        await Session.deleteOne({ _id: session._id });
      } catch (cleanupError) {
        console.warn("Failed to cleanup session after create failure:", cleanupError.message);
      }
    }

    const safeMessage = getSafeErrorMessage(error);
    const status = safeMessage.includes("timed out") ? 504 : 500;
    return res.status(status).json({ message: safeMessage });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // check if session is already full - has a participant
    if (session.participant) return res.status(409).json({ message: "Session is full" });

    session.participant = userId;
    await session.save();

    const chatClientInstance = chatClient.getInstance();
    const channel = chatClientInstance.channel("messaging", session.callId);
    await withTimeout(channel.addMembers([clerkId]), 8000, "Chat join");

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    const safeMessage = getSafeErrorMessage(error);
    const status = safeMessage.includes("timed out") ? 504 : 500;
    res.status(status).json({ message: safeMessage });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // delete stream video call
    const streamClientInstance = streamClient.getInstance();
    const chatClientInstance = chatClient.getInstance();
    const call = streamClientInstance.video.call("default", session.callId);
    const channel = chatClientInstance.channel("messaging", session.callId);

    await withTimeout(
      Promise.all([call.delete({ hard: true }), channel.delete()]),
      12000,
      "Session cleanup"
    );

    session.status = "completed";
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    const safeMessage = getSafeErrorMessage(error);
    const status = safeMessage.includes("timed out") ? 504 : 500;
    res.status(status).json({ message: safeMessage });
  }
}
