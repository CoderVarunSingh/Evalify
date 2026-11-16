import React, { useMemo } from "react";
import { FlameIcon, CalendarIcon, TrophyIcon } from "lucide-react";
import { getCalendarStreak } from "../lib/streakManager";
import { getSolvedProblems } from "../lib/solvedStorage";

function StreakCalendar() {
  const history = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("ai_interview_history") || "[]");
    } catch {
      return [];
    }
  }, []);

  const solvedList = useMemo(() => getSolvedProblems(), []);
  const streak = getCalendarStreak(history);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Generate 12 Months synchronized with real calendar (Monday -> Sunday)
  const { months, totalActiveDays } = useMemo(() => {
    const activeDates = new Map();

    history.forEach((session) => {
      let dateStr = session.isoDate || session.date;
      if (session.timestamp) {
        dateStr = new Date(session.timestamp).toISOString().split("T")[0];
      }
      if (dateStr && dateStr.length >= 10) {
        const key = dateStr.substring(0, 10);
        activeDates.set(key, (activeDates.get(key) || 0) + 1);
      }
    });

    const activityLogs = JSON.parse(localStorage.getItem("iq_activity") || "[]");
    activityLogs.forEach((act) => {
      if (act.timestamp) {
        const key = new Date(act.timestamp).toISOString().split("T")[0];
        activeDates.set(key, (activeDates.get(key) || 0) + 1);
      }
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const monthList = [];
    let totalActive = 0;

    for (let m = 0; m < 12; m++) {
      const firstDay = new Date(currentYear, m, 1);
      const lastDay = new Date(currentYear, m + 1, 0);
      const daysInMonth = lastDay.getDate();
      const firstWeekday = (firstDay.getDay() + 6) % 7; // Mon = 0, Sun = 6

      const weekCols = [];
      let currentWeek = new Array(7).fill(null);

      // Fill leading empty days before 1st of month
      for (let i = 0; i < firstWeekday; i++) {
        currentWeek[i] = { empty: true };
      }

      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const d = new Date(currentYear, m, dayNum);
        const weekdayIdx = (d.getDay() + 6) % 7; // Mon = 0..Sun = 6
        const dateKey = `${currentYear}-${(m + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
        const count = activeDates.get(dateKey) || 0;
        if (count > 0) totalActive++;

        currentWeek[weekdayIdx] = {
          empty: false,
          date: dateKey,
          dayNum,
          dayName: weekdays[weekdayIdx],
          count,
          level: count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3,
        };

        if (weekdayIdx === 6 || dayNum === daysInMonth) {
          if (weekdayIdx < 6) {
            for (let k = weekdayIdx + 1; k < 7; k++) {
              currentWeek[k] = { empty: true };
            }
          }
          weekCols.push(currentWeek);
          currentWeek = new Array(7).fill(null);
        }
      }

      monthList.push({
        monthName: firstDay.toLocaleString("default", { month: "short" }),
        year: currentYear,
        weeks: weekCols,
      });
    }

    return { months: monthList, totalActiveDays: totalActive };
  }, [history]);

  const getCellColor = (level) => {
    switch (level) {
      case 3:
        return "bg-amber-500 shadow-sm shadow-amber-500/50 border-amber-400";
      case 2:
        return "bg-emerald-500 border-emerald-400";
      case 1:
        return "bg-emerald-500/40 border-emerald-500/30";
      case 0:
      default:
        return "bg-base-300/40 border-base-300/60 hover:border-primary/50";
    }
  };

  return (
    <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-xl space-y-6">
      {/* Top Header & Streak Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-300 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
            <FlameIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Streak Calendar
              <span className="badge badge-amber font-mono font-bold text-xs">{streak} Days Active</span>
            </h2>
            <p className="text-xs text-base-content/65">Synchronized calendar heatmap sectioned monthly (Monday – Sunday)</p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="grid grid-cols-3 gap-3 font-mono">
          <div className="bg-base-200/60 p-3 rounded-2xl border border-base-300 text-center">
            <div className="text-xs text-base-content/60">Current Streak</div>
            <div className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
              <FlameIcon className="w-4 h-4 fill-amber-500" />
              {streak}d
            </div>
          </div>

          <div className="bg-base-200/60 p-3 rounded-2xl border border-base-300 text-center">
            <div className="text-xs text-base-content/60">Active Days</div>
            <div className="text-lg font-black text-emerald-500 flex items-center justify-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {totalActiveDays}
            </div>
          </div>

          <div className="bg-base-200/60 p-3 rounded-2xl border border-base-300 text-center">
            <div className="text-xs text-base-content/60">Solved</div>
            <div className="text-lg font-black text-primary flex items-center justify-center gap-1">
              <TrophyIcon className="w-4 h-4" />
              {solvedList.length}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Sectioned Heatmap Grid with Column Gaps */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[800px] flex gap-3">
          {/* Left Column: Weekday Labels (Aligned with 7 Cell Rows) */}
          <div className="flex flex-col gap-1.5 text-[11px] font-mono font-bold text-base-content/50 shrink-0 pt-7 select-none">
            {weekdays.map((day) => (
              <div key={day} className="h-3.5 flex items-center">
                {day}
              </div>
            ))}
          </div>

          {/* Monthly Sectioned Matrix with Column Gaps Between Months */}
          <div className="flex gap-4 flex-1">
            {months.map((mObj, mIdx) => (
              <div key={mIdx} className="flex flex-col space-y-2">
                {/* Month Name Header */}
                <div className="text-xs font-mono font-bold text-base-content/70 h-5 flex items-center justify-center border-b border-base-300/50">
                  {mObj.monthName}
                </div>

                {/* Week Columns of This Month */}
                <div className="flex gap-1.5">
                  {mObj.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1.5">
                      {week.map((cell, dIdx) => (
                        <div key={dIdx} className="h-3.5 flex items-center justify-center">
                          {cell.empty ? (
                            <div className="w-3.5 h-3.5 rounded-sm bg-transparent pointer-events-none"></div>
                          ) : (
                            <div
                              title={`${cell.date} (${cell.dayName}): ${cell.count} activities`}
                              className={`w-3.5 h-3.5 rounded-sm border transition-all cursor-pointer ${getCellColor(
                                cell.level
                              )}`}
                            ></div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-base-content/60 pt-4 font-mono border-t border-base-300/50 mt-4">
          <span>2026 Calendar Grid (January – December)</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="w-3.5 h-3.5 rounded-sm bg-base-300/40 border border-base-300"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500/40 border border-emerald-500/30"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500 border border-emerald-400"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-amber-500 border border-amber-400 shadow-sm"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreakCalendar;
