import { SignUp } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageShell, { PageContainer } from "../components/PageShell.jsx";

export default function Register() {
  return (
    <PageShell>
      <Navbar />
      <main className="flex-1">
        <PageContainer className="py-12">
          <div className="mx-auto max-w-md rounded-xl border border-border/50 bg-background/60 p-6 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight mb-4">Create your account</h1>
            <p className="text-sm text-muted-foreground mb-6">Start interviewing and practicing coding problems.</p>
            <div className="flex justify-center"><SignUp routing="path" path="/register" signInUrl="/login" /></div>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </PageShell>
  );
}
