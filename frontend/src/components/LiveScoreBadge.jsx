// src/components/LiveScoreBadge.jsx

import React from "react";
import { SparklesIcon } from "lucide-react";

/**
 * Displays the current overall score as a badge.
 * The badge color changes based on the score range.
 */
export default function LiveScoreBadge({ score }) {
  const getColor = (s) => {
    if (s >= 90) return "bg-emerald-600";
    if (s >= 80) return "bg-emerald-500";
    if (s >= 70) return "bg-amber-500";
    if (s >= 60) return "bg-orange-500";
    return "bg-red-600";
  };

  return (
    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white ${getColor(score)}`}>
      <SparklesIcon className="w-3.5 h-3.5" /> Score: {score}
    </div>
  );
}
