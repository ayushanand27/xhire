import Navbar from "../components/Navbar";
import PageShell from "../components/PageShell.jsx";
import Footer from "../components/Footer.jsx";
import { Link } from "react-router-dom";
import { 
  VideoIcon, 
  CodeIcon, 
  PlayIcon, 
  SaveIcon, 
  UsersIcon, 
  ZapIcon, 
  CheckCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon
} from "lucide-react";

export default function HomePage() {
  return (
    <PageShell>
      <Navbar />
      <main className="relative overflow-hidden">
        {/* Enhanced animated background gradients */}
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/30 to-primary/20 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="pointer-events-none absolute top-40 left-[-8rem] h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-500/20 to-secondary/15 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="pointer-events-none absolute bottom-20 right-[-8rem] h-96 w-96 rounded-full bg-gradient-to-tl from-purple-500/15 to-accent/10 blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28 pb-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              {/* Badge with animation */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-muted/80 to-muted/60 px-4 py-2 text-xs font-medium text-foreground border border-border/60 shadow-lg backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Real-time interviews & practice
              </div>

              {/* Heading with enhanced gradient */}
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
                <span className="block bg-gradient-to-r from-primary via-emerald-400 to-secondary bg-clip-text text-transparent animate-gradient">
                  Level Up Your
                </span>
                <span className="block bg-gradient-to-r from-secondary via-cyan-400 to-primary bg-clip-text text-transparent animate-gradient" style={{ animationDelay: '0.5s' }}>
                  Coding Skills
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Run structured technical interviews with <span className="text-foreground font-semibold">multi-participant video</span>, collaborative coding, automated test execution, and recordings — all in one place.
              </p>

              {/* Enhanced CTA buttons */}
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/register" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold text-white flex items-center gap-3 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <SparklesIcon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Get Started Free</span>
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-4 rounded-xl font-bold border-2 border-border/60 hover:border-primary/50 bg-background/60 backdrop-blur-sm hover:bg-muted/40 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>Log in</span>
                </Link>
              </div>

              {/* Enhanced feature badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircleIcon className="w-4 h-4 text-primary" />
                  No installs needed
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                  Enterprise security
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <ZapIcon className="w-4 h-4 text-secondary" />
                  Real-time sync
                </span>
              </div>
            </div>

            {/* Enhanced preview card */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/30 via-emerald-400/20 to-secondary/30 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Header bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-muted/60 to-muted/40 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <div className="text-sm font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Live Session Preview
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <VideoIcon className="w-3.5 h-3.5" />
                    <CodeIcon className="w-3.5 h-3.5" />
                    <span className="font-medium">Full Suite</span>
                  </div>
                </div>

                {/* Content area */}
                <div className="grid gap-5 p-6 sm:grid-cols-2">
                  {/* Video grid */}
                  <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/50 to-muted/30 p-5 group/video hover:border-primary/50 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <VideoIcon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">Multi-Participant Video</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative h-24 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/20 border border-border/40 overflow-hidden group-hover/video:scale-105 transition-transform duration-300">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="relative h-24 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/15 border border-border/40 overflow-hidden group-hover/video:scale-105 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="relative h-24 rounded-xl bg-gradient-to-br from-cyan-400/15 to-purple-400/15 border border-border/40 overflow-hidden group-hover/video:scale-105 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="relative h-24 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 border border-border/40 overflow-hidden group-hover/video:scale-105 transition-transform duration-300" style={{ transitionDelay: '150ms' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* Code editor */}
                  <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/50 to-muted/30 p-5 group/code hover:border-secondary/50 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <CodeIcon className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-semibold text-foreground">Live Code Editor</span>
                    </div>
                    <pre className="text-xs leading-5 overflow-hidden rounded-xl border border-border/40 bg-base-300/40 backdrop-blur-sm p-4 font-mono group-hover/code:border-secondary/40 transition-colors duration-300">
                      <code className="text-foreground/90">
{`function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) 
      return [map.get(need), i];
    map.set(nums[i], i);
  }
}`}
                      </code>
                    </pre>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Run tests</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/20 text-success text-xs font-semibold">
                        <CheckCircleIcon className="w-3 h-3" />
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced feature cards */}
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={UsersIcon}
              title="Up to 5 participants"
              description="Crystal-clear Stream video calls"
              gradient="from-primary/20 to-emerald-400/10"
              iconColor="text-primary"
            />
            <FeatureCard
              icon={CodeIcon}
              title="Collaborative editor"
              description="Real-time sync with Socket.IO"
              gradient="from-secondary/20 to-cyan-400/10"
              iconColor="text-secondary"
            />
            <FeatureCard
              icon={PlayIcon}
              title="Run code + tests"
              description="40+ language execution"
              gradient="from-emerald-400/20 to-primary/10"
              iconColor="text-emerald-500"
            />
            <FeatureCard
              icon={SaveIcon}
              title="Recordings & share"
              description="Review interviews anytime"
              gradient="from-purple-400/20 to-secondary/10"
              iconColor="text-purple-500"
            />
          </div>
        </section>

        {/* How it works section */}
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <div className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
            
            <div className="relative px-6 py-8 border-b border-border/50 bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/10">
                  <ZapIcon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  How it works
                </h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">Start fast, invite instantly, collaborate in real time.</p>
            </div>

            <div className="relative grid md:grid-cols-3 gap-6 p-8">
              <StepCard
                step="1"
                title="Create a session"
                description="Pick a problem, set interview mode, and generate a join link instantly."
                icon={SparklesIcon}
              />
              <StepCard
                step="2"
                title="Invite participants"
                description="Candidates join from any browser — zero setup, zero friction, zero downloads."
                icon={UsersIcon}
              />
              <StepCard
                step="3"
                title="Talk + code together"
                description="HD audio/video, screen share, and a collaborative editor with live test execution."
                icon={CodeIcon}
              />
            </div>

            <div className="relative px-8 pb-8">
              <div className="relative rounded-2xl border border-border/60 bg-gradient-to-r from-primary/10 via-emerald-400/5 to-secondary/10 backdrop-blur-sm overflow-hidden group hover:border-primary/50 transition-all duration-300">
                {/* Animated gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="text-lg font-bold text-foreground">Ready to elevate your interviews?</div>
                    <div className="text-sm text-muted-foreground">Create an account and launch your first session in under 2 minutes.</div>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <Link 
                      to="/register" 
                      className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold text-white hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                      Create account
                    </Link>
                    <Link 
                      to="/login" 
                      className="px-6 py-3 rounded-xl font-semibold border border-border/60 hover:border-primary/50 bg-background/60 hover:bg-muted/40 transition-all duration-300"
                    >
                      Log in
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust indicators */}
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Trusted by developers worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground/60">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageShell>
  );
}

// FeatureCard component with enhanced styling
function FeatureCard({ icon: Icon, title, description, gradient, iconColor }) {
  return (
    <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/60 hover:border-border shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative space-y-3">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} border border-border/40 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <div className="text-base font-bold text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground mt-1">{description}</div>
        </div>
      </div>
    </div>
  );
}

// StepCard component
function StepCard({ step, title, description, icon: Icon }) {
  return (
    <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/60 hover:border-primary/50 hover:bg-muted/50 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 border border-primary/30 text-primary font-bold text-sm group-hover:scale-110 transition-transform duration-300">
          {step}
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
