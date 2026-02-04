import {
  ArrowRightIcon,
  Code2Icon,
  CrownIcon,
  SparklesIcon,
  UsersIcon,
  ZapIcon,
  LoaderIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getDifficultyBadgeClass } from "../lib/utils";

function ActiveSessions({ sessions, isLoading, isUserInSession }) {
  return (
    <div className="lg:col-span-2 relative rounded-2xl bg-gradient-to-br from-base-100 to-base-200 border-2 border-primary/20 hover:border-primary/30 p-6 shadow-lg h-full overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 hover:opacity-50 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* HEADERS SECTION */}
        <div className="flex items-center justify-between mb-6">
          {/* TITLE AND ICON */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
              <ZapIcon className="size-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Live Sessions</h2>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success/10 to-success/5 rounded-full border border-success/30">
            <div className="size-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm font-bold text-success">{sessions.length} active</span>
          </div>
        </div>

        {/* SESSIONS LIST */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoaderIcon className="size-10 animate-spin text-primary" />
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((session, idx) => (
              <div
                key={session._id}
                className="group relative rounded-xl bg-gradient-to-br from-base-100/50 to-base-200/50 border-2 border-border/40 hover:border-primary/50 p-4 transition-all duration-300 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Hover gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
                
                <div className="relative flex items-center justify-between gap-4">
                  {/* LEFT SIDE */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative size-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <Code2Icon className="size-8 text-white" />
                      <div className="absolute -top-2 -right-2 size-5 bg-success rounded-full border-2 border-white shadow-md animate-pulse" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                          {session.title || session.problem || "Live Session"}
                        </h3>
                        {!!session.difficulty && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyBadgeClass(session.difficulty)}`}>
                            {session.difficulty.slice(0, 1).toUpperCase() + session.difficulty.slice(1)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5">
                          <CrownIcon className="size-4 text-warning" />
                          <span className="font-medium">{session.host?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UsersIcon className="size-4 text-info" />
                          <span className="text-xs font-medium">{session.participant ? "2/2" : "1/2"}</span>
                        </div>
                        {session.participant && !isUserInSession(session) ? (
                          <span className="px-2 py-1 bg-error/20 text-error rounded-full text-xs font-bold border border-error/30">FULL</span>
                        ) : (
                          <span className="px-2 py-1 bg-success/20 text-success rounded-full text-xs font-bold border border-success/30 animate-pulse">OPEN</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {session.participant && !isUserInSession(session) ? (
                    <button className="px-4 py-2 bg-base-300 text-base-content rounded-lg font-medium cursor-not-allowed opacity-60">Full</button>
                  ) : (
                    <Link 
                      to={`/session/${session._id}`} 
                      className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 group-hover:shadow-xl"
                    >
                      {isUserInSession(session) ? "Rejoin" : "Join"}
                      <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-12 h-12 text-primary/60 animate-pulse" />
              </div>
              <p className="text-lg font-bold text-base-content mb-2">No active sessions</p>
              <p className="text-sm text-base-content/60">Be the first to create one!</p>
            </div>
          )}
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
export default ActiveSessions;
