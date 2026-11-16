import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";
import { PROBLEMS } from "../data/problems";
import { problemsData } from "../data/problemsData";
import {
  ActivityIcon,
  CheckCircle2Icon,
  XCircleIcon,
  BookmarkIcon,
  StarIcon,
  ClockIcon,
  ArrowUpRightIcon,
  Trash2Icon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ActivityFeed() {
  const [activity, setActivity] = useLocalStorage("iq_activity", []);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // Helper to resolve problem info
  const getProblemInfo = (pid) => {
    const pData = problemsData.find((p) => p._id === pid || p.id === pid);
    const pRich = Object.values(PROBLEMS).find((p) => p._id === pid || p.id === pid || p.title === pid);
    return {
      title: pRich?.title || pData?.title || pid || "Problem",
      difficulty: pRich?.difficulty || pData?.difficulty || "Easy",
    };
  };

  const filteredActivity = activity.filter((act) => {
    if (filter === "all") return true;
    if (filter === "accepted") return act.action?.toLowerCase().includes("accepted") || act.action?.toLowerCase().includes("passed") || act.status === "passed";
    if (filter === "bookmark") return act.action?.toLowerCase().includes("bookmark") || act.type === "bookmark";
    return true;
  });

  const recent = filteredActivity.slice(-10).reverse();

  const handleClear = () => {
    if (window.confirm("Clear your activity feed history?")) {
      setActivity([]);
    }
  };

  return (
    <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-300 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <ActivityIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <p className="text-xs text-base-content/60">Timeline of your latest submissions & interactions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="join bg-base-200 p-1 rounded-xl">
            <button
              onClick={() => setFilter("all")}
              className={`join-item btn btn-xs ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("accepted")}
              className={`join-item btn btn-xs ${filter === "accepted" ? "btn-success text-white" : "btn-ghost"}`}
            >
              Accepted
            </button>
            <button
              onClick={() => setFilter("bookmark")}
              className={`join-item btn btn-xs ${filter === "bookmark" ? "btn-warning" : "btn-ghost"}`}
            >
              Bookmarks
            </button>
          </div>

          {activity.length > 0 && (
            <button
              onClick={handleClear}
              className="btn btn-ghost btn-xs text-error hover:bg-error/10 p-1.5 rounded-lg"
              title="Clear Activity History"
            >
              <Trash2Icon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-10 bg-base-200/40 rounded-2xl border border-dashed border-base-300">
          <ActivityIcon className="w-10 h-10 mx-auto text-base-content/30 mb-2" />
          <p className="font-semibold text-base-content/70">No activity logged yet.</p>
          <p className="text-xs text-base-content/50">Solve coding challenges to build your activity history!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((item, idx) => {
            const prob = getProblemInfo(item.problemId || item.id);
            const isAccepted = item.action?.toLowerCase().includes("accepted") || item.action?.toLowerCase().includes("passed") || item.status === "passed";
            const isBookmark = item.action?.toLowerCase().includes("bookmark") || item.type === "bookmark";
            const isFavorite = item.action?.toLowerCase().includes("favorite") || item.type === "favorite";

            return (
              <div
                key={idx}
                onClick={() => navigate(`/problem/${item.problemId || item.id}`)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/50 hover:bg-base-200 border border-base-300/70 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    {isAccepted ? (
                      <CheckCircle2Icon className="w-5 h-5 text-success" />
                    ) : isBookmark ? (
                      <BookmarkIcon className="w-5 h-5 text-warning fill-warning" />
                    ) : isFavorite ? (
                      <StarIcon className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-error" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-base-content truncate group-hover:text-primary transition-colors">
                        {prob.title}
                      </span>
                      <span className={`badge badge-xs ${getDifficultyBadgeClass(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-base-content/60 flex items-center gap-2 mt-0.5">
                      <span>{item.action || "Executed solution"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <ClockIcon className="w-3 h-3 opacity-60" />
                        {new Date(item.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold shrink-0">
                  <span>Open</span>
                  <ArrowUpRightIcon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
