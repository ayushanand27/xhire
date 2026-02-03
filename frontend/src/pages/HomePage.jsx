import Navbar from "../components/Navbar";
import PageShell from "../components/PageShell.jsx";
import Footer from "../components/Footer.jsx";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <PageShell>
      <Navbar />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />

        <section className="mx-auto max-w-7xl px-4 pt-20 pb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground border border-border">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live collaboration platform
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight">
              Interview-focused video platform for engineering teams
            </h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              Run structured technical interviews with multi-interviewer calls, collaborative coding, automated test execution, and recordings.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/dashboard" className="ripple btn btn-primary">Open Dashboard</Link>
              <Link to="/practice" className="ripple btn btn-ghost">Try Practice</Link>
            </div>

            <div className="mt-10 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-app bg-muted/80 border border-border shadow-elevate">
                <div className="text-base text-foreground font-semibold">Up to 5 participants</div>
                <div className="text-xs text-foreground/70 mt-1">Stable Stream.io video</div>
              </div>
              <div className="p-4 rounded-app bg-muted/80 border border-border shadow-elevate">
                <div className="text-base text-foreground font-semibold">Code editor + tests</div>
                <div className="text-xs text-foreground/70 mt-1">Piston + OpenAI</div>
              </div>
              <div className="p-4 rounded-app bg-muted/80 border border-border shadow-elevate">
                <div className="text-base text-foreground font-semibold">Recording & screen share</div>
                <div className="text-xs text-foreground/70 mt-1">Full session review</div>
              </div>
              <div className="p-4 rounded-app bg-muted/80 border border-border shadow-elevate">
                <div className="text-base text-foreground font-semibold">Secure access</div>
                <div className="text-xs text-foreground/70 mt-1">Clerk auth + roles</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-app border border-border bg-background/70 p-5 shadow-elevate">
              <h3 className="text-base font-semibold">Fast onboarding</h3>
              <p className="mt-2 text-sm text-muted-foreground">Invite candidates via a meeting link. Login and join in seconds.</p>
            </div>
            <div className="rounded-app border border-border bg-background/70 p-5 shadow-elevate">
              <h3 className="text-base font-semibold">Dynamic interviews</h3>
              <p className="mt-2 text-sm text-muted-foreground">Pair program live, execute code, and review output together.</p>
            </div>
            <div className="rounded-app border border-border bg-background/70 p-5 shadow-elevate">
              <h3 className="text-base font-semibold">Practice mode</h3>
              <p className="mt-2 text-sm text-muted-foreground">Solo practice with curated problems and instant feedback.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageShell>
  );
}
