import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  BarChart3Icon,
  CalendarIcon,
  SearchIcon,
  FlameIcon,
  TrophyIcon,
  AwardIcon,
  ChevronRightIcon,
  TargetIcon,
  TrendingUpIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ShieldCheckIcon,
  Code2Icon,
  MessageSquareIcon,
  ZapIcon,
  CpuIcon,
  SparklesIcon,
  ChevronDownIcon,
  FilterIcon,
  LockIcon,
} from "lucide-react";
import { getCalendarStreak, BADGES } from "../lib/streakManager";

function AnalyticsPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [questionFilter, setQuestionFilter] = useState("All");
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("ai_interview_history");
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch (e) {
        setHistory([]);
      }
    }
  }, []);

  // Filter history by search and role
  const filteredHistory = history.filter((r) => {
    const matchesSearch =
      r.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "All" || r.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Calculate Real-Time Aggregate Statistics from Empirical Session History
  const totalInterviews = history.length;
  const streak = getCalendarStreak(history);

  const avgOverallScore = totalInterviews
    ? Math.round(history.reduce((acc, r) => acc + (r.overallScore || 0), 0) / totalInterviews)
    : 0;

  const bestScore = totalInterviews ? Math.max(...history.map((r) => r.overallScore || 0)) : 0;

  const avgCommScore = totalInterviews
    ? Math.round(history.reduce((acc, r) => acc + (r.avgComm || 0), 0) / totalInterviews)
    : 0;

  const avgTechScore = totalInterviews
    ? Math.round(history.reduce((acc, r) => acc + (r.avgTech || 0), 0) / totalInterviews)
    : 0;

  const avgCodingScore = totalInterviews
    ? Math.round(history.reduce((acc, r) => acc + (r.avgProblemSolving || 0), 0) / totalInterviews)
    : 0;

  const avgConfScore = totalInterviews
    ? Math.round(history.reduce((acc, r) => acc + (r.avgConf || 0), 0) / totalInterviews)
    : 0;

  const avgCorrectness = totalInterviews
    ? Math.round(history.reduce((acc, r) => acc + (r.avgCorrectness || r.overallScore || 0), 0) / totalInterviews)
    : 0;

  const avgLogicalReasoning = totalInterviews
    ? Math.round(history.reduce((acc, r) => acc + (r.avgLogicalReasoning || 0), 0) / totalInterviews)
    : 0;

  const avgIntegrityScore = totalInterviews
    ? Math.round(history.reduce((acc, r) => acc + (r.securityReport?.integrityScore ?? 100), 0) / totalInterviews)
    : 100;

  const roles = ["All", ...Array.from(new Set(history.map((r) => r.role)))];

  // Aggregate Question-wise Analysis from all sessions
  const allQuestionEvaluations = history.flatMap((session) =>
    (session.questionEvaluations || []).map((q) => ({
      ...q,
      sessionRole: session.role,
      sessionDate: session.date,
      sessionCompany: session.company,
      sessionId: session.id,
    }))
  );

  const filteredQuestions = allQuestionEvaluations.filter((q) => {
    const isSkipped =
      q.evaluation?.attemptStatus === "Not Attempted" ||
      !q.candidateAnswer ||
      q.candidateAnswer === "Not Attempted";

    if (questionFilter === "Attempted") return !isSkipped;
    if (questionFilter === "Skipped") return isSkipped;
    if (questionFilter === "High") return (q.evaluation?.score || 0) >= 80;
    if (questionFilter === "Low") return (q.evaluation?.score || 0) < 60;
    return true;
  });

  // Collect Empirical Strengths & Weaknesses
  const allStrengths = history
    .flatMap((r) => r.questionEvaluations || [])
    .flatMap((q) => q.evaluation?.strengths || [])
    .filter((s) => s && !s.includes("None (Question skipped)"));

  const allWeaknesses = history
    .flatMap((r) => r.questionEvaluations || [])
    .flatMap((q) => q.evaluation?.mistakes || [])
    .filter((w) => w && !w.includes("Question was not attempted"));

  // Deduplicate and get top 5 strengths & weaknesses
  const topStrengths = Array.from(new Set(allStrengths)).slice(0, 5);
  const topWeaknesses = Array.from(new Set(allWeaknesses)).slice(0, 5);

  // Generate Personalized Recommendations based on lowest scoring dimension
  const dimensionScores = [
    { label: "Technical Depth", score: avgTechScore },
    { label: "Communication & Clarity", score: avgCommScore },
    { label: "Coding & Problem Solving", score: avgCodingScore },
    { label: "Confidence & Delivery", score: avgConfScore },
    { label: "Logical Reasoning", score: avgLogicalReasoning },
  ];
  dimensionScores.sort((a, b) => a.score - b.score);
  const lowestDimension = dimensionScores[0];

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold mb-2">
              <BarChart3Icon className="w-3.5 h-3.5" /> Verified Performance & Streak Analytics
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-base-content tracking-tight">
              Interview Analytics & Badges Dashboard
            </h1>
            <p className="text-base-content/70 text-xs sm:text-sm mt-1">
              Real-time empirical evaluation computed across your completed AI interview sessions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/coding-analytics")}
              className="btn btn-accent btn-outline btn-sm sm:btn-md gap-2 font-bold"
            >
              <Code2Icon className="w-4 h-4" /> Coding Analytics
            </button>
            <button
              onClick={() => navigate("/ai-interview")}
              className="btn btn-primary btn-sm sm:btn-md gap-2 font-bold shadow-lg"
            >
              <SparklesIcon className="w-4 h-4" /> Start New AI Interview
            </button>
          </div>
        </div>

        {/* IF NO INTERVIEW HISTORY: Render Clean Empty State */}
        {totalInterviews === 0 ? (
          <div className="bg-base-100 border border-base-300 rounded-3xl p-12 text-center shadow-xl space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-primary/15 text-primary flex items-center justify-center mx-auto shadow-inner">
              <BarChart3Icon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-base-content">No Interview Analytics Yet</h2>
            <p className="text-sm text-base-content/70 max-w-md mx-auto">
              Complete your first AI technical interview session to generate real-time performance metrics, verified badges, and calendar streaks.
            </p>
            <button onClick={() => navigate("/ai-interview")} className="btn btn-primary btn-md gap-2 font-bold px-6">
              Launch First AI Interview
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. TOP EXECUTIVE STATS GRID WITH CALENDAR STREAK */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-base-content/70">Interviews Done</span>
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-black text-base-content">{totalInterviews}</div>
                <div className="text-[11px] text-base-content/60 mt-1">Completed Sessions</div>
              </div>

              <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-base-content/70">Average AI Score</span>
                  <BarChart3Icon className="w-5 h-5 text-success" />
                </div>
                <div className="text-3xl font-black text-success">{avgOverallScore} <span className="text-xs text-base-content/60 font-bold">/ 100</span></div>
                <div className="text-[11px] text-base-content/60 mt-1">Across all tracks</div>
              </div>

              <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-base-content/70">Calendar Day Streak</span>
                  <FlameIcon className="w-5 h-5 text-error" />
                </div>
                <div className="text-3xl font-black text-error">{streak} <span className="text-xs text-base-content/60 font-bold">Day{streak !== 1 ? "s" : ""}</span></div>
                <div className="text-[11px] text-base-content/60 mt-1">Increments once/day</div>
              </div>

              <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-base-content/70">Highest Score</span>
                  <TrophyIcon className="w-5 h-5 text-warning" />
                </div>
                <div className="text-3xl font-black text-warning">{bestScore} <span className="text-xs text-base-content/60 font-bold">/ 100</span></div>
                <div className="text-[11px] text-base-content/60 mt-1">Personal Best</div>
              </div>
            </div>

            {/* 2. VERIFIED MASTER BADGES & ACHIEVEMENTS GRID */}
            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-base-300 pb-4">
                <div className="flex items-center gap-2.5">
                  <AwardIcon className="w-6 h-6 text-warning" />
                  <h2 className="text-xl font-bold text-base-content">
                    Verified Achievements & Master Badges
                  </h2>
                </div>
                <span className="text-xs text-base-content/60 font-semibold">
                  Unlocked: {BADGES.filter((b) => b.condition(history, streak)).length} / {BADGES.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {BADGES.map((badge) => {
                  const unlocked = badge.condition(history, streak);
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        unlocked
                          ? "bg-warning/10 border-warning/40 shadow-lg scale-[1.01]"
                          : "bg-base-200/40 border-base-300 opacity-40 grayscale"
                      }`}
                    >
                      <div className="text-3xl mb-1.5">{badge.icon}</div>
                      <div className="text-xs font-bold text-base-content flex items-center justify-center gap-1">
                        {badge.name}
                        {unlocked ? (
                          <CheckCircle2Icon className="w-3.5 h-3.5 text-warning shrink-0" />
                        ) : (
                          <LockIcon className="w-3 h-3 text-base-content/50 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-base-content/70 mt-1 leading-tight">{badge.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. CORE EVALUATION DIMENSIONS & PROGRESS TRENDS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: 6 Evaluation Dimension Progress Bars (7 Cols) */}
              <div className="lg:col-span-7 bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-base-300 pb-4">
                  <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                    <TargetIcon className="w-5 h-5 text-primary" /> Evaluation Dimensions Breakdown
                  </h2>
                  <span className="text-xs text-base-content/60 font-semibold">Empirical Averages</span>
                </div>

                <div className="space-y-4">
                  {/* Technical Score */}
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
                      <span className="flex items-center gap-2 text-base-content">
                        <CpuIcon className="w-4 h-4 text-primary" /> Technical Accuracy
                      </span>
                      <span className="text-primary font-black">{avgTechScore} / 100</span>
                    </div>
                    <progress className="progress progress-primary w-full h-2.5" value={avgTechScore} max="100" />
                  </div>

                  {/* Communication Score */}
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
                      <span className="flex items-center gap-2 text-base-content">
                        <MessageSquareIcon className="w-4 h-4 text-success" /> Communication & Articulation
                      </span>
                      <span className="text-success font-black">{avgCommScore} / 100</span>
                    </div>
                    <progress className="progress progress-success w-full h-2.5" value={avgCommScore} max="100" />
                  </div>

                  {/* Coding / Problem Solving Score */}
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
                      <span className="flex items-center gap-2 text-base-content">
                        <Code2Icon className="w-4 h-4 text-accent" /> Coding & Problem-Solving
                      </span>
                      <span className="text-accent font-black">{avgCodingScore} / 100</span>
                    </div>
                    <progress className="progress progress-accent w-full h-2.5" value={avgCodingScore} max="100" />
                  </div>

                  {/* Confidence Score */}
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
                      <span className="flex items-center gap-2 text-base-content">
                        <ZapIcon className="w-4 h-4 text-warning" /> Confidence & Conviction
                      </span>
                      <span className="text-warning font-black">{avgConfScore} / 100</span>
                    </div>
                    <progress className="progress progress-warning w-full h-2.5" value={avgConfScore} max="100" />
                  </div>

                  {/* Correctness Score */}
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
                      <span className="flex items-center gap-2 text-base-content">
                        <CheckCircle2Icon className="w-4 h-4 text-secondary" /> Solution Correctness
                      </span>
                      <span className="text-secondary font-black">{avgCorrectness} / 100</span>
                    </div>
                    <progress className="progress progress-secondary w-full h-2.5" value={avgCorrectness} max="100" />
                  </div>

                  {/* Logical Reasoning */}
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
                      <span className="flex items-center gap-2 text-base-content">
                        <BrainCircuitIcon className="w-4 h-4 text-info" /> Logical Reasoning
                      </span>
                      <span className="text-info font-black">{avgLogicalReasoning} / 100</span>
                    </div>
                    <progress className="progress progress-info w-full h-2.5" value={avgLogicalReasoning} max="100" />
                  </div>
                </div>
              </div>

              {/* Right Column: Progress Trends Timeline Graph (5 Cols) */}
              <div className="lg:col-span-5 bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-base-300 pb-4">
                  <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                    <TrendingUpIcon className="w-5 h-5 text-success" /> Session Score Trend
                  </h2>
                  <span className="text-xs text-base-content/60 font-semibold">{history.length} Sessions</span>
                </div>

                <div className="space-y-3">
                  {history.slice(0, 5).map((session, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        sessionStorage.setItem("latest_ai_report", JSON.stringify(session));
                        navigate(`/ai-interview/report/${session.id}`);
                      }}
                      className="p-3.5 rounded-2xl bg-base-200/60 border border-base-300 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-base-content">{session.role} Interview</div>
                        <div className="text-[10px] text-base-content/60">{session.company} • {session.date}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-base font-black text-primary">{session.overallScore}</div>
                          <div className="text-[9px] uppercase font-bold text-base-content/60">Score</div>
                        </div>
                        <span className="badge badge-primary badge-xs">
                          {session.grade || "B"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. STRENGTHS, WEAKNESSES & PERSONALIZED RECOMMENDATIONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Key Strengths */}
              <div className="bg-base-100 border border-success/30 rounded-3xl p-6 shadow-xl space-y-3">
                <h3 className="text-base font-bold text-success flex items-center gap-2">
                  <CheckCircle2Icon className="w-5 h-5" /> Top Empirical Strengths
                </h3>
                {topStrengths.length > 0 ? (
                  <ul className="space-y-2 text-xs text-base-content/80">
                    {topStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-success/5 p-2.5 rounded-xl border border-success/20">
                        <span className="text-success font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-base-content/60 italic">Complete technical questions to identify key strengths.</p>
                )}
              </div>

              {/* Card 2: Improvement Areas */}
              <div className="bg-base-100 border border-error/30 rounded-3xl p-6 shadow-xl space-y-3">
                <h3 className="text-base font-bold text-error flex items-center gap-2">
                  <XCircleIcon className="w-5 h-5" /> Identified Skill Gaps
                </h3>
                {topWeaknesses.length > 0 ? (
                  <ul className="space-y-2 text-xs text-base-content/80">
                    {topWeaknesses.map((wk, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-error/5 p-2.5 rounded-xl border border-error/20">
                        <span className="text-error font-bold">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-base-content/60 italic">No significant skill gaps identified yet.</p>
                )}
              </div>

              {/* Card 3: AI Recommendations */}
              <div className="bg-base-100 border border-primary/30 rounded-3xl p-6 shadow-xl space-y-3">
                <h3 className="text-base font-bold text-primary flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" /> Tailored Recommendation
                </h3>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-2 text-xs text-base-content/80">
                  <div className="font-bold text-primary">Focus Area: {lowestDimension.label} ({lowestDimension.score}/100)</div>
                  <p className="leading-relaxed">
                    Based on your empirical performance, practicing structured explanations in <strong>{lowestDimension.label}</strong> will yield the highest score improvement in upcoming interviews.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. QUESTION-WISE DETAILED ANALYSIS DRAWER */}
            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-base-300 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                    <BrainCircuitIcon className="w-5 h-5 text-primary" /> Question-wise Empirical Performance Analysis
                  </h2>
                  <p className="text-xs text-base-content/60 mt-0.5">
                    Detailed evaluation logs for all questions answered across your interview sessions ({allQuestionEvaluations.length} total)
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  {["All", "Attempted", "Skipped", "High", "Low"].map((flt) => (
                    <button
                      key={flt}
                      onClick={() => setQuestionFilter(flt)}
                      className={`px-3 py-1.5 rounded-xl border transition-all ${
                        questionFilter === flt
                          ? "bg-primary text-primary-content border-primary shadow"
                          : "bg-base-200 border-base-300 text-base-content/70 hover:bg-base-300"
                      }`}
                    >
                      {flt}
                    </button>
                  ))}
                </div>
              </div>

              {filteredQuestions.length > 0 ? (
                <div className="space-y-3">
                  {filteredQuestions.map((item, idx) => {
                    const isExpanded = expandedQuestionIdx === idx;
                    const isSkipped =
                      item.evaluation?.attemptStatus === "Not Attempted" ||
                      !item.candidateAnswer ||
                      item.candidateAnswer === "Not Attempted";

                    return (
                      <div
                        key={idx}
                        className="bg-base-200/50 border border-base-300 rounded-2xl overflow-hidden transition-all"
                      >
                        <div
                          onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                          className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-base-200/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-base-content/50">Q{idx + 1}</span>
                            <div>
                              <div className="font-bold text-xs sm:text-sm text-base-content max-w-xl truncate">
                                {item.question}
                              </div>
                              <div className="text-[10px] text-base-content/60 mt-0.5">
                                Track: {item.sessionRole} • {item.sessionDate}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            {isSkipped ? (
                              <span className="badge badge-error badge-xs font-bold text-white px-2 py-0.5">Skipped (0)</span>
                            ) : (
                              <span className="text-sm font-black text-success">
                                {item.evaluation?.score ?? 0} / 100
                              </span>
                            )}
                            <ChevronDownIcon className={`w-4 h-4 text-base-content/60 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-5 border-t border-base-300 bg-base-100 space-y-3 animate-in fade-in duration-150">
                            <div>
                              <div className="text-[11px] font-bold text-base-content/70 mb-1">Candidate Response:</div>
                              <div className="bg-base-200/70 p-3 rounded-xl border border-base-300 text-xs font-sans text-base-content/90">
                                {item.candidateAnswer}
                              </div>
                            </div>

                            {item.evaluation?.modelAnswer && (
                              <div>
                                <div className="text-[11px] font-bold text-primary mb-1">AI Model Ideal Answer:</div>
                                <p className="text-xs text-base-content/80 leading-relaxed bg-primary/5 p-3 rounded-xl border border-primary/20">
                                  {item.evaluation.modelAnswer}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-base-content/60">
                  No questions match the selected filter.
                </div>
              )}
            </div>

            {/* 6. INTERVIEW HISTORY TABLE */}
            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" /> Complete Interview Session History
                </h2>

                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
                    <input
                      type="text"
                      placeholder="Search role or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input input-sm bg-base-200 border-base-300 text-base-content pl-9 focus:outline-none w-full text-xs"
                    />
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="select select-sm bg-base-200 border-base-300 text-base-content focus:outline-none text-xs"
                  >
                    {roles.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="space-y-3">
                  {filteredHistory.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-base-200/60 rounded-2xl px-5 py-4 border border-base-300 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => {
                        sessionStorage.setItem("latest_ai_report", JSON.stringify(r));
                        navigate(`/ai-interview/report/${r.id}`);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-bold text-base-content text-sm">{r.role} Interview</div>
                          <div className="text-xs text-base-content/70">{r.company} • {r.difficulty} • {r.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-black text-primary">{r.overallScore}</div>
                          <div className="text-[10px] uppercase text-base-content/60 font-bold">Grade {r.grade || "F"}</div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-base-content/40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-base-content/60 py-8 text-xs">
                  No interview sessions found matching your search.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
