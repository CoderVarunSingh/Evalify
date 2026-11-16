import { TrophyIcon, UsersIcon, ZapIcon, ChartBarIcon } from "lucide-react";

function StatsCards({ activeSessionsCount, completedSessionsCount, totalSessionsCount, aiInterviewsCount }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-6">
      {/* Active Sessions */}
      <div className="card bg-base-100 border-2 border-primary/20 hover:border-primary/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <UsersIcon className="w-7 h-7 text-primary" />
            </div>
            <div className="badge badge-primary">Live</div>
          </div>
          <div className="text-4xl font-black mb-1">{activeSessionsCount}</div>
          <div className="text-sm opacity-60">Active Sessions</div>
        </div>
      </div>

      {/* Completed Sessions */}
      <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-secondary/10 rounded-2xl">
              <ZapIcon className="w-7 h-7 text-secondary" />
            </div>
            <div className="badge badge-secondary">Done</div>
          </div>
          <div className="text-4xl font-black mb-1">{completedSessionsCount}</div>
          <div className="text-sm opacity-60">Completed Sessions</div>
        </div>
      </div>

      {/* Total Sessions */}
      <div className="card bg-base-100 border-2 border-accent/20 hover:border-accent/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <ChartBarIcon className="w-7 h-7 text-accent" />
            </div>
            <div className="badge badge-accent">Total</div>
          </div>
          <div className="text-4xl font-black mb-1">{totalSessionsCount}</div>
          <div className="text-sm opacity-60">Total Sessions</div>
        </div>
      </div>

      {/* AI Interviews Done */}
      <div className="card bg-base-100 border-2 border-info/20 hover:border-info/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-info/10 rounded-2xl">
              <ChartBarIcon className="w-7 h-7 text-info" />
            </div>
            <div className="badge badge-info">AI</div>
          </div>
          <div className="text-4xl font-black mb-1">{aiInterviewsCount}</div>
          <div className="text-sm opacity-60">AI Interviews Done</div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
