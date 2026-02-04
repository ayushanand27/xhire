import { SignIn } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageShell, { PageContainer } from "../components/PageShell.jsx";

export default function Login() {
  return (
    <PageShell>
      <Navbar />
      <main className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute bottom-0 left-[-6rem] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />

        <PageContainer className="py-10 sm:py-14">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: value props */}
              <div className="hidden lg:block">
                <div className="rounded-3xl border border-border/60 bg-background/40 backdrop-blur-md shadow-elevate overflow-hidden">
                  <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-r from-base-100/60 to-base-200/30">
                    <div className="text-xs text-muted-foreground">Welcome back</div>
                    <h1 className="mt-1 text-3xl font-black tracking-tight">
                      <span className="bg-gradient-to-r from-primary via-emerald-400 to-secondary bg-clip-text text-transparent">
                        Continue your sessions
                      </span>
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Join interviews, collaborate in real time, and run code together.
                    </p>
                  </div>

                  <div className="p-6 grid gap-4">
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                      <div className="text-sm font-semibold">Audio/Video + Screen Share</div>
                      <div className="text-xs text-muted-foreground mt-1">Stream-powered calls for stable interviews.</div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                      <div className="text-sm font-semibold">Shared Code Editor</div>
                      <div className="text-xs text-muted-foreground mt-1">Sync code instantly with Socket.IO collaboration.</div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                      <div className="text-sm font-semibold">Run Code + Tests</div>
                      <div className="text-xs text-muted-foreground mt-1">Execute across languages and review output together.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: auth card */}
              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/25 via-emerald-400/10 to-secondary/20 blur-2xl" />
                <div className="relative rounded-3xl border border-border/60 bg-background/60 backdrop-blur-md shadow-2xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-r from-base-100/60 to-base-200/30">
                    <h1 className="text-2xl font-black tracking-tight">Log in</h1>
                    <p className="text-sm text-muted-foreground mt-1">Access your dashboard and sessions.</p>
                  </div>
                  <div className="p-6 flex justify-center">
                    <SignIn
                      routing="path"
                      path="/login"
                      signUpUrl="/register"
                      afterSignInUrl="/dashboard"
                    />
                  </div>
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
