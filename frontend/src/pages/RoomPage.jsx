import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { roomAPI, participantAPI, chatAPI, userAPI } from "../api/rooms.js";
import SharedCodeEditor from "../components/SharedCodeEditor.jsx";
import ParticipantsList from "../components/ParticipantsList.jsx";
import Navbar from "../components/Navbar.jsx";
import useRoomStreamClient from "../hooks/useRoomStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
import "./RoomPage.css";
import PageShell, { PageContainer } from "../components/PageShell.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import toast from "react-hot-toast";

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
  const [mongoUserId, setMongoUserId] = useState(() => localStorage.getItem("mongoUserId"));
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSending, setInviteSending] = useState(false);

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
        toast.error("Real-time connection error");
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
      toast.error("Failed to send message: " + (err.message || "Unknown error"));
    }
  };

  const handleLeaveRoom = async () => {
    const confirmed = confirm("Leave this room? You may need an invite to rejoin.");
    if (!confirmed) return;
    try {
      await roomAPI.leaveRoom(roomId);
      toast.success("You left the room");
      navigate("/rooms");
    } catch (err) {
      toast.error("Failed to leave room: " + (err.message || "Unknown error"));
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Room link copied");
    } catch (_) {
      toast.error("Failed to copy link");
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Enter an email to invite");
      return;
    }

    try {
      setInviteSending(true);
      await roomAPI.inviteToRoom(roomId, {
        email: inviteEmail.trim(),
        message: inviteMessage.trim(),
      });
      toast.success("Invite sent");
      setInviteEmail("");
      setInviteMessage("");
      setInviteOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send invite");
    } finally {
      setInviteSending(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <Navbar />
        <PageContainer>
          <div className="py-10 text-muted-foreground">Loading room...</div>
        </PageContainer>
      </PageShell>
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
    <PageShell>
      <Navbar />

      <PageContainer>
        {/* Header */}
        <div className="rounded-app border border-border/60 bg-background/70 shadow-elevate px-5 py-4 mt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{room?.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full bg-muted px-2.5 py-1 border border-border">{room?.roomType}</span>
                <span className="rounded-full bg-muted px-2.5 py-1 border border-border">Up to {room?.config?.maxParticipants || room?.maxParticipants || 5} participants</span>
                <span className="rounded-full bg-muted px-2.5 py-1 border border-border">Realtime editor</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80" onClick={handleCopyLink}>
                Copy Link
              </button>
              <button className="px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80" onClick={() => setInviteOpen(!inviteOpen)}>
                Invite by Email
              </button>
              <button className="px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              </button>
              <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground" onClick={handleLeaveRoom}>
                Leave Room
              </button>
            </div>
          </div>

          {inviteOpen && (
            <form onSubmit={handleInvite} className="mt-4 grid gap-3 md:grid-cols-[1.5fr_1fr_auto]">
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Invite by Gmail (e.g. teammate@gmail.com)"
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                />
                <input
                  type="text"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Optional message"
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                />
              </div>
              <div className="rounded-app bg-muted/60 border border-border p-3 text-sm text-muted-foreground">
                Sends a Gmail invite with your meeting link. Make sure SMTP is configured on the server.
              </div>
              <div className="flex items-start gap-2">
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground" disabled={inviteSending}>
                  {inviteSending ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-4 pb-10 mt-4">
          {/* Left: Video */}
          <div className="lg:col-span-8 space-y-3">
            <div className="rounded-lg bg-muted ring-1 ring-border/60 overflow-hidden">
              {isInitializingCall ? (
                <div className="p-6 text-muted-foreground">Connecting to room video call...</div>
              ) : !streamClient || !call ? (
                <div className="p-6 text-muted-foreground">Unable to connect to the room video call.</div>
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
          </div>

          {/* Right: Code + Chat */}
          <div className="lg:col-span-4 space-y-3">
            <div className="h-[340px] rounded-lg bg-muted ring-1 ring-border/60 overflow-hidden">
              <SharedCodeEditor
                roomId={roomId}
                socket={socket}
                canExecute={currentUserPermissions.canExecute}
                currentUserId={mongoUserId}
              />
            </div>
            <div className="h-[260px]">
              <ChatPanel
                items={messages.map((m) => ({ author: m.senderName || "User", text: m.message }))}
                onSend={(text) => {
                  setMessageInput(text);
                  const fakeEvent = { preventDefault: () => {} };
                  handleSendMessage(fakeEvent);
                }}
              />
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="border-t border-border/40 bg-background/60">
          <PageContainer className="py-4">
            <ParticipantsList roomId={roomId} currentUserRole={currentUserRole} participants={participants} />
          </PageContainer>
        </div>
      )}
    </PageShell>
  );
}
