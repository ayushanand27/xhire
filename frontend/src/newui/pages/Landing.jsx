import Navbar from "../components/Navbar";
import PageShell from "../components/PageShell";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <PageShell>
      <Navbar />
      <main className="relative">
        <section className="mx-auto max-w-7xl px-4 pt-20 pb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Interview-focused video platform for engineering teams</h1>
              <p className="mt-4 text-gray-300">Run structured technical interviews with multi-interviewer calls, collaborative coding, automated test execution, and recordings.</p>
              <div className="mt-6 flex gap-3">
                <Link to="/ui/dashboard" className="btn btn-primary">Open Dashboard</Link>
                <Link to="/ui/practice" className="btn btn-ghost">Try Practice</Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="p-3 rounded-lg bg-gray-900 ring-1 ring-white/10">Up to 5 participants</div>
                <div className="p-3 rounded-lg bg-gray-900 ring-1 ring-white/10">Code editor + tests</div>
                <div className="p-3 rounded-lg bg-gray-900 ring-1 ring-white/10">Recording & screen share</div>
                <div className="p-3 rounded-lg bg-gray-900 ring-1 ring-white/10">Clerk auth ready</div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-emerald-600/30 to-cyan-600/20 ring-1 ring-white/10" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageShell>
  );
}
