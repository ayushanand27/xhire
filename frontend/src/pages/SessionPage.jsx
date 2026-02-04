import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { problemsApi } from "../api/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
import { testsApi } from "../api/tests";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  // problem metadata from API
  const [problemData, setProblemData] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [errorProblem, setErrorProblem] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchProblem() {
      if (!session?.problem) {
        setProblemData(null);
        return;
      }
      try {
        setLoadingProblem(true);
        setErrorProblem(null);
        const { data } = await problemsApi.getByTitle(session.problem);
        if (!mounted) return;
        const res = Array.isArray(data?.problems) ? data.problems[0] : (data?.problem || data);
        setProblemData(res || null);
      } catch (e) {
        if (!mounted) return;
        setErrorProblem(e.message || "Failed to load problem metadata");
      } finally {
        mounted && setLoadingProblem(false);
      }
    }
    fetchProblem();
    return () => {
      mounted = false;
    };
  }, [session?.problem]);

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // auto-join session if user is not already a participant and not the host
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;

    joinSessionMutation.mutate(id, { onSuccess: refetch });

    // remove the joinSessionMutation, refetch from dependencies to avoid infinite loop
  }, [session, user, loadingSession, isHost, isParticipant, id]);

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  // update code when problem loads or changes
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    } else {
      setCode("");
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // use problem-specific starter code
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setTestResults(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleRunTests = async () => {
    if (selectedLanguage !== "javascript") {
      setOutput({
        success: false,
        error: "Test runner currently supports only JavaScript.",
      });
      return;
    }

    if (!problemData) {
      setOutput({
        success: false,
        error: "No practice problem is selected for this session. Use Practice to run problem tests.",
      });
      return;
    }

    try {
      setIsTesting(true);
      setTestResults(null);

      const description = [
        problemData.description?.text,
        ...(problemData.description?.notes || []),
      ]
        .filter(Boolean)
        .join("\n\n");

      const { data: gen } = await testsApi.generate({
        description,
        examples: problemData.examples || [],
        constraints: problemData.constraints || [],
      });

      const { data: run } = await testsApi.run({
        code,
        tests: gen.tests,
      });

      setTestResults(run.results || []);
      setOutput({
        success: run.success,
        output: run.rawOutput,
        error: run.errorOutput,
      });
    } catch (error) {
      setOutput({
        success: false,
        error: error.message || "Failed to run tests",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // this will navigate the HOST to dashboard
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - CODE EDITOR & PROBLEM DETAILS */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              {/* PROBLEM DSC PANEL */}
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full overflow-y-auto bg-muted">
                  {/* HEADER SECTION */}
                  <div className="p-6 bg-background border-b border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground">
                          {session?.title || session?.problem || "Loading..."}
                        </h1>
                        {session?.problem ? (
                          <>
                            {loadingProblem && (
                              <p className="text-muted-foreground mt-1">Loading problem…</p>
                            )}
                            {errorProblem && !loadingProblem && (
                              <p className="text-error mt-1">{errorProblem}</p>
                            )}
                            {problemData?.category && !loadingProblem && (
                              <p className="text-muted-foreground mt-1">{problemData.category}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-muted-foreground mt-2">
                            This is a live collaboration session. Use <span className="font-semibold">Practice</span> for coding questions.
                          </p>
                        )}
                        <p className="text-muted-foreground mt-2">
                          Host: {session?.host?.name || "Loading..."} •{" "}
                          {session?.participant ? 2 : 1}/2 participants
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {!!session?.difficulty && (
                          <span
                            className={`badge badge-lg ${getDifficultyBadgeClass(
                              session?.difficulty
                            )}`}
                          >
                            {session?.difficulty.slice(0, 1).toUpperCase() +
                              session?.difficulty.slice(1)}
                          </span>
                        )}
                        {isHost && session?.status === "active" && (
                          <button
                            onClick={handleEndSession}
                            disabled={endSessionMutation.isPending}
                            className="btn btn-error btn-sm gap-2"
                          >
                            {endSessionMutation.isPending ? (
                              <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : (
                              <LogOutIcon className="w-4 h-4" />
                            )}
                            End Session
                          </button>
                        )}
                        {session?.status === "completed" && (
                          <span className="badge badge-ghost badge-lg">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {!session?.problem && (
                      <div className="bg-background rounded-app shadow-elevate p-5 border border-border">
                        <h2 className="text-xl font-bold mb-2 text-foreground">Live Collaboration</h2>
                        <p className="text-sm text-muted-foreground">
                          This session isn’t tied to a coding question. Use the editor and call to collaborate, and use <span className="font-semibold">Practice</span> for problem-solving.
                        </p>
                      </div>
                    )}

                    {/* problem desc */}
                    {problemData?.description && (
                      <div className="bg-background rounded-app shadow-elevate p-5 border border-border">
                        <h2 className="text-xl font-bold mb-4 text-foreground">Description</h2>
                        <div className="space-y-3 text-base leading-relaxed">
                          <p className="text-foreground/90">{problemData.description.text}</p>
                          {problemData.description.notes?.map((note, idx) => (
                            <p key={idx} className="text-foreground/90">
                              {note}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* examples section */}
                    {problemData?.examples && problemData.examples.length > 0 && (
                      <div className="bg-background rounded-app shadow-elevate p-5 border border-border">
                        <h2 className="text-xl font-bold mb-4 text-foreground">Examples</h2>

                        <div className="space-y-4">
                          {problemData.examples.map((example, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-sm">{idx + 1}</span>
                                <p className="font-semibold text-base-content">Example {idx + 1}</p>
                              </div>
                              <div className="bg-muted rounded-app p-4 font-mono text-sm space-y-1.5">
                                <div className="flex gap-2">
                                  <span className="text-primary font-bold min-w-[70px]">
                                    Input:
                                  </span>
                                  <span>{example.input}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-secondary font-bold min-w-[70px]">
                                    Output:
                                  </span>
                                  <span>{example.output}</span>
                                </div>
                                {example.explanation && (
                                  <div className="pt-2 border-t border-border mt-2">
                                    <span className="text-muted-foreground font-sans text-xs">
                                      <span className="font-semibold">Explanation:</span>{" "}
                                      {example.explanation}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Constraints */}
                    {problemData?.constraints && problemData.constraints.length > 0 && (
                      <div className="bg-background rounded-app shadow-elevate p-5 border border-border">
                        <h2 className="text-xl font-bold mb-4 text-foreground">Constraints</h2>
                        <ul className="space-y-2 text-foreground/90">
                          {problemData.constraints.map((constraint, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-primary">•</span>
                              <code className="text-sm">{constraint}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-muted hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={50} minSize={20}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={70} minSize={30}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      isTesting={isTesting}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={(value) => setCode(value)}
                      onRunCode={handleRunCode}
                      onRunTests={handleRunTests}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-muted hover:bg-primary transition-colors cursor-row-resize" />

                  <Panel defaultSize={30} minSize={15}>
                    <OutputPanel output={output} testResults={testResults} />
                    {testResults && (
                      <div className="p-4 bg-background border-t border-border">
                        <div className="mb-3">
                          {(() => {
                            const passed = testResults.filter(r => r.status === "pass").length;
                            const failed = testResults.filter(r => r.status === "fail" || r.status === "error").length;
                            const total = testResults.length;
                            return (
                              <div className="text-sm font-medium">
                                Passed <span className="text-success">{passed}</span> / Failed <span className="text-destructive">{failed}</span> / Total {total}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="space-y-2">
                          {testResults.map((r, idx) => (
                            <div key={idx} className="bg-background border border-border rounded-app shadow-elevate p-3 flex items-center justify-between">
                              <span className="text-sm font-mono">{r.name || `Test ${idx + 1}`}</span>
                              <span className={`text-xs font-semibold uppercase ${
                                r.status === "pass" ? "text-success" : "text-destructive"
                              }`}>
                                {r.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-muted hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-muted p-4 overflow-auto">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="h-full flex items-center justify-center">
                  <div className="card bg-background shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-12 h-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-muted-foreground">Unable to connect to the video call</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI chatClient={chatClient} channel={channel} />
                    </StreamCall>
                  </StreamVideo>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;
