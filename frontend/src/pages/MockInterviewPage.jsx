import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageShell, { PageContainer } from "../components/PageShell";
import { interviewApi } from "../api/interviews";

export default function MockInterviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [evaluation, setEvaluation] = useState(null);

  const [form, setForm] = useState({
    title: "",
    resumeText: "",
    jobDescriptionText: "",
  });

  const activeQuestion = useMemo(() => {
    if (!interview?.transcript?.length) return "";
    return interview.transcript[interview.transcript.length - 1]?.question || "";
  }, [interview]);

  const onCreateAndStart = async () => {
    setLoading(true);
    try {
      const created = await interviewApi.createInterview({
        type: "mock",
        title: form.title,
        resumeText: form.resumeText,
        jobDescriptionText: form.jobDescriptionText,
      });

      const started = await interviewApi.startInterview(created.interview._id, {
        webcamEnabled: true,
        screenShareEnabled: true,
        faceVisible: true,
      });

      setInterview(started.interview);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAnswer = async () => {
    if (!interview?._id || !answerText.trim()) return;
    setLoading(true);
    try {
      const data = await interviewApi.submitAnswer(interview._id, {
        answerText,
        answerSource: "text",
      });
      setInterview(data.interview);
      setAnswerText("");
    } finally {
      setLoading(false);
    }
  };

  const onComplete = async () => {
    if (!interview?._id) return;
    setLoading(true);
    try {
      const data = await interviewApi.completeInterview(interview._id);
      setEvaluation(data.evaluation);
      const refreshed = await interviewApi.getInterviewById(interview._id);
      setInterview(refreshed.interview);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <Navbar />
      <main className="py-8">
        <PageContainer>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">AI Mock Interview</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Resume/JD-aware interview with dynamic questions and instant evaluation.
              </p>
            </div>
            <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>Back</button>
          </div>

          {!interview && (
            <div className="mt-6 card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body gap-4">
                <h2 className="card-title">Start Mock Interview</h2>
                <input
                  className="input input-bordered w-full"
                  placeholder="Interview title (optional)"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
                <textarea
                  className="textarea textarea-bordered min-h-36"
                  placeholder="Paste resume text"
                  value={form.resumeText}
                  onChange={(e) => setForm((p) => ({ ...p, resumeText: e.target.value }))}
                />
                <textarea
                  className="textarea textarea-bordered min-h-36"
                  placeholder="Paste job description text"
                  value={form.jobDescriptionText}
                  onChange={(e) => setForm((p) => ({ ...p, jobDescriptionText: e.target.value }))}
                />
                <div className="card-actions justify-end">
                  <button className="btn btn-primary" disabled={loading} onClick={onCreateAndStart}>
                    {loading ? "Starting..." : "Create & Start"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {interview && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title">Live Interview</h2>
                  <p className="text-xs text-muted-foreground">Interview ID: {interview._id}</p>

                  <div className="rounded-lg bg-base-200 p-4 mt-2">
                    <p className="text-sm uppercase tracking-wide text-primary font-semibold">Current Question</p>
                    <p className="mt-2">{activeQuestion || "Generating question..."}</p>
                  </div>

                  <textarea
                    className="textarea textarea-bordered min-h-32 mt-4"
                    placeholder="Type your answer..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />

                  <div className="flex gap-2 mt-2">
                    <button className="btn btn-primary" disabled={loading || !answerText.trim()} onClick={onSubmitAnswer}>
                      Submit Answer
                    </button>
                    <button className="btn btn-success" disabled={loading} onClick={onComplete}>
                      Complete & Evaluate
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-semibold">Conversation</p>
                    <div className="mt-2 max-h-72 overflow-auto space-y-3">
                      {(interview.transcript || []).map((turn, idx) => (
                        <div key={idx} className="rounded border border-base-300 p-3">
                          <p className="text-sm"><span className="font-semibold">Q:</span> {turn.question}</p>
                          {turn.answerText ? (
                            <p className="text-sm mt-2"><span className="font-semibold">A:</span> {turn.answerText}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title">Interview Insights</h2>
                  <p className="text-sm">Type: <span className="badge badge-outline">{interview.type}</span></p>
                  <p className="text-sm">Status: <span className="badge badge-secondary">{interview.status}</span></p>
                  <p className="text-sm">Resume-JD Match: {interview.resumeJdMatchScore ?? "N/A"}</p>

                  <div className="mt-3">
                    <p className="font-semibold text-sm">Detected Skills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(interview.extractedSkills || []).map((skill) => (
                        <span className="badge badge-primary badge-outline" key={skill}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  {evaluation ? (
                    <div className="mt-5">
                      <p className="font-semibold">Evaluation</p>
                      <ul className="mt-2 text-sm space-y-1">
                        <li>Technical: {evaluation.scores?.technical ?? "-"}</li>
                        <li>Communication: {evaluation.scores?.communication ?? "-"}</li>
                        <li>Confidence: {evaluation.scores?.confidence ?? "-"}</li>
                        <li>Behavioral: {evaluation.scores?.behavioral ?? "-"}</li>
                        <li className="font-semibold">Overall: {evaluation.scores?.overall ?? "-"}</li>
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </PageContainer>
      </main>
      <Footer />
    </PageShell>
  );
}
