import Navbar from "../components/Navbar";
import PageShell from "../components/PageShell.jsx";
import Footer from "../components/Footer.jsx";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <PageShell>
      <Navbar />
      <main className="relative">
        <section className="mx-auto max-w-7xl px-4 pt-20 pb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Interview-focused video platform for engineering teams</h1>
              <p className="mt-4 text-muted-foreground">Run structured technical interviews with multi-interviewer calls, collaborative coding, automated test execution, and recordings.</p>
              <div className="mt-6 flex gap-3">
                <Link to="/dashboard" className="ripple btn btn-primary">Open Dashboard</Link>
                <Link to="/practice" className="ripple btn btn-ghost">Try Practice</Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="p-3 rounded-app bg-muted border border-border">Up to 5 participants</div>
                <div className="p-3 rounded-app bg-muted border border-border">Code editor + tests</div>
                <div className="p-3 rounded-app bg-muted border border-border">Recording & screen share</div>
                <div className="p-3 rounded-app bg-muted border border-border">Clerk auth ready</div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="aspect-video rounded-app bg-gradient-to-br from-emerald-600/30 to-cyan-600/20 border border-border" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageShell>
  );
}
