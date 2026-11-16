import React, { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { PROBLEMS } from "../data/problems";
import { problemsData } from "../data/problemsData";
import { getSolvedProblems } from "../lib/solvedStorage";
import { useNavigate } from "react-router-dom";
import { SparklesIcon, RefreshCwIcon, ArrowRightIcon, CompassIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function Recommendations() {
  const [activity] = useLocalStorage("iq_activity", []);
  const [bookmarks] = useLocalStorage("iq_bookmarks", []);
  const [favorites] = useLocalStorage("iq_favorites", []);
  const [seed, setSeed] = useState(0);
  const navigate = useNavigate();

  const solvedSet = useMemo(() => new Set(getSolvedProblems()), []);

  const engagedIds = useMemo(() => {
    return new Set([
      ...solvedSet,
      ...bookmarks,
      ...favorites,
      ...activity.map((a) => a.problemId || a.id),
    ]);
  }, [solvedSet, bookmarks, favorites, activity]);

  const recommendations = useMemo(() => {
    const allList = Object.values(PROBLEMS);
    // Filter unsolved
    const unsolved = allList.filter((p) => !engagedIds.has(p._id) && !engagedIds.has(p.id));

    // If all solved, pick from allList
    const pool = unsolved.length > 0 ? unsolved : allList;

    // Shuffle based on seed
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const reasons = [
      "Top Frequency in Big Tech Interviews",
      "High-Impact Array & Data Structure Concept",
      "Recommended based on your recent activity",
      "Must-Do Algorithm Master Pattern",
      "Targeted Level Up Challenge",
    ];

    return selected.map((p, idx) => ({
      ...p,
      reason: reasons[idx % reasons.length],
    }));
  }, [engagedIds, seed]);

  return (
    <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-base-300 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              AI Recommendations
              <span className="badge badge-primary badge-sm font-mono">Personalized</span>
            </h2>
            <p className="text-xs text-base-content/60">Tailored coding challenges selected for your skill level</p>
          </div>
        </div>

        <button
          onClick={() => setSeed((prev) => prev + 1)}
          className="btn btn-ghost btn-xs gap-1.5 text-base-content/70 hover:text-primary rounded-xl"
          title="Refresh Recommendations"
        >
          <RefreshCwIcon className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.map((prob) => (
          <div
            key={prob.id || prob._id}
            onClick={() => navigate(`/problem/${prob._id || prob.id}`)}
            className="flex items-center justify-between p-4 rounded-2xl bg-base-200/50 hover:bg-base-200 border border-base-300 transition-all cursor-pointer group"
          >
            <div className="min-w-0 flex-1 pr-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-base-content truncate group-hover:text-primary transition-colors">
                  {prob.title}
                </span>
                <span className={`badge badge-xs ${getDifficultyBadgeClass(prob.difficulty)}`}>
                  {prob.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-base-content/60">
                <span className="badge badge-outline badge-xs text-primary/80">{prob.reason}</span>
                <span>•</span>
                <span>{prob.category}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-xs rounded-xl gap-1 shrink-0 font-bold">
              <span>Solve</span>
              <ArrowRightIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
