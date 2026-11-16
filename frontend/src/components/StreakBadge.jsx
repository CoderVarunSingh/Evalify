import React from 'react';
import { Flame } from 'lucide-react';

const StreakBadge = ({ streak }) => {
  if (!streak) return null;
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-red-600 text-white px-3 py-1 rounded-full shadow-md animate-pulse" id="streak-badge">
      <Flame className="w-4 h-4" />
      <span className="font-medium">Streak: {streak}</span>
    </div>
  );
};

export default StreakBadge;
