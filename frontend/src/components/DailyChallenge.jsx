import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PROBLEMS } from "../data/problems";
import { problemsData } from "../data/problemsData";
import { getDifficultyBadgeClass } from "../lib/utils";
import { FlameIcon, SparklesIcon, ClockIcon, ArrowRightIcon, CalendarIcon } from "lucide-react";

function DailyChallenge() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Deterministic problem choice based on date
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const problemList = Object.values(PROBLEMS);
    const selected = problemList[Math.abs(hash) % problemList.length] || problemsData[0];
    setChallenge(selected);

    // Countdown to midnight
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight - now;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeft(`${hours.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!challenge) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-base-100 to-primary/10 border border-amber-500/30 p-6 shadow-xl">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
            <FlameIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-500">Daily Challenge</span>
              <span className="badge badge-xs badge-amber font-mono font-semibold">+50 XP Bonus</span>
            </div>
            <h3 className="text-xl font-bold text-base-content">{challenge.title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono bg-base-200/80 px-3 py-1.5 rounded-xl border border-base-300 shrink-0 text-base-content/80">
          <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
          <span>Resets in: <strong className="text-amber-500 font-bold">{timeLeft}</strong></span>
        </div>
      </div>

      <p className="text-sm text-base-content/75 line-clamp-2 mb-4">
        {challenge.description?.text || "Solve today's featured problem to keep your streak alive and earn exclusive XP rewards!"}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-300/60">
        <div className="flex items-center gap-2">
          <span className={`badge ${getDifficultyBadgeClass(challenge.difficulty)}`}>{challenge.difficulty}</span>
          <span className="badge badge-outline text-xs">{challenge.category}</span>
        </div>

        <button
          onClick={() => navigate(`/problem/${challenge._id || challenge.id}`)}
          className="btn btn-sm btn-primary gap-2 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] transition-all"
        >
          <SparklesIcon className="w-4 h-4" />
          Solve Today's Challenge
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default DailyChallenge;
