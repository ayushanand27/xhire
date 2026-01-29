import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageShell, { PageContainer } from "../components/PageShell.jsx";
import { useEffect, useMemo, useState } from "react";
import { problemsApi } from "../api/problems";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    problemsApi
      .list()
      .then(({ data }) => {
        if (!mounted) return;
        const items = Array.isArray(data?.problems) ? data.problems : data;
        setProblems(items || []);
        setError(null);
      })
      .catch((err) => setError(err.message || "Failed to load problems"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const { easyProblemsCount, mediumProblemsCount, hardProblemsCount } = useMemo(() => {
    return {
      easyProblemsCount: problems.filter((p) => p.difficulty === "Easy").length,
      mediumProblemsCount: problems.filter((p) => p.difficulty === "Medium").length,
      hardProblemsCount: problems.filter((p) => p.difficulty === "Hard").length,
    };
  }, [problems]);

  return (
    <PageShell>
      <Navbar />

      <main className="py-10">
        <PageContainer>
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold">Practice Problems</h1>
            <p className="text-muted-foreground">Sharpen your coding skills with these curated problems</p>
          </div>

          {/* LIST */}
          <div className="space-y-3">
            {loading && <div className="text-sm text-muted-foreground">Loading problems…</div>}
            {error && !loading && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            {!loading && !error && problems.length === 0 && (
              <div className="text-sm text-muted-foreground">No problems available.</div>
            )}
            {!loading && !error && problems.map((problem) => (
              <Link
                key={problem.id}
                to={`/problem/${problem.id}`}
                className="block rounded-lg bg-muted ring-1 ring-border/60 hover:ring-border transition"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center">
                          <Code2Icon className="size-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-lg font-medium">{problem.title}</h2>
                            <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>{problem.difficulty}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{problem.category}</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80">{problem.description?.text}</p>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <span className="font-medium hidden sm:inline">Solve</span>
                      <ChevronRightIcon className="size-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* STATS */}
          <div className="mt-8 rounded-lg bg-muted ring-1 ring-border/60">
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Total Problems</div>
                <div className="text-xl font-semibold text-primary">{problems.length}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Easy</div>
                <div className="text-xl font-semibold text-success">{easyProblemsCount}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Medium</div>
                <div className="text-xl font-semibold text-warning">{mediumProblemsCount}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Hard</div>
                <div className="text-xl font-semibold text-destructive">{hardProblemsCount}</div>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>

      <Footer />
    </PageShell>
  );
}
export default ProblemsPage;
