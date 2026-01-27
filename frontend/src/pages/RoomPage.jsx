import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { roomAPI, participantAPI, chatAPI, userAPI } from "../api/rooms.js";
import MultiUserVideoGrid from "../components/MultiUserVideoGrid.jsx";
import SharedCodeEditor from "../components/SharedCodeEditor.jsx";
import ParticipantsList from "../components/ParticipantsList.jsx";
import Navbar from "../components/Navbar.jsx";
import useRoomStreamClient from "../hooks/useRoomStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
import "./RoomPage.css";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState("guest");
  const [currentUserPermissions, setCurrentUserPermissions] = useState({});
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("video"); // video, chat, activity
  const [mongoUserId, setMongoUserId] = useState(() => localStorage.getItem("mongoUserId"));

  const {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  } = useRoomStreamClient(roomId);

  useEffect(() => {
    fetchRoomData();
    setupSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [roomId]);

  const ensureMongoUserId = async () => {
    if (mongoUserId) return mongoUserId;
    const { data } = await userAPI.getMe();
    const id = data?.id;
    if (id) {
      localStorage.setItem("mongoUserId", id);
      setMongoUserId(id);
    }
    return id;
  };

  const normalizeParticipants = (rawParticipants) =>
    (rawParticipants || []).map((p) => ({
      ...p,
      // backend returns populated user at p.userId
      user: p.user || p.userId,
      // frontend components expect mediaStatus object
      mediaStatus: p.mediaStatus || {
        cameraOn: !p.isCameraOff,
        microphoneOn: !p.isMuted,
        screenSharing: !!p.isScreenSharing,
      },
    }));

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      const roomResponse = await roomAPI.getRoom(roomId);
      setRoom(roomResponse.data);

      const participantsResponse = await participantAPI.getParticipants(roomId);
      const rawParticipants = participantsResponse.data.participants || participantsResponse.data;
      const normalized = normalizeParticipants(rawParticipants);
      setParticipants(normalized);

      // Get current user's role and permissions
      const myMongoId = await ensureMongoUserId();
      const currentUser = normalized.find((p) => p.user?._id === myMongoId);
      if (currentUser) {
        setCurrentUserRole(currentUser.role);
        setCurrentUserPermissions(currentUser.permissions);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load room: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const socketBaseUrl =
      import.meta.env.VITE_SERVER_URL ||
      (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
        : "http://localhost:4000");

    const connect = async () => {
      const myMongoId = await ensureMongoUserId();
      const newSocket = io(socketBaseUrl, {
        auth: { roomId, userId: myMongoId },
      });

      newSocket.on("connect", () => {
        console.log("Connected to room");
      });

      newSocket.on("participant-joined", (data) => {
        console.log("User joined:", data);
        fetchRoomData(); // Refresh participant list
      });

      newSocket.on("participant-left", (data) => {
        console.log("User left:", data);
        fetchRoomData();
      });

      // backend emits "new-message"
      newSocket.on("new-message", (data) => {
        setMessages((prev) => [...prev, data]);
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      setSocket(newSocket);
    };

    connect();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      await chatAPI.sendMessage(roomId, {
        message: messageInput,
        messageType: "text",
      });
      setMessageInput("");
    } catch (err) {
      alert("Failed to send message: " + err.message);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await roomAPI.leaveRoom(roomId);
      navigate("/rooms");
    } catch (err) {
      alert("Failed to leave room: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="room-page">
        <Navbar />
        <div className="loading-container">Loading room...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-page">
        <Navbar />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/rooms")}>Back to Rooms</button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-page">
      <Navbar />

      <div className="room-container">
        {/* Header */}
        <div className="room-header">
          <div className="room-info">
            <h1>{room?.name}</h1>
            <span className={`room-type-badge ${room?.roomType}`}>
              {room?.roomType}
            </span>
          </div>

          <div className="room-actions">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "← Hide" : "Show →"}
            </button>
            <button className="leave-btn" onClick={handleLeaveRoom}>
              Leave Room
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="room-content">
          {/* Tabs for different views */}
          <div className="content-tabs">
            <button
              className={`tab-btn ${activeTab === "video" ? "active" : ""}`}
              onClick={() => setActiveTab("video")}
            >
              📹 Video
            </button>
            <button
              className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              💬 Chat
            </button>
            <button
              className={`tab-btn ${activeTab === "activity" ? "active" : ""}`}
              onClick={() => setActiveTab("activity")}
            >
              📊 Activity
            </button>
          </div>

          {/* Main Panel */}
          <div className="main-panel">
            {activeTab === "video" && (
              <div className="video-section">
                {isInitializingCall ? (
                  <div className="video-loading">
                    <p>Connecting to room video call...</p>
                  </div>
                ) : !streamClient || !call ? (
                  <div className="video-error">
                    <p>Unable to connect to the room video call.</p>
                  </div>
                ) : (
                  <div className="h-full w-full">
                    <StreamVideo client={streamClient}>
                      <StreamCall call={call}>
                        <VideoCallUI
                          chatClient={chatClient}
                          channel={channel}
                          role={currentUserRole}
                          permissions={currentUserPermissions}
                          roomId={roomId}
                          initialRecordingActive={!!room?.recordingActive}
                        />
                      </StreamCall>
                    </StreamVideo>
                  </div>
                )}
              </div>
            )}

            {activeTab === "chat" && (
              <div className="chat-section">
                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="no-messages">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className="message">
                        <div className="message-avatar">
                          <img src={msg.senderAvatar} alt={msg.senderName} />
                        </div>
                        <div className="message-content">
                          <div className="message-header">
                            <strong>{msg.senderName}</strong>
                            <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
                          </div>
                          <p>{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="message-form">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={!currentUserPermissions.canChat}
                  />
                  <button
                    type="submit"
                    disabled={!currentUserPermissions.canChat}
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="activity-section">
                <div className="activity-placeholder">
                  📊 Activity log will be displayed here
                </div>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="editor-panel">
            <SharedCodeEditor
              roomId={roomId}
              socket={socket}
              canExecute={currentUserPermissions.canExecute}
              currentUserId={mongoUserId}
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="room-sidebar">
          <ParticipantsList
            roomId={roomId}
            currentUserRole={currentUserRole}
            participants={participants}
          />
        </aside>
      )}
    </div>
  );
}
