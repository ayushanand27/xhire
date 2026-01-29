import { SignIn } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageShell, { PageContainer } from "../components/PageShell.jsx";

export default function Login() {
  return (
    <PageShell>
      <Navbar />
      <main className="flex-1">
        <PageContainer className="py-12">
          <div className="mx-auto max-w-md rounded-xl border border-border/50 bg-background/60 p-6 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight mb-4">Log in</h1>
            <p className="text-sm text-muted-foreground mb-6">Welcome back. Access your dashboard and sessions.</p>
            <div className="flex justify-center"><SignIn routing="path" path="/login" signUpUrl="/register" /></div>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </PageShell>
  );
}
