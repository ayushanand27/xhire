import { TrophyIcon, UsersIcon, ZapIcon, Clock3Icon } from "lucide-react";

function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-6">
      {/* Active Count Card */}
      <div className="group relative rounded-2xl bg-gradient-to-br from-base-100 to-base-200 border-2 border-primary/20 hover:border-primary/40 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <UsersIcon className="w-7 h-7 text-primary group-hover:animate-pulse" />
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full border border-primary/30">
              <span className="text-xs font-bold text-primary animate-pulse">🔴 Live</span>
            </div>
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {activeSessionsCount}
          </div>
          <div className="text-sm font-medium text-base-content/70">Active Sessions</div>
          <div className="mt-3 h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Recent Count Card */}
      <div className="group relative rounded-2xl bg-gradient-to-br from-base-100 to-base-200 border-2 border-secondary/20 hover:border-secondary/40 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <TrophyIcon className="w-7 h-7 text-secondary group-hover:animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-secondary/20 to-secondary/10 rounded-full border border-secondary/30">
              <span className="text-xs font-bold text-secondary">✨ Total</span>
            </div>
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
            {recentSessionsCount}
          </div>
          <div className="text-sm font-medium text-base-content/70">All Sessions</div>
          <div className="mt-3 h-1 bg-gradient-to-r from-secondary to-accent rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
