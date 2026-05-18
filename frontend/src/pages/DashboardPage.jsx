import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageShell, { PageContainer } from "../components/PageShell.jsx";
import interviewApiV2 from "../api/interviewsV2";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeClass = (status) => {
  switch ((status || "").toUpperCase()) {
    case "COMPLETED":
      return "badge-success";
    case "ACTIVE":
      return "badge-warning";
    case "TERMINATED":
      return "badge-error";
    default:
      return "badge-neutral";
  }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await interviewApiV2.listSessions();
      setSessions(Array.isArray(data?.sessions) ? data.sessions : []);
    } catch (err) {
      setError(err?.message || "Failed to load sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter((session) => session.status === "COMPLETED").length;
    const active = sessions.filter((session) => session.status === "ACTIVE").length;

    return { total, completed, active };
  }, [sessions]);

  return (
    <PageShell>
      <Navbar />

      <main className="py-8">
        <PageContainer>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review your past interview sessions and start a new one anytime.
              </p>
            </div>

            <button className="btn btn-primary" onClick={() => navigate("/start")}> 
              Start New Interview
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-app border border-border/60 bg-background/70 p-5 shadow-elevate">
              <p className="text-sm text-muted-foreground">Total sessions</p>
              <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
            </div>
            <div className="rounded-app border border-border/60 bg-background/70 p-5 shadow-elevate">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="mt-2 text-3xl font-semibold">{stats.completed}</p>
            </div>
            <div className="rounded-app border border-border/60 bg-background/70 p-5 shadow-elevate">
              <p className="text-sm text-muted-foreground">In progress</p>
              <p className="mt-2 text-3xl font-semibold">{stats.active}</p>
            </div>
          </div>

          <section className="mt-8 rounded-app border border-border/60 bg-background/70 shadow-elevate">
            <div className="border-b border-border/60 p-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Past sessions</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Date, status, and evaluation summary for each interview.
                </p>
              </div>

              <button className="btn btn-ghost btn-sm" onClick={loadSessions} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="p-5">
              {error ? (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              ) : null}

              {loading ? (
                <div className="flex items-center gap-3 py-10 text-muted-foreground">
                  <span className="loading loading-spinner loading-md" />
                  Loading sessions...
                </div>
              ) : sessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 p-10 text-center text-muted-foreground">
                  No interview sessions yet. Start your first one and come back here to track progress.
                </div>
              ) : (
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <article
                      key={session.id}
                      className="rounded-lg border border-border/60 bg-base-100 p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">Interview session</h3>
                            <span className={`badge ${getStatusBadgeClass(session.status)}`}>
                              {session.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Date: {formatDate(session.startedAt || session.createdAt)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 break-all">Session ID: {session.id}</p>
                        </div>

                        <div className="min-w-36 rounded-lg bg-base-200 px-4 py-3 text-center">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall score</p>
                          <p className="mt-1 text-3xl font-bold">
                            {session.overallScore ?? "—"}
                          </p>
                        </div>
                      </div>

                      {session.evaluation ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                          <div className="rounded-md bg-base-200 p-3">
                            <p className="text-muted-foreground">Technical</p>
                            <p className="font-semibold">{session.evaluation.technicalScore ?? "—"}</p>
                          </div>
                          <div className="rounded-md bg-base-200 p-3">
                            <p className="text-muted-foreground">Communication</p>
                            <p className="font-semibold">{session.evaluation.communicationScore ?? "—"}</p>
                          </div>
                          <div className="rounded-md bg-base-200 p-3">
                            <p className="text-muted-foreground">Confidence</p>
                            <p className="font-semibold">{session.evaluation.confidenceScore ?? "—"}</p>
                          </div>
                          <div className="rounded-md bg-base-200 p-3">
                            <p className="text-muted-foreground">Behavioral</p>
                            <p className="font-semibold">{session.evaluation.behavioralScore ?? "—"}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-muted-foreground">
                          No evaluation yet. Finish the session to see your score here.
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </PageContainer>
      </main>

      <Footer />
    </PageShell>
  );
}