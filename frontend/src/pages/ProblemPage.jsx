import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { problemsApi } from "../api/problems";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageShell, { PageContainer } from "../components/PageShell.jsx";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/piston";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentProblemId, setCurrentProblemId] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProblems, setAllProblems] = useState([]);

  const [currentProblem, setCurrentProblem] = useState(null);

  // fetch problems list and the current problem by id
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setOutput(null);
        const [{ data: listData }, { data: problemData }] = await Promise.all([
          problemsApi.list(),
          problemsApi.getById(id),
        ]);
        if (!mounted) return;
        const items = Array.isArray(listData?.problems) ? listData.problems : listData;
        setAllProblems(items || []);
        setCurrentProblemId(id);
        const problem = problemData?.problem || problemData;
        setCurrentProblem(problem || null);
        const starter = problem?.starterCode?.[selectedLanguage] || "";
        setCode(starter);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load problem");
      } finally {
        mounted && setLoading(false);
      }
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    const starter = currentProblem?.starterCode?.[newLang] || "";
    setCode(starter);
    setOutput(null);
  };

  const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };

  const normalizeOutput = (output) => {
    // normalize output for comparison (trim whitespace, handle different spacing)
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          // remove spaces after [ and before ]
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          // normalize spaces around commas to single space after comma
          .replace(/\s*,\s*/g, ",")
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    return normalizedActual == normalizedExpected;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    // check if code executed successfully and matches expected output
    if (result.success) {
      const expectedOutput = currentProblem?.expectedOutput?.[selectedLanguage];
      if (!expectedOutput) {
        toast.error("No expected output available for this problem.");
      } else {
        const testsPassed = checkIfTestsPassed(result.output, expectedOutput);
        if (testsPassed) {
          triggerConfetti();
          toast.success("All tests passed! Great job!");
        } else {
          toast.error("Tests failed. Check your output!");
        }
      }
    } else {
      toast.error("Code execution failed!");
    }
  };

  if (loading) {
    return (
      <PageShell>
        <Navbar />
        <main className="flex-1 py-8">
          <PageContainer>
            <div className="text-sm text-muted-foreground">Loading problem…</div>
          </PageContainer>
        </main>
        <Footer />
      </PageShell>
    );
  }

  if (error || !currentProblem) {
    return (
      <PageShell>
        <Navbar />
        <main className="flex-1 py-8">
          <PageContainer>
            <div className="text-sm text-red-400">{error || "Problem not found."}</div>
          </PageContainer>
        </main>
        <Footer />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Navbar />

      <main className="flex-1 py-4">
        <PageContainer>
          <PanelGroup direction="horizontal">
          {/* left panel- problem desc */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={handleProblemChange}
              allProblems={allProblems}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-border hover:bg-primary transition-colors cursor-col-resize" />

          {/* right panel- code editor & output */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top panel - Code editor */}
              <Panel defaultSize={70} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-border hover:bg-primary transition-colors cursor-row-resize" />

              {/* Bottom panel - Output Panel*/}

              <Panel defaultSize={30} minSize={30}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
        </PageContainer>
      </main>
      <Footer />
    </PageShell>
  );
}

export default ProblemPage;
