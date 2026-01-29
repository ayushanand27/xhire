import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageShell, { PageContainer } from "../components/PageShell.jsx";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <PageShell>
      <Navbar />
      <main className="flex-1">
        <PageContainer className="py-16">
          <div className="mx-auto max-w-lg text-center">
            <h1 className="text-3xl font-semibold mb-3">Page not found</h1>
            <p className="text-muted-foreground mb-6">The page you are looking for doesn't exist or has been moved.</p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/" className="ripple btn btn-ghost">Go Home</Link>
              <Link to="/dashboard" className="ripple btn btn-primary">Open Dashboard</Link>
            </div>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </PageShell>
  );
}
