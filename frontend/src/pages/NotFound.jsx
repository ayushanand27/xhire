import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageShell, { PageContainer } from "../components/PageShell.jsx";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <PageShell>
      <Navbar />
      <main className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute bottom-0 left-[-6rem] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />

        <PageContainer className="py-14 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/20 via-emerald-400/10 to-secondary/15 blur-2xl" />
              <div className="relative rounded-3xl border border-border/60 bg-background/60 backdrop-blur-md shadow-2xl p-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground border border-border/60">
                  <span className="h-2 w-2 rounded-full bg-primary/70" />
                  404
                </div>
                <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">
                  Page not found
                </h1>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                  The page you are looking for doesn't exist or has been moved.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/" className="ripple btn btn-ghost">Go Home</Link>
                  <Link to="/login" className="ripple btn btn-ghost">Log in</Link>
                  <Link to="/register" className="ripple btn btn-primary">Get Started</Link>
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
