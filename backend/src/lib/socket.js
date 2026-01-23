import { Server as SocketIOServer } from "socket.io";
import { Room } from "../models/Room.js";
import { User } from "../models/User.js";

// This file sets up real-time communication for the collaboration platform
// Add this to your backend/src/lib/socket.js

export const initializeSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    const roomId = socket.handshake.auth.roomId;

    if (!userId || !roomId) {
      return next(new Error("Missing userId or roomId"));
    }

    socket.userId = userId;
    socket.roomId = roomId;
    socket.data.userId = userId;
    socket.data.roomId = roomId;

    next();
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected to room ${socket.roomId}`);

    // Join room-specific namespace
    socket.join(socket.roomId);

    // Emit participant joined event
    io.to(socket.roomId).emit("participant-joined", {
      userId: socket.userId,
      timestamp: new Date(),
    });

    // ========================
    // CODE EDITOR EVENTS
    // ========================

    // Real-time code update (any user can type if they have permission)
    socket.on("code-updated", async (data) => {
      const { code, language, cursorPosition, userId: senderId } = data;

      try {
        // Verify user has edit permission
        const room = await Room.findById(socket.roomId);
        const participant = room.getParticipant(senderId);

        if (!participant.permissions.canEdit) {
          socket.emit("permission-denied", {
            message: "You do not have permission to edit code",
          });
          return;
        }

        // Update shared code in database
        room.sharedCode = {
          code,
          language,
          lastEditedBy: senderId,
          lastEditedAt: new Date(),
        };
        await room.save();

        // Broadcast to all other users in room
        socket.broadcast.to(socket.roomId).emit("code-updated", {
          code,
          language,
          cursorPosition,
          userId: senderId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error updating code:", error);
        socket.emit("error", { message: "Failed to update code" });
      }
    });

    // Cursor position for multi-user editing
    socket.on("cursor-position", (data) => {
      socket.broadcast.to(socket.roomId).emit("cursor-position", {
        userId: socket.userId,
        line: data.line,
        column: data.column,
        userName: data.userName,
      });
    });

    // Code execution
    socket.on("execute-code", async (data) => {
      const { code, language } = data;

      try {
        // Verify user has execute permission
        const room = await Room.findById(socket.roomId);
        const participant = room.getParticipant(socket.userId);

        if (!participant.permissions.canExecute) {
          socket.emit("permission-denied", {
            message: "You do not have permission to execute code",
          });
          return;
        }

        // TODO: Call Piston API to execute code
        // const result = await executeCode(code, language);

        // Broadcast result to all users
        io.to(socket.roomId).emit("code-execution-result", {
          userId: socket.userId,
          output: "Code execution result here", // replace with actual result
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error executing code:", error);
        socket.emit("execution-error", { message: error.message });
      }
    });

    // ========================
    // VIDEO/SCREEN SHARING EVENTS
    // ========================

    // Screen share started
    socket.on("screen-share-started", async (data) => {
      try {
        const room = await Room.findById(socket.roomId);
        const participant = room.getParticipant(socket.userId);

        if (!participant.permissions.canScreenShare) {
          socket.emit("permission-denied", {
            message: "You do not have permission to screen share",
          });
          return;
        }

        // Update participant status
        participant.isScreenSharing = true;
        await room.save();

        // Notify all users
        io.to(socket.roomId).emit("screen-share-started", {
          userId: socket.userId,
          userName: data.userName,
        });
      } catch (error) {
        console.error("Error starting screen share:", error);
        socket.emit("error", { message: "Failed to start screen share" });
      }
    });

    // Screen share stopped
    socket.on("screen-share-stopped", async (data) => {
      try {
        const room = await Room.findById(socket.roomId);
        const participant = room.getParticipant(socket.userId);
        participant.isScreenSharing = false;
        await room.save();

        io.to(socket.roomId).emit("screen-share-stopped", {
          userId: socket.userId,
        });
      } catch (error) {
        console.error("Error stopping screen share:", error);
      }
    });

    // ========================
    // MEDIA CONTROL EVENTS
    // ========================

    // Mute/unmute
    socket.on("toggle-mute", async (data) => {
      try {
        const room = await Room.findById(socket.roomId);
        const participant = room.getParticipant(socket.userId);
        participant.isMuted = data.isMuted;
        await room.save();

        io.to(socket.roomId).emit("user-muted", {
          userId: socket.userId,
          isMuted: data.isMuted,
        });
      } catch (error) {
        console.error("Error toggling mute:", error);
      }
    });

    // Camera on/off
    socket.on("toggle-camera", async (data) => {
      try {
        const room = await Room.findById(socket.roomId);
        const participant = room.getParticipant(socket.userId);
        participant.isCameraOff = data.isCameraOff;
        await room.save();

        io.to(socket.roomId).emit("user-camera-toggled", {
          userId: socket.userId,
          isCameraOff: data.isCameraOff,
        });
      } catch (error) {
        console.error("Error toggling camera:", error);
      }
    });

    // ========================
    // CHAT EVENTS
    // ========================

    // Send message (real-time + Stream.io)
    socket.on("send-message", async (data) => {
      try {
        const room = await Room.findById(socket.roomId);
        const participant = room.getParticipant(socket.userId);

        if (!participant.permissions.canChat) {
          socket.emit("permission-denied", {
            message: "You do not have permission to chat",
          });
          return;
        }

        io.to(socket.roomId).emit("new-message", {
          userId: socket.userId,
          userName: data.userName,
          message: data.message,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // ========================
    // PARTICIPANT EVENTS
    // ========================

    // Participant list request
    socket.on("request-participants", async () => {
      try {
        const room = await Room.findById(socket.roomId).populate(
          "participants.userId",
          "name email clerkId"
        );

        socket.emit("participants-list", {
          participants: room.participants,
          count: room.participants.length,
        });
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    });

    // Participant role changed
    socket.on("role-changed", (data) => {
      io.to(socket.roomId).emit("participant-role-changed", {
        userId: data.userId,
        newRole: data.newRole,
        changedBy: socket.userId,
      });
    });

    // ========================
    // ROOM EVENTS
    // ========================

    // Room settings changed (creator only)
    socket.on("room-settings-changed", (data) => {
      socket.broadcast.to(socket.roomId).emit("room-settings-changed", {
        settings: data,
        changedBy: socket.userId,
      });
    });

    // ========================
    // DISCONNECT EVENTS
    // ========================

    socket.on("disconnect", async () => {
      console.log(`User ${socket.userId} disconnected from room ${socket.roomId}`);

      try {
        const room = await Room.findById(socket.roomId);

        // If creator leaves and no one else is in room, archive it
        if (room.isCreator(socket.userId) && room.participants.length === 1) {
          room.status = "inactive";
          await room.save();
        }

        // Notify other users
        io.to(socket.roomId).emit("participant-left", {
          userId: socket.userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

// Export utility functions for broadcasting events
export const broadcastToRoom = (io, roomId, event, data) => {
  io.to(roomId).emit(event, data);
};

export const broadcastExcept = (io, roomId, userId, event, data) => {
  io.to(roomId).except(userId).emit(event, data);
};
