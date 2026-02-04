import { useUser } from "@clerk/clerk-react";
import { ArrowRightIcon, SparklesIcon, ZapIcon, Code2Icon } from "lucide-react";

function WelcomeSection({ onCreateSession }) {
  const { user } = useUser();

  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-700" />

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                <SparklesIcon className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">Welcome back to xHire</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Level Up Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent">
                  Coding Skills
                </span>
              </h1>

              <p className="text-lg text-base-content/70 leading-relaxed max-w-md">
                Practice coding problems, conduct technical interviews, and collaborate with others in real-time with HD video, live code sync, and AI-powered feedback.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <StatCard icon={Code2Icon} label="40+ Languages" />
              <StatCard icon={ZapIcon} label="Real-time Sync" />
              <StatCard icon={SparklesIcon} label="AI Feedback" />
            </div>
          </div>

          {/* Right - CTA Card */}
          <div className="lg:flex items-center justify-center hidden">
            <div className="relative group">
              {/* Glowing background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur-2xl opacity-30 group-hover:opacity-100 transition-all duration-500 animate-pulse" />

              {/* Card */}
              <div className="relative bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-primary mb-2">Get Started Now</p>
                    <h3 className="text-2xl font-bold">Create Your First Session</h3>
                  </div>

                  <button
                    onClick={onCreateSession}
                    className="w-full group/btn px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-2xl font-bold text-white flex items-center justify-center gap-3 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <ZapIcon className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
                    <span>Start Coding Now</span>
                    <ArrowRightIcon className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-base-300">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-primary">Interview Mode</p>
                      <p className="text-sm text-base-content/70">1-on-1 sessions with HD video and chat</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-secondary">Practice Mode</p>
                      <p className="text-sm text-base-content/70">Solve problems at your own pace</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA for mobile */}
        <div className="lg:hidden pt-8 flex gap-3">
          <button
            onClick={onCreateSession}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <ZapIcon className="w-5 h-5" />
            Create Session
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label }) {
  return (
    <div className="group px-4 py-3 rounded-xl bg-base-200/50 border border-base-300/50 hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 cursor-default">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary group-hover:scale-125 transition-transform" />
        <span className="text-xs font-semibold text-base-content/70 group-hover:text-primary transition-colors">{label}</span>
      </div>
    </div>
  );
}

export default WelcomeSection;
