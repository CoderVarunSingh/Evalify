/**
 * Evalify Calendar Streak & Verified Badge Management Utility
 */

/**
 * Calculates candidate's consecutive calendar day interview streak.
 * Rules:
 * 1. Increments at most ONCE per unique calendar day (YYYY-MM-DD), regardless of interview count.
 * 2. Active streak continues if candidate completed an interview today or yesterday.
 * 3. Resets to 0 if candidate missed a calendar day.
 */
export function getCalendarStreak(history = []) {
  if (!history || history.length === 0) return 0;

  const uniqueDatesSet = new Set();

  history.forEach((session) => {
    let dateStr = session.isoDate || session.date;
    if (session.timestamp) {
      dateStr = new Date(session.timestamp).toISOString().split("T")[0];
    } else if (dateStr && !dateStr.includes("-")) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        dateStr = parsed.toISOString().split("T")[0];
      }
    }
    if (dateStr && dateStr.length >= 10) {
      uniqueDatesSet.add(dateStr.substring(0, 10));
    }
  });

  const sortedDates = Array.from(uniqueDatesSet).sort().reverse();
  if (sortedDates.length === 0) return 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  const mostRecentDate = sortedDates[0];

  // If most recent interview was before yesterday, streak is broken -> 0
  if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
    return 0;
  }

  // Count consecutive days backward
  let currentStreak = 0;
  let checkDate = new Date(mostRecentDate);

  while (true) {
    const checkStr = checkDate.toISOString().split("T")[0];
    if (uniqueDatesSet.has(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return currentStreak;
}

/**
 * Verified Master Badges Configuration & Conditions
 */
export const BADGES = [
  {
    id: "first_interview",
    icon: "🎯",
    name: "First Strike",
    desc: "Completed your first AI interview session",
    condition: (history, streak) => history.length >= 1,
  },
  {
    id: "three_interviews",
    icon: "🔥",
    name: "Triple Threat",
    desc: "Completed 3 AI interview sessions",
    condition: (history, streak) => history.length >= 3,
  },
  {
    id: "high_scorer",
    icon: "⭐",
    name: "High Achiever",
    desc: "Scored 80 or above in any interview session",
    condition: (history, streak) => history.some((r) => (r.overallScore || 0) >= 80),
  },
  {
    id: "streak_3",
    icon: "🏅",
    name: "Consistent Performer",
    desc: "Maintained a 3-consecutive-day interview streak",
    condition: (history, streak) => streak >= 3,
  },
  {
    id: "algo_ace",
    icon: "💡",
    name: "Algorithm Ace",
    desc: "Scored 85+ in a Software Engineer or Frontend interview",
    condition: (history, streak) =>
      history.some((r) => (r.role?.includes("Frontend") || r.role?.includes("Software")) && (r.overallScore || 0) >= 85),
  },
  {
    id: "hr_pro",
    icon: "🤝",
    name: "HR Champion",
    desc: "Completed an HR or Behavioral interview session",
    condition: (history, streak) =>
      history.some((r) => r.role?.includes("HR") || r.type === "HR" || r.role?.includes("Behavioral")),
  },
  {
    id: "coding_ninja",
    icon: "💻",
    name: "Coding Ninja",
    desc: "Scored 80+ in a Live Coding Challenge session",
    condition: (history, streak) =>
      history.some((r) => (r.type === "Coding" || r.mode === "coding") && (r.overallScore || 0) >= 80),
  },
  {
    id: "perfect_security",
    icon: "🛡️",
    name: "Security Sentinel",
    desc: "Completed an interview with 100% Security Integrity compliance",
    condition: (history, streak) =>
      history.some((r) => (r.securityReport?.integrityScore ?? 100) === 100),
  },
];
