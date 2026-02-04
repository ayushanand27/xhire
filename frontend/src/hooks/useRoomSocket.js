import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

/**
 * Custom hook for Socket.IO room connection
 * Handles all real-time communication for the collaboration platform
 */
export const useRoomSocket = (roomId, userId, userName) => {
  const socketRef = useRef(null);
  const connectedRef = useRef(false);

  const socketBaseUrl =
    import.meta.env.VITE_SERVER_URL ||
    (import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, "").replace(/\/api\/?$/, "")
      : "http://localhost:4000");

  // Initialize socket connection
  useEffect(() => {
    if (!roomId || !userId) return;

    socketRef.current = io(socketBaseUrl, {
      auth: {
        userId,
        roomId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to room socket");
      connectedRef.current = true;
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from room socket");
      connectedRef.current = false;
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, userId, socketBaseUrl]);

  // ========================
  // CODE EDITOR FUNCTIONS
  // ========================

  const updateCode = useCallback(
    (code, language, cursorPosition = null) => {
      if (socketRef.current && connectedRef.current) {
        socketRef.current.emit("code-updated", {
          code,
          language,
          cursorPosition,
          userId,
        });
      }
    },
    [userId]
  );

  const updateCursorPosition = useCallback(
    (line, column) => {
      if (socketRef.current && connectedRef.current) {
        socketRef.current.emit("cursor-position", {
          line,
          column,
          userName,
        });
      }
    },
    [userName]
  );

  const executeCode = useCallback((code, language) => {
    if (socketRef.current && connectedRef.current) {
      socketRef.current.emit("execute-code", {
        code,
        language,
      });
    }
  }, []);

  // ========================
  // SCREEN SHARING FUNCTIONS
  // ========================

  const startScreenShare = useCallback(() => {
    if (socketRef.current && connectedRef.current) {
      socketRef.current.emit("screen-share-started", {
        userName,
      });
    }
  }, [userName]);

  const stopScreenShare = useCallback(() => {
    if (socketRef.current && connectedRef.current) {
      socketRef.current.emit("screen-share-stopped");
    }
  }, []);

  // ========================
  // MEDIA CONTROL FUNCTIONS
  // ========================

  const toggleMute = useCallback((isMuted) => {
    if (socketRef.current && connectedRef.current) {
      socketRef.current.emit("toggle-mute", { isMuted });
    }
  }, []);

  const toggleCamera = useCallback((isCameraOff) => {
    if (socketRef.current && connectedRef.current) {
      socketRef.current.emit("toggle-camera", { isCameraOff });
    }
  }, []);

  // ========================
  // CHAT FUNCTIONS
  // ========================

  const sendMessage = useCallback(
    (message) => {
      if (socketRef.current && connectedRef.current) {
        socketRef.current.emit("send-message", {
          userName,
          message,
        });
      }
    },
    [userName]
  );

  // ========================
  // PARTICIPANT FUNCTIONS
  // ========================

  const requestParticipants = useCallback(() => {
    if (socketRef.current && connectedRef.current) {
      socketRef.current.emit("request-participants");
    }
  }, []);

  // ========================
  // EVENT LISTENERS
  // ========================

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  const once = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.once(event, callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected: connectedRef.current,

    // Code editor
    updateCode,
    updateCursorPosition,
    executeCode,

    // Screen sharing
    startScreenShare,
    stopScreenShare,

    // Media controls
    toggleMute,
    toggleCamera,

    // Chat
    sendMessage,

    // Participants
    requestParticipants,

    // Event management
    on,
    off,
    once,
  };
};

/**
 * Hook to listen for room events
 * Usage: const { codeUpdated, participantJoined } = useRoomEvents(roomId);
 */
export const useRoomEvents = (roomId, callback) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const baseUrl =
      import.meta.env.VITE_SERVER_URL ||
      (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, "").replace(/\/api\/?$/, "")
        : "http://localhost:4000");

    socketRef.current = io(baseUrl);

    // All possible room events
    const events = [
      "participant-joined",
      "participant-left",
      "code-updated",
      "cursor-position",
      "code-execution-result",
      "execution-error",
      "screen-share-started",
      "screen-share-stopped",
      "user-muted",
      "user-camera-toggled",
      "new-message",
      "participants-list",
      "participant-role-changed",
      "room-settings-changed",
      "permission-denied",
      "error",
    ];

    events.forEach((event) => {
      socketRef.current.on(event, (data) => {
        if (callback) {
          callback({ event, data });
        }
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, callback]);
};
