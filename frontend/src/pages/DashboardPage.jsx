import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import PageShell, { PageContainer } from "../components/PageShell.jsx";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ title: "" });

  const createSessionMutation = useCreateSession();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();

  const handleCreateRoom = () => {
    createSessionMutation.mutate(
      {
        title: roomConfig.title,
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          setRoomConfig({ title: "" });
          navigate(`/session/${data.session._id}`);
        },
      }
    );
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user.id) return false;

    return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
  };

  return (
    <PageShell>
      <Navbar />

      {/* Hero/Welcome with gradient backdrop */}
      <section className="relative border-b border-primary/10 bg-gradient-to-b from-base-200/50 via-base-100/50 to-transparent backdrop-blur-sm overflow-hidden">
        {/* Animated background blur elements */}
        <div className="absolute top-0 right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 left-0 w-96 h-96 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-3xl" />
        
        <PageContainer>
          <div className="py-8 relative z-10">
            <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />
          </div>
        </PageContainer>
      </section>

      {/* Dashboard content */}
      <main className="py-8">
        <PageContainer>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <StatsCards
                activeSessionsCount={activeSessions.length}
                recentSessionsCount={recentSessions.length}
              />
              <div className="rounded-app border border-border/60 bg-background/70 p-5 shadow-elevate">
                <h3 className="text-base font-semibold">Quick actions</h3>
                <p className="text-sm text-muted-foreground mt-1">Create sessions, invite people, or practice solo.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="ripple btn btn-primary" onClick={() => setShowCreateModal(true)}>Create Session</button>
                  <button className="ripple btn btn-ghost" onClick={() => navigate("/rooms")}>Browse Rooms</button>
                  <button className="ripple btn btn-ghost" onClick={() => navigate("/practice")}>Practice</button>
                </div>
              </div>
              <div className="rounded-app border border-border/60 bg-background/70 p-5 shadow-elevate">
                <h3 className="text-base font-semibold">Invite teammates</h3>
                <p className="text-sm text-muted-foreground mt-1">Create a room and send the link to up to 5 participants.</p>
                <div className="mt-4 text-sm text-muted-foreground">
                  Tip: Open any room and use “Invite by Email”.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ActiveSessions
                sessions={activeSessions}
                isLoading={loadingActiveSessions}
                isUserInSession={isUserInSession}
              />
            </div>

            <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
          </div>
        </PageContainer>
      </main>

      <Footer />

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
      />
    </PageShell>
  );
}

export default DashboardPage;
