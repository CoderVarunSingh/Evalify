import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import DailyChallenge from "../components/DailyChallenge";
import StreakCalendar from "../components/StreakCalendar";
import ActivityFeed from "../components/ActivityFeed";
import Achievements from "../components/Achievements";
import BookmarksPanel from "../components/BookmarksPanel";
import FavoritesPanel from "../components/FavoritesPanel";
import RevisionLists from "../components/RevisionLists";
import Recommendations from "../components/Recommendations";
import CodingAnalyticsView from "../components/CodingAnalyticsView";
import { getSolvedProblems } from "../lib/solvedStorage";
import { getCalendarStreak } from "../lib/streakManager";
import { PROBLEMS } from "../data/problems";
import { problemsData } from "../data/problemsData";
import {
  FlameIcon,
  TrophyIcon,
  BookOpenIcon,
  SparklesIcon,
  BookmarkIcon,
  StarIcon,
  ListChecksIcon,
  ActivityIcon,
  Code2Icon,
  LayoutDashboardIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  BarChart3Icon,
} from "lucide-react";

function PracticeDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const history = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("ai_interview_history") || "[]");
    } catch {
      return [];
    }
  }, []);

  const solvedIds = useMemo(() => getSolvedProblems(), []);
  const streak = useMemo(() => getCalendarStreak(history), [history]);

  // Total available problems
  const totalProblemsCount = Object.keys(PROBLEMS).length || problemsData.length;

  // Breakdown of solved difficulties
  const solvedDetails = useMemo(() => {
    let easy = 0, medium = 0, hard = 0;
    solvedIds.forEach((id) => {
      const pData = problemsData.find((p) => p._id === id || p.id === id);
      const pRich = Object.values(PROBLEMS).find((p) => p._id === id || p.id === id || p.title === id);
      const diff = pRich?.difficulty || pData?.difficulty || "Easy";
      if (diff === "Easy") easy++;
      else if (diff === "Medium") medium++;
      else if (diff === "Hard") hard++;
    });
    return { easy, medium, hard, total: solvedIds.length };
  }, [solvedIds]);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* HERO BANNER SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-base-100 via-base-100 to-primary/10 border border-base-300 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* User & Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary font-bold gap-1 text-xs">
                  <SparklesIcon className="w-3.5 h-3.5" /> LeetCode Practice Hub
                </span>
                <span className="badge badge-amber font-mono font-bold text-xs gap-1">
                  <FlameIcon className="w-3.5 h-3.5 fill-amber-500" /> {streak} Day Streak
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-base-content">
                Practice & Skill Dashboard
              </h1>
              <p className="text-base-content/70 text-sm max-w-xl">
                Master data structures, algorithms, and technical interview patterns with daily challenges, streak heatmaps, and embedded coding telemetry.
              </p>
            </div>

            {/* Solved Progress Metrics */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-base-200/80 p-4 rounded-2xl border border-base-300 w-full lg:w-auto">
              {/* Stat Total */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary text-primary-content font-bold shadow-md shrink-0">
                  <TrophyIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-base-content/60 font-medium">Problems Solved</div>
                  <div className="text-2xl font-black text-primary font-mono">
                    {solvedDetails.total} <span className="text-xs text-base-content/50 font-normal">/ {totalProblemsCount}</span>
                  </div>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                <div className="text-center px-2.5 py-1 bg-success/10 border border-success/20 rounded-xl">
                  <div className="text-success font-bold font-mono">{solvedDetails.easy}</div>
                  <div className="text-[10px] text-base-content/60">Easy</div>
                </div>
                <div className="text-center px-2.5 py-1 bg-warning/10 border border-warning/20 rounded-xl">
                  <div className="text-warning font-bold font-mono">{solvedDetails.medium}</div>
                  <div className="text-[10px] text-base-content/60">Med</div>
                </div>
                <div className="text-center px-2.5 py-1 bg-error/10 border border-error/20 rounded-xl">
                  <div className="text-error font-bold font-mono">{solvedDetails.hard}</div>
                  <div className="text-[10px] text-base-content/60">Hard</div>
                </div>
              </div>

              <button
                onClick={() => navigate("/problems")}
                className="btn btn-sm btn-primary rounded-xl font-bold text-xs gap-1 shrink-0"
              >
                <span>Browse Problems</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION BAR */}
          <div className="flex items-center gap-2 mt-8 pt-4 border-t border-base-300/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`btn btn-sm rounded-xl font-bold gap-2 ${
                activeTab === "overview" ? "btn-primary" : "btn-ghost"
              }`}
            >
              <LayoutDashboardIcon className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("coding-stats")}
              className={`btn btn-sm rounded-xl font-bold gap-2 ${
                activeTab === "coding-stats" ? "btn-primary" : "btn-ghost"
              }`}
            >
              <Code2Icon className="w-4 h-4 text-primary" />
              <span>Coding Stats</span>
            </button>

            <button
              onClick={() => setActiveTab("streak")}
              className={`btn btn-sm rounded-xl font-bold gap-2 ${
                activeTab === "streak" ? "btn-primary" : "btn-ghost"
              }`}
            >
              <FlameIcon className="w-4 h-4 text-amber-500" />
              <span>Streak & Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`btn btn-sm rounded-xl font-bold gap-2 ${
                activeTab === "bookmarks" ? "btn-primary" : "btn-ghost"
              }`}
            >
              <BookmarkIcon className="w-4 h-4 text-warning" />
              <span>Bookmarks & Starred</span>
            </button>

            <button
              onClick={() => setActiveTab("revision")}
              className={`btn btn-sm rounded-xl font-bold gap-2 ${
                activeTab === "revision" ? "btn-primary" : "btn-ghost"
              }`}
            >
              <ListChecksIcon className="w-4 h-4 text-secondary" />
              <span>Revision Lists</span>
            </button>

            <button
              onClick={() => setActiveTab("recommendations")}
              className={`btn btn-sm rounded-xl font-bold gap-2 ${
                activeTab === "recommendations" ? "btn-primary" : "btn-ghost"
              }`}
            >
              <SparklesIcon className="w-4 h-4 text-accent" />
              <span>AI Recommendations</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Daily Challenge & Recommendations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DailyChallenge />
              <Recommendations />
            </div>

            {/* Streak Calendar Heatmap */}
            <StreakCalendar />

            {/* Bookmarks, Favorites, Revision Lists Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BookmarksPanel />
              <FavoritesPanel />
              <RevisionLists />
            </div>

            {/* Achievements & Activity Feed Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Achievements />
              <ActivityFeed />
            </div>
          </div>
        )}

        {activeTab === "coding-stats" && (
          <div className="space-y-8">
            <CodingAnalyticsView />
          </div>
        )}

        {activeTab === "streak" && (
          <div className="space-y-8">
            <StreakCalendar />
            <ActivityFeed />
          </div>
        )}

        {activeTab === "bookmarks" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BookmarksPanel />
            <FavoritesPanel />
          </div>
        )}

        {activeTab === "revision" && (
          <div className="space-y-8">
            <RevisionLists />
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-8">
            <Recommendations />
            <Achievements />
          </div>
        )}
      </div>
    </div>
  );
}

export default PracticeDashboardPage;
