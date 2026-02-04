import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Loader2Icon, PlayIcon, RotateCcwIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { problemsApi } from "../api/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import PageShell from "../components/PageShell";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import { getDifficultyBadgeClass } from "../lib/utils";
import toast from "react-hot-toast";

const languages = {
  javascript: {
    name: "JavaScript",
    ext: "js",
    template: `function solve(input) {
  // Write your solution here
  return input;
}

// Test
console.log(solve("test"));`,
  },
  python: {
    name: "Python",
    ext: "py",
    template: `def solve(input_data):
    # Write your solution here
    return input_data

# Test
print(solve("test"))`,
  },
  java: {
    name: "Java",
    ext: "java",
    template: `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
    }
}`,
  },
};

function PracticePage() {
  const navigate = useNavigate();

  // State
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Loading states
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [problemsError, setProblemsError] = useState(null);
  const [selectedLanguageError, setSelectedLanguageError] = useState(null);

  // Load problems on mount
  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoadingProblems(true);
        setProblemsError(null);
        console.log("📝 Loading practice problems...");
        const { data } = await problemsApi.list();
        const items = Array.isArray(data?.problems) ? data.problems : data;

        if (!items || items.length === 0) {
          setProblemsError("No problems available. Please try again later.");
          toast.error("No problems available");
          return;
        }

        setProblems(items);
        // Auto-select first problem
        if (items.length > 0) {
          selectProblem(items[0]);
        }
      } catch (err) {
        console.error("❌ Failed to load problems:", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to load problems";
        setProblemsError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoadingProblems(false);
      }
    };

    loadProblems();
  }, []);

  const selectProblem = (problem) => {
    setSelectedProblem(problem);
    setCode(languages[selectedLanguage]?.template || "");
    setOutput(null);
    setTestResults(null);
    setSelectedLanguageError(null);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    setCode(languages[lang]?.template || "");
    setOutput(null);
    setTestResults(null);
    setSelectedLanguageError(null);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setIsRunning(true);
    setOutput(null);
    setSelectedLanguageError(null);

    try {
      console.log("▶️ Executing code...");
      const result = await executeCode(
        code,
        languages[selectedLanguage]?.ext || "js",
        selectedLanguage
      );

      if (result.error) {
        setSelectedLanguageError(result.error);
        setOutput(null);
        toast.error("Code execution failed");
      } else {
        setOutput(result.stdout || "");
        setSelectedLanguageError(null);
        toast.success("Code executed successfully");
      }
    } catch (err) {
      console.error("❌ Execution error:", err);
      const errorMsg = err.message || "Failed to execute code";
      setSelectedLanguageError(errorMsg);
      setOutput(null);
      toast.error(errorMsg);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTests = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setIsTesting(true);
    setTestResults(null);
    setSelectedLanguageError(null);

    try {
      console.log("🧪 Running tests...");
      // For now, just run the code
      // In a real app, you'd call the tests API endpoint
      const result = await executeCode(
        code,
        languages[selectedLanguage]?.ext || "js",
        selectedLanguage
      );

      if (result.error) {
        setTestResults({
          passed: 0,
          total: selectedProblem?.testCases?.length || 1,
          error: result.error,
        });
        toast.error("Test execution failed");
      } else {
        setTestResults({
          passed: 1,
          total: 1,
          output: result.stdout || "",
        });
        toast.success("Tests passed!");
      }
    } catch (err) {
      console.error("❌ Test error:", err);
      toast.error("Failed to run tests");
      setTestResults({
        passed: 0,
        total: 1,
        error: err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    if (selectedProblem) {
      selectProblem(selectedProblem);
      toast.success("Code reset");
    }
  };

  return (
    <PageShell>
      <Navbar />

      <div className="flex-1 overflow-hidden bg-base-100">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - PROBLEM LIST & DETAILS */}
          <Panel defaultSize={25} minSize={20}>
            <div className="h-full flex flex-col overflow-auto border-r border-base-300">
              {/* HEADER */}
              <div className="border-b border-base-300 p-6 sticky top-0 bg-base-100 z-10">
                <h2 className="text-2xl font-bold">Practice Mode</h2>
                <p className="text-sm text-base-content/60">Solve coding problems</p>
              </div>

              {/* PROBLEMS LIST */}
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {loadingProblems && (
                  <div className="flex items-center justify-center gap-2 p-8 text-base-content/60">
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    Loading problems...
                  </div>
                )}

                {problemsError && (
                  <div className="alert alert-error">
                    <span>{problemsError}</span>
                  </div>
                )}

                {!loadingProblems && !problemsError && problems.length === 0 && (
                  <div className="text-center py-8 text-base-content/60">
                    <p>No problems available</p>
                  </div>
                )}

                {!loadingProblems &&
                  !problemsError &&
                  problems.map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => selectProblem(problem)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedProblem?.id === problem.id
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-base-300 hover:border-primary/50 hover:bg-base-200"
                      }`}
                    >
                      <div className="font-semibold truncate">{problem.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        {problem.category && (
                          <span className="text-xs bg-base-300 text-base-content px-2 py-1 rounded">
                            {problem.category}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-base-300 hover:bg-primary/30 transition" />

          {/* CENTER PANEL - CODE EDITOR */}
          <Panel defaultSize={37} minSize={30}>
            {selectedProblem ? (
              <div className="h-full flex flex-col bg-base-100">
                {/* PROBLEM DESCRIPTION */}
                <div className="border-b border-base-300 p-4 bg-base-200 max-h-[200px] overflow-auto">
                  <h3 className="font-bold text-lg mb-2">{selectedProblem.title}</h3>
                  <p className="text-sm text-base-content/70 whitespace-pre-wrap">
                    {selectedProblem.description}
                  </p>
                  {selectedProblem.examples && (
                    <div className="mt-3 text-xs">
                      <p className="font-semibold">Examples:</p>
                      <pre className="bg-base-300 p-2 rounded mt-1 overflow-auto max-h-[80px]">
                        {selectedProblem.examples}
                      </pre>
                    </div>
                  )}
                </div>

                {/* LANGUAGE & CONTROLS */}
                <div className="border-b border-base-300 p-3 flex items-center gap-3 bg-base-100 flex-wrap">
                  <select
                    className="select select-bordered select-sm"
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                  >
                    {Object.entries(languages).map(([key, lang]) => (
                      <option key={key} value={key}>
                        {lang.name}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn btn-sm btn-success gap-2"
                    onClick={handleRunCode}
                    disabled={isRunning || isTesting}
                  >
                    {isRunning ? (
                      <>
                        <Loader2Icon className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4" />
                        Run
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-sm btn-info gap-2"
                    onClick={handleRunTests}
                    disabled={isRunning || isTesting}
                  >
                    {isTesting ? (
                      <>
                        <Loader2Icon className="w-4 h-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Test
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-sm btn-ghost gap-2"
                    onClick={handleReset}
                    disabled={isRunning || isTesting}
                  >
                    <RotateCcwIcon className="w-4 h-4" />
                    Reset
                  </button>
                </div>

                {/* CODE EDITOR */}
                <div className="flex-1 overflow-hidden">
                  <CodeEditorPanel value={code} onChange={setCode} language={selectedLanguage} />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-base-content/60">
                <p>Select a problem to start</p>
              </div>
            )}
          </Panel>

          <PanelResizeHandle className="w-1 bg-base-300 hover:bg-primary/30 transition" />

          {/* RIGHT PANEL - OUTPUT */}
          <Panel defaultSize={38} minSize={30}>
            <div className="h-full flex flex-col bg-base-100 border-l border-base-300">
              <div className="border-b border-base-300 p-4 sticky top-0 bg-base-100 z-10">
                <h3 className="font-bold">Output</h3>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {/* ERROR */}
                {selectedLanguageError && (
                  <div className="alert alert-error mb-4">
                    <XCircleIcon className="w-6 h-6 shrink-0" />
                    <div>
                      <h3 className="font-bold">Error</h3>
                      <pre className="text-xs mt-1 overflow-auto max-h-[200px]">
                        {selectedLanguageError}
                      </pre>
                    </div>
                  </div>
                )}

                {/* TEST RESULTS */}
                {testResults && (
                  <div
                    className={`alert mb-4 ${
                      testResults.passed === testResults.total ? "alert-success" : "alert-warning"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold">
                        {testResults.passed === testResults.total ? "✅ Tests Passed!" : "⚠️ Tests Failed"}
                      </h3>
                      <p className="text-sm">
                        {testResults.passed} / {testResults.total} tests passed
                      </p>
                      {testResults.error && (
                        <pre className="text-xs mt-2 bg-base-200 p-2 rounded overflow-auto max-h-[150px]">
                          {testResults.error}
                        </pre>
                      )}
                      {testResults.output && (
                        <pre className="text-xs mt-2 bg-base-200 p-2 rounded overflow-auto max-h-[150px]">
                          {testResults.output}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {/* STANDARD OUTPUT */}
                {output && !selectedLanguageError && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Console Output:</p>
                    <pre className="bg-base-200 p-3 rounded text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
                      {output}
                    </pre>
                  </div>
                )}

                {!output && !selectedLanguageError && !testResults && (
                  <div className="text-center text-base-content/60 py-12">
                    <p>Run your code to see output</p>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </PageShell>
  );
}

export default PracticePage;
