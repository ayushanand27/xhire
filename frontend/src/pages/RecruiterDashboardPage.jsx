import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageShell, { PageContainer } from "../components/PageShell";
import { interviewApi } from "../api/interviews";
import { userApi } from "../api/users";

export default function RecruiterDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({ summary: null, interviews: [] });
  const [candidates, setCandidates] = useState([]);

  const [form, setForm] = useState({
    title: "",
    candidateId: "",
    resumeText: "",
    jobDescriptionText: "",
  });

  const topCandidates = useMemo(() => {
    return [...(dashboard.interviews || [])]
      .filter((i) => typeof i.evaluation?.scores?.overall === "number")
      .sort((a, b) => b.evaluation.scores.overall - a.evaluation.scores.overall)
      .slice(0, 10);
  }, [dashboard.interviews]);

  const load = async () => {
    setLoading(true);
    try {
      const [dash, dir] = await Promise.all([
        interviewApi.recruiterDashboard(),
        userApi.getDirectory({ role: "candidate" }),
      ]);
      setDashboard(dash);
      setCandidates(dir.users || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createProctored = async () => {
    if (!form.candidateId) return;
    setLoading(true);
    try {
      await interviewApi.createInterview({
        type: "proctored",
        title: form.title,
        candidateId: form.candidateId,
        resumeText: form.resumeText,
        jobDescriptionText: form.jobDescriptionText,
      });
      setForm({ title: "", candidateId: "", resumeText: "", jobDescriptionText: "" });
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <Navbar />
      <main className="py-8">
        <PageContainer>
          <div>
            <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Schedule proctored interviews, monitor performance, and compare candidates.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <CardStat title="Total Interviews" value={dashboard.summary?.total ?? 0} />
            <CardStat title="Completed" value={dashboard.summary?.completed ?? 0} />
            <CardStat title="Avg Overall Score" value={dashboard.summary?.avgOverallScore ?? 0} />
          </div>

          <div className="mt-6 card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Schedule Proctored Interview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="input input-bordered"
                  placeholder="Interview title"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />

                <select
                  className="select select-bordered"
                  value={form.candidateId}
                  onChange={(e) => setForm((p) => ({ ...p, candidateId: e.target.value }))}
                >
                  <option value="">Select candidate</option>
                  {candidates.map((c) => (
                    <option value={c._id} key={c._id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <textarea
                className="textarea textarea-bordered min-h-28 mt-1"
                placeholder="Candidate resume text"
                value={form.resumeText}
                onChange={(e) => setForm((p) => ({ ...p, resumeText: e.target.value }))}
              />
              <textarea
                className="textarea textarea-bordered min-h-28"
                placeholder="Job description text"
                value={form.jobDescriptionText}
                onChange={(e) => setForm((p) => ({ ...p, jobDescriptionText: e.target.value }))}
              />

              <div className="card-actions justify-end">
                <button className="btn btn-primary" disabled={loading || !form.candidateId} onClick={createProctored}>
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <h2 className="card-title">Recent Interviews</h2>
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboard.interviews || []).slice(0, 12).map((i) => (
                        <tr key={i._id}>
                          <td>{i.candidate?.name || "-"}</td>
                          <td><span className="badge badge-outline">{i.status}</span></td>
                          <td>{i.type}</td>
                          <td>{i.evaluation?.scores?.overall ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <h2 className="card-title">Top Candidates</h2>
                <div className="space-y-3">
                  {topCandidates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No evaluated candidates yet.</p>
                  ) : (
                    topCandidates.map((i) => (
                      <div key={i._id} className="border border-base-300 rounded-lg p-3">
                        <p className="font-semibold">{i.candidate?.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{i.candidate?.email || "-"}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="badge badge-primary">Overall {i.evaluation?.scores?.overall ?? "-"}</span>
                          <span className="badge badge-outline">Tech {i.evaluation?.scores?.technical ?? "-"}</span>
                          <span className="badge badge-outline">Comm {i.evaluation?.scores?.communication ?? "-"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </PageShell>
  );
}

function CardStat({ title, value }) {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body py-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}
