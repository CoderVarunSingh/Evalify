import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  COMPANY_PREP_SETS,
  CATEGORIES_LIST,
  COMPANY_ANALYTICS,
  COMPANY_QUESTIONS_DATABASE,
} from "../data/companyQuestions";
import {
  Building2Icon,
  ZapIcon,
  SearchIcon,
  ChevronRightIcon,
  Code2Icon,
  BookOpenIcon,
  FilterIcon,
  SparklesIcon,
  CheckCircle2Icon,
  HelpCircleIcon,
  LightbulbIcon,
  ArrowLeftIcon,
  LayersIcon,
  AwardIcon,
  PlayIcon,
  BarChart3Icon,
  TrendingUpIcon,
  ClockIcon,
  CalendarIcon,
  CheckSquareIcon,
  PieChartIcon,
  StarIcon,
  FlameIcon,
  TargetIcon,
} from "lucide-react";

function CompanyPrepPage() {
  const navigate = useNavigate();

  // Active Company and Views
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "hub"
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "practice"
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  // Active company data
  const activeCompanyObj = COMPANY_PREP_SETS.find(
    (c) => c.company === selectedCompany
  ) || COMPANY_PREP_SETS[0];

  const companyAnalytics = COMPANY_ANALYTICS[selectedCompany] || COMPANY_ANALYTICS.Google;

  const companyQuestions =
    COMPANY_QUESTIONS_DATABASE[selectedCompany] ||
    COMPANY_QUESTIONS_DATABASE.Google;

  // Filtered questions for Practice mode
  const filteredQuestions = companyQuestions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || q.category === categoryFilter;

    const matchesDiff =
      diffFilter === "All" || q.difficulty === diffFilter;

    return matchesSearch && matchesCategory && matchesDiff;
  });

  // Action 1: Launch Company Mock Interview
  const handleLaunchMockInterview = (companyName) => {
    const questions =
      COMPANY_QUESTIONS_DATABASE[companyName] ||
      COMPANY_QUESTIONS_DATABASE.Google;

    const sessionConfig = {
      id: "aisess-" + Date.now(),
      role: "Software Engineer",
      difficulty: "Hard",
      mode: "voice",
      company: companyName,
      questionCount: Math.min(questions.length, 3),
      questions: questions.slice(0, 3).map((q) => ({
        id: q.id,
        title: `${companyName} • ${q.title}`,
        text: q.text,
        category: q.category,
        difficulty: q.difficulty,
        mode: "voice",
      })),
      startTime: new Date().toISOString(),
    };

    sessionStorage.setItem(
      "current_ai_interview",
      JSON.stringify(sessionConfig)
    );
    navigate("/ai-interview/session");
  };

  // Action 2: Open Company Hub (Analytics + Practice)
  const handleOpenCompanyHub = (companyName, defaultTab = "analytics") => {
    setSelectedCompany(companyName);
    setViewMode("hub");
    setActiveTab(defaultTab);
    setCategoryFilter("All");
    setDiffFilter("All");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold mb-3">
              <Building2Icon className="w-3.5 h-3.5" /> Company-Specific Intelligence & Prep Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-base-content">
              Company Analytics & Interview Dashboard
            </h1>
            <p className="text-base-content/70 text-sm mt-1">
              Explore real company interview patterns, coding topic trends, difficulty distributions, 4-week preparation roadmaps, and practice high-frequency questions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`btn btn-sm rounded-xl font-bold gap-2 ${
                viewMode === "grid" ? "btn-primary shadow-md" : "btn-ghost border border-base-300"
              }`}
            >
              <Building2Icon className="w-4 h-4" /> All Companies
            </button>
            <button
              onClick={() => setViewMode("hub")}
              className={`btn btn-sm rounded-xl font-bold gap-2 ${
                viewMode === "hub" ? "btn-primary shadow-md" : "btn-ghost border border-base-300"
              }`}
            >
              <BarChart3Icon className="w-4 h-4" /> {selectedCompany} Dashboard
            </button>
          </div>
        </div>

        {/* VIEW 1: All Company Cards Grid */}
        {viewMode === "grid" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-base-content flex items-center gap-2">
              <LayersIcon className="w-5 h-5 text-primary" /> Target Company Directories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMPANY_PREP_SETS.map((c) => {
                const count = (COMPANY_QUESTIONS_DATABASE[c.company] || []).length;
                const stats = COMPANY_ANALYTICS[c.company]?.successStats;
                return (
                  <div
                    key={c.company}
                    onClick={() => handleOpenCompanyHub(c.company, "analytics")}
                    className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-primary/50 cursor-pointer transition-all hover:shadow-2xl group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-105 transition-transform`}>
                          {c.company[0]}
                        </div>
                        <div className="text-right">
                          <span className="badge badge-primary font-bold text-xs">
                            {count}+ Questions
                          </span>
                          <p className="text-[11px] text-base-content/60 font-semibold mt-1">
                            Offer Rate: <span className="text-success font-bold">{stats?.offerRate}</span>
                          </p>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-base-content mb-1">
                        {c.company}
                      </h3>
                      <p className="text-xs font-semibold text-primary mb-2">
                        {c.tag}
                      </p>
                      <p className="text-xs text-base-content/70 mb-5 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    {/* TWO PRIMARY OPTIONS */}
                    <div className="space-y-2 pt-4 border-t border-base-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchMockInterview(c.company);
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        <ZapIcon className="w-4 h-4 fill-current" />
                        Launch AI Mock Interview
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCompanyHub(c.company, "analytics");
                          }}
                          className="w-full py-2 bg-base-200 hover:bg-base-300 text-base-content font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-base-300 transition-all"
                        >
                          <BarChart3Icon className="w-3.5 h-3.5 text-primary" />
                          Dashboard
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCompanyHub(c.company, "practice");
                          }}
                          className="w-full py-2 bg-base-200 hover:bg-base-300 text-base-content font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-base-300 transition-all"
                        >
                          <BookOpenIcon className="w-3.5 h-3.5 text-warning" />
                          Practice ({count})
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: Company Dashboard & Practice Hub Workspace */}
        {viewMode === "hub" && (
          <div className="space-y-8">
            {/* Active Company Banner */}
            <div className="bg-gradient-to-r from-base-100 via-base-100 to-primary/10 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeCompanyObj.color} flex items-center justify-center text-white font-black text-3xl shadow-lg shrink-0`}>
                  {activeCompanyObj.company[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary font-bold text-xs">
                      Company Prep Hub
                    </span>
                    <span className="text-xs text-base-content/60 font-semibold">
                      Offer Rate: {companyAnalytics.successStats.offerRate} • Avg Score Needed: {companyAnalytics.successStats.avgScoreNeeded}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-base-content mt-1">
                    {activeCompanyObj.company} Intelligence Dashboard
                  </h2>
                  <p className="text-xs text-base-content/70 mt-1 max-w-xl">
                    {activeCompanyObj.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons Header */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleLaunchMockInterview(activeCompanyObj.company)}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all shrink-0"
                >
                  <ZapIcon className="w-4 h-4 fill-current" />
                  Launch {activeCompanyObj.company} AI Interview
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className="px-4 py-3 bg-base-200 hover:bg-base-300 border border-base-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all text-base-content/80"
                >
                  <ArrowLeftIcon className="w-4 h-4" /> Change Company
                </button>
              </div>
            </div>

            {/* Workspace Sub-Tabs Selector Bar */}
            <div className="flex items-center gap-2 bg-base-100 border border-base-300 p-2 rounded-2xl shadow-md">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeTab === "analytics"
                    ? "bg-primary text-primary-content shadow-md"
                    : "text-base-content/70 hover:bg-base-200"
                }`}
              >
                <BarChart3Icon className="w-4 h-4" /> Company Dashboard & Analytics Insights
              </button>

              <button
                onClick={() => setActiveTab("practice")}
                className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeTab === "practice"
                    ? "bg-primary text-primary-content shadow-md"
                    : "text-base-content/70 hover:bg-base-200"
                }`}
              >
                <BookOpenIcon className="w-4 h-4" /> Practice Questions Library ({companyQuestions.length})
              </button>
            </div>

            {/* TAB 1: COMPANY ANALYTICS DASHBOARD */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                {/* 1. Success Statistics Metric Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-success/10 text-success shrink-0">
                      <TrendingUpIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-base-content/60 font-semibold">Offer Acceptance Rate</div>
                      <div className="text-2xl font-black text-success font-mono">{companyAnalytics.successStats.offerRate}</div>
                    </div>
                  </div>

                  <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                      <TargetIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-base-content/60 font-semibold">Passing Benchmark Score</div>
                      <div className="text-2xl font-black text-primary font-mono">{companyAnalytics.successStats.avgScoreNeeded}</div>
                    </div>
                  </div>

                  <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-warning/10 text-warning shrink-0">
                      <CheckSquareIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-base-content/60 font-semibold">Candidates Tested</div>
                      <div className="text-2xl font-black text-warning font-mono">{companyAnalytics.successStats.totalCandidatesTested}</div>
                    </div>
                  </div>

                  <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-secondary/10 text-secondary shrink-0">
                      <StarIcon className="w-6 h-6 fill-secondary" />
                    </div>
                    <div>
                      <div className="text-xs text-base-content/60 font-semibold">Candidate Satisfaction</div>
                      <div className="text-2xl font-black text-secondary font-mono">{companyAnalytics.successStats.candidateRating}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Coding Trends & Difficulty Levels Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Coding Trends Breakdown (7 cols) */}
                  <div className="lg:col-span-7 bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-primary" /> {selectedCompany} Coding Topic Trends & Frequency
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Data aggregated from recent tech interview questions asked at {selectedCompany}.
                    </p>

                    <div className="space-y-3 pt-2">
                      {companyAnalytics.codingTrends.map((item) => (
                        <div key={item.topic} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span>{item.topic}</span>
                            <span className="text-primary font-mono">{item.percentage}%</span>
                          </div>
                          <progress className="progress progress-primary w-full" value={item.percentage} max="100" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Difficulty Distribution (5 cols) */}
                  <div className="lg:col-span-5 bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
                      <FlameIcon className="w-5 h-5 text-amber-500" /> Difficulty Levels Breakdown
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Typical question difficulty ratio encountered in {selectedCompany} interview loops.
                    </p>

                    <div className="space-y-4 pt-2">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-success">Easy Questions</span>
                          <span className="text-success font-mono">{companyAnalytics.difficultyDistribution.Easy}%</span>
                        </div>
                        <progress className="progress progress-success w-full" value={companyAnalytics.difficultyDistribution.Easy} max="100" />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-warning">Medium Questions</span>
                          <span className="text-warning font-mono">{companyAnalytics.difficultyDistribution.Medium}%</span>
                        </div>
                        <progress className="progress progress-warning w-full" value={companyAnalytics.difficultyDistribution.Medium} max="100" />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-error">Hard Questions</span>
                          <span className="text-error font-mono">{companyAnalytics.difficultyDistribution.Hard}%</span>
                        </div>
                        <progress className="progress progress-error w-full" value={companyAnalytics.difficultyDistribution.Hard} max="100" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Interview Process & Rounds Timeline */}
                <div className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                  <h3 className="font-extrabold text-lg text-base-content flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-secondary" /> {selectedCompany} Standard Interview Rounds & Format
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {companyAnalytics.interviewRounds.map((round, idx) => (
                      <div key={idx} className="bg-base-200/70 border border-base-300 rounded-2xl p-4 space-y-2 relative">
                        <div className="w-7 h-7 rounded-full bg-primary text-primary-content text-xs font-extrabold flex items-center justify-center mb-1">
                          {idx + 1}
                        </div>
                        <div className="font-bold text-sm text-base-content">{round.name}</div>
                        <div className="badge badge-sm badge-outline font-semibold text-[11px]">{round.duration}</div>
                        <p className="text-xs text-base-content/70 mt-1">{round.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Frequently Asked Questions & 4-Week Preparation Roadmap Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Top Frequently Asked Questions (6 cols) */}
                  <div className="lg:col-span-6 bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-warning" /> High-Frequency Asked Questions
                      </h3>
                      <button
                        onClick={() => setActiveTab("practice")}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        View All ({companyQuestions.length})
                      </button>
                    </div>

                    <div className="space-y-3">
                      {companyAnalytics.frequentlyAsked.map((faq, idx) => (
                        <div key={idx} className="bg-base-200/60 border border-base-300 rounded-2xl p-4 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-xs text-base-content">{faq.title}</div>
                            <span className="text-[11px] font-semibold text-warning">{faq.frequency}</span>
                          </div>
                          <span className={`badge badge-xs font-bold ${faq.difficulty === 'Hard' ? 'badge-error' : 'badge-warning'}`}>
                            {faq.difficulty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: 4-Week Preparation Roadmap (6 cols) */}
                  <div className="lg:col-span-6 bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-success" /> 4-Week Tailored Preparation Roadmap
                    </h3>

                    <div className="space-y-3">
                      {companyAnalytics.prepRoadmap.map((step, idx) => (
                        <div key={idx} className="bg-base-200/60 border border-base-300 rounded-2xl p-4 flex items-start gap-3">
                          <div className="px-2.5 py-1 rounded-xl bg-success/10 border border-success/30 text-success font-extrabold text-xs shrink-0">
                            {step.week}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-base-content">{step.title}</div>
                            <p className="text-xs text-base-content/70 mt-0.5">{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Card */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white text-center space-y-3 shadow-xl">
                  <h3 className="text-2xl font-black">Ready to Practice {selectedCompany} Interview Questions?</h3>
                  <p className="text-xs text-white/80 max-w-xl mx-auto">
                    Attempt questions in the interactive Practice Library or run a simulated AI Mock Interview to measure your readiness.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleLaunchMockInterview(selectedCompany)}
                      className="px-6 py-3 bg-white text-emerald-800 font-black text-xs rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <ZapIcon className="w-4 h-4 fill-current" />
                      Start {selectedCompany} AI Mock Session
                    </button>
                    <button
                      onClick={() => setActiveTab("practice")}
                      className="px-6 py-3 bg-emerald-900/60 hover:bg-emerald-900/80 border border-white/30 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                    >
                      <BookOpenIcon className="w-4 h-4" />
                      Open Practice Library ({companyQuestions.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRACTICE QUESTIONS LIBRARY */}
            {activeTab === "practice" && (
              <div className="space-y-8">
                {/* PRACTICE MODE FILTER BAR */}
                <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-base-200 pb-5">
                    {/* Search Bar */}
                    <div className="relative w-full lg:w-96">
                      <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/50" />
                      <input
                        type="text"
                        placeholder={`Search ${activeCompanyObj.company} questions or topics...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-base-200 border border-base-300 text-base-content text-xs font-semibold rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Difficulty Selector */}
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-base-content/60">Difficulty:</span>
                      <div className="flex items-center gap-1 bg-base-200 p-1 rounded-xl border border-base-300">
                        {["All", "Easy", "Medium", "Hard"].map((d) => (
                          <button
                            key={d}
                            onClick={() => setDiffFilter(d)}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                              diffFilter === d
                                ? "bg-base-100 text-primary font-black shadow-sm"
                                : "text-base-content/60 hover:text-base-content"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category Pills Bar */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-base-content/60 flex items-center gap-1.5">
                      <FilterIcon className="w-3.5 h-3.5 text-primary" /> Filter Practice Categories
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {CATEGORIES_LIST.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            categoryFilter === cat
                              ? "bg-primary text-primary-content shadow-md scale-[1.02]"
                              : "bg-base-200 hover:bg-base-300 text-base-content/70 border border-base-300"
                          }`}
                        >
                          {cat === "Coding Questions" && <Code2Icon className="w-3.5 h-3.5" />}
                          {cat === "DSA" && <LayersIcon className="w-3.5 h-3.5" />}
                          {cat === "System Design" && <Building2Icon className="w-3.5 h-3.5" />}
                          {cat === "CS Fundamentals" && <BookOpenIcon className="w-3.5 h-3.5" />}
                          {cat === "HR Questions" && <SparklesIcon className="w-3.5 h-3.5" />}
                          {cat === "Behavioral" && <AwardIcon className="w-3.5 h-3.5" />}
                          {cat === "Previous Interview Questions" && <CheckCircle2Icon className="w-3.5 h-3.5 text-warning" />}
                          <span>{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* QUESTION LIBRARY LIST */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-base-content/70">
                      Showing {filteredQuestions.length} Questions ({categoryFilter} • {diffFilter} Difficulty)
                    </span>
                    <span className="text-xs text-base-content/50">
                      Click any question to view interview hints and model solutions
                    </span>
                  </div>

                  {filteredQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {filteredQuestions.map((q) => {
                        const isExpanded = expandedQuestionId === q.id;

                        const diffBadge =
                          q.difficulty === "Hard"
                            ? "badge-error"
                            : q.difficulty === "Medium"
                            ? "badge-warning"
                            : "badge-success";

                        return (
                          <div
                            key={q.id}
                            className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-lg hover:border-primary/40 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                  <Code2Icon className="w-5 h-5" />
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className={`badge badge-xs font-bold ${diffBadge}`}>
                                      {q.difficulty}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-base-200 border border-base-300 text-[11px] font-bold text-base-content/70">
                                      {q.category}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[11px] font-bold text-primary">
                                      {activeCompanyObj.company}
                                    </span>
                                  </div>

                                  <h4 className="font-extrabold text-base text-base-content">
                                    {q.title}
                                  </h4>
                                  <p className="text-xs text-base-content/70 mt-1 line-clamp-2">
                                    {q.text}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() =>
                                    setExpandedQuestionId(isExpanded ? null : q.id)
                                  }
                                  className="btn btn-sm btn-ghost border border-base-300 rounded-xl font-bold text-xs gap-1"
                                >
                                  <LightbulbIcon className="w-4 h-4 text-warning" />
                                  <span>{isExpanded ? "Hide Details" : "View Solution"}</span>
                                </button>

                                <button
                                  onClick={() => handleLaunchMockInterview(activeCompanyObj.company)}
                                  className="btn btn-sm btn-primary rounded-xl font-bold text-xs gap-1"
                                >
                                  <PlayIcon className="w-3.5 h-3.5 fill-current" />
                                  <span>Practice</span>
                                </button>
                              </div>
                            </div>

                            {/* EXPANDABLE SOLUTION & HINT PANEL */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-base-200 space-y-3 bg-base-200/50 p-4 rounded-xl">
                                <div>
                                  <h5 className="font-bold text-xs text-warning flex items-center gap-1.5 mb-1">
                                    <LightbulbIcon className="w-3.5 h-3.5" /> Interviewer Hint & Key Approach
                                  </h5>
                                  <p className="text-xs text-base-content/80 font-medium">
                                    {q.hints}
                                  </p>
                                </div>

                                <div>
                                  <h5 className="font-bold text-xs text-success flex items-center gap-1.5 mb-1">
                                    <CheckCircle2Icon className="w-3.5 h-3.5" /> Model Answer & Optimal Strategy
                                  </h5>
                                  <p className="text-xs text-base-content/80 font-mono bg-base-100 p-3 rounded-lg border border-base-300">
                                    {q.sampleAnswer}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                  <button
                                    onClick={() => handleLaunchMockInterview(activeCompanyObj.company)}
                                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                                  >
                                    <ZapIcon className="w-3.5 h-3.5 fill-current" />
                                    Test Answer in AI Interview
                                  </button>
                                  <button
                                    onClick={() => navigate("/problems")}
                                    className="px-3.5 py-1.5 bg-base-100 hover:bg-base-200 border border-base-300 text-xs font-bold text-base-content rounded-lg"
                                  >
                                    Open Coding Workspace
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-base-100 border border-base-300 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                      <HelpCircleIcon className="w-12 h-12 text-base-content/30 mb-3" />
                      <h4 className="font-bold text-base text-base-content">No Questions Found</h4>
                      <p className="text-xs text-base-content/60 max-w-sm mt-1">
                        No questions matched category "{categoryFilter}" with difficulty "{diffFilter}". Try selecting "All" or searching for a different keyword.
                      </p>
                      <button
                        onClick={() => {
                          setCategoryFilter("All");
                          setDiffFilter("All");
                          setSearchQuery("");
                        }}
                        className="mt-4 px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-xl text-xs font-bold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyPrepPage;
