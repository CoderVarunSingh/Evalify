import React, { useState, useMemo } from "react";
import { TrophyIcon, LockIcon, CheckCircle2Icon } from "lucide-react";
import { getSolvedProblems } from "../lib/solvedStorage";
import { getCalendarStreak } from "../lib/streakManager";

function Achievements() {
  const [filter, setFilter] = useState("all");

  const history = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("ai_interview_history") || "[]");
    } catch {
      return [];
    }
  }, []);

  const solvedCount = useMemo(() => getSolvedProblems().length, []);
  const streak = useMemo(() => getCalendarStreak(history), [history]);

  const allAchievements = useMemo(() => {
    return [
      {
        id: "first_strike",
        icon: "🎯",
        name: "First Strike",
        category: "Milestone",
        description: "Successfully solved your first coding problem",
        unlocked: solvedCount >= 1,
        progress: Math.min(100, (solvedCount / 1) * 100),
      },
      {
        id: "triple_threat",
        icon: "🔥",
        name: "Triple Threat",
        category: "Milestone",
        description: "Solve 3 coding challenges",
        unlocked: solvedCount >= 3,
        progress: Math.min(100, Math.round((solvedCount / 3) * 100)),
      },
      {
        id: "high_achiever",
        icon: "⭐",
        name: "High Achiever",
        category: "Milestone",
        description: "Solve 5+ coding challenges",
        unlocked: solvedCount >= 5,
        progress: Math.min(100, Math.round((solvedCount / 5) * 100)),
      },
      {
        id: "consistent_3",
        icon: "🏅",
        name: "3-Day Streak",
        category: "Streak",
        description: "Maintain a 3-day consecutive active practice streak",
        unlocked: streak >= 3,
        progress: Math.min(100, Math.round((streak / 3) * 100)),
      },
      {
        id: "streak_7",
        icon: "👑",
        name: "Weekly Knight",
        category: "Streak",
        description: "Maintain a 7-day active practice streak",
        unlocked: streak >= 7,
        progress: Math.min(100, Math.round((streak / 7) * 100)),
      },
      {
        id: "algo_master",
        icon: "💡",
        name: "Algorithm Master",
        category: "Skill",
        description: "Solve 10+ total problems across different topics",
        unlocked: solvedCount >= 10,
        progress: Math.min(100, Math.round((solvedCount / 10) * 100)),
      },
    ];
  }, [solvedCount, streak]);

  const filtered = allAchievements.filter((a) => {
    if (filter === "all") return true;
    return a.category.toLowerCase() === filter.toLowerCase();
  });

  const unlockedTotal = allAchievements.filter((a) => a.unlocked).length;

  return (
    <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-300 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
            <TrophyIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">Achievements & Badges</h2>
              <span className="badge badge-amber font-mono font-bold text-xs shrink-0">
                {unlockedTotal}/{allAchievements.length} Unlocked
              </span>
            </div>
            <p className="text-xs text-base-content/60 mt-0.5">
              Unlock badges by solving problems & maintaining streaks
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="join bg-base-200 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setFilter("all")}
            className={`join-item btn btn-xs ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("milestone")}
            className={`join-item btn btn-xs ${filter === "milestone" ? "btn-primary" : "btn-ghost"}`}
          >
            Milestones
          </button>
          <button
            onClick={() => setFilter("streak")}
            className={`join-item btn btn-xs ${filter === "streak" ? "btn-primary" : "btn-ghost"}`}
          >
            Streaks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`relative p-4 rounded-2xl border transition-all ${
              item.unlocked
                ? "bg-gradient-to-br from-amber-500/10 via-base-100 to-primary/10 border-amber-500/40 shadow-md"
                : "bg-base-200/40 border-base-300 opacity-80"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm ${
                  item.unlocked
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                    : "bg-base-300 text-base-content/40"
                }`}
              >
                {item.unlocked ? item.icon : <LockIcon className="w-4 h-4 text-base-content/50" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="font-bold text-sm text-base-content truncate pr-1">{item.name}</h4>
                  {item.unlocked ? (
                    <span className="badge badge-success badge-xs text-white shrink-0 font-semibold px-1.5 py-1">
                      ✓ Unlocked
                    </span>
                  ) : (
                    <span className="badge badge-ghost badge-xs font-mono shrink-0">{item.progress}%</span>
                  )}
                </div>

                <p className="text-xs text-base-content/65 leading-snug line-clamp-2">{item.description}</p>

                {!item.unlocked && (
                  <div className="w-full bg-base-300 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
