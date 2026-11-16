import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  ShieldCheckIcon,
  UsersIcon,
  BarChart3Icon,
  BookOpenIcon,
  PlusIcon,
  TrashIcon,
  BellIcon,
  TrendingUpIcon,
  SparklesIcon,
  SaveIcon,
} from "lucide-react";
import { AI_INTERVIEW_QUESTIONS } from "../data/aiQuestions";

const ADMIN_PASSWORD = "admin123";

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState({ totalUsers: 0, totalInterviews: 0, avgScore: 0 });
  const [announcement, setAnnouncement] = useState(localStorage.getItem("platform_announcement") || "");
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: "", text: "", category: "General", difficulty: "Medium", role: "Frontend" });
  const [addingQuestion, setAddingQuestion] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const history = JSON.parse(localStorage.getItem("ai_interview_history") || "[]");
    const totalInterviews = history.length;
    const avgScore = totalInterviews ? Math.round(history.reduce((acc, r) => acc + r.overallScore, 0) / totalInterviews) : 0;

    const allQs = Object.entries(AI_INTERVIEW_QUESTIONS).flatMap(([role, qs]) =>
      qs.map((q) => ({ ...q, role }))
    );
    const customQs = JSON.parse(localStorage.getItem("admin_custom_questions") || "[]");
    setQuestions([...allQs, ...customQs]);
    setStats({ totalUsers: Math.max(1, totalInterviews), totalInterviews, avgScore });
    setAnnouncementDraft(localStorage.getItem("platform_announcement") || "");
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password. (Hint: admin123)");
    }
  };

  const handleSaveAnnouncement = () => {
    localStorage.setItem("platform_announcement", announcementDraft);
    setAnnouncement(announcementDraft);
    alert("Announcement saved! Users will see this on their dashboard.");
  };

  const handleAddQuestion = () => {
    if (!newQuestion.title || !newQuestion.text) return;
    const q = { ...newQuestion, id: "custom-" + Date.now() };
    const existing = JSON.parse(localStorage.getItem("admin_custom_questions") || "[]");
    existing.push(q);
    localStorage.setItem("admin_custom_questions", JSON.stringify(existing));
    setQuestions((prev) => [...prev, q]);
    setNewQuestion({ title: "", text: "", category: "General", difficulty: "Medium", role: "Frontend" });
    setAddingQuestion(false);
  };

  const handleDeleteQuestion = (id) => {
    const existing = JSON.parse(localStorage.getItem("admin_custom_questions") || "[]");
    const updated = existing.filter((q) => q.id !== id);
    localStorage.setItem("admin_custom_questions", JSON.stringify(updated));
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content font-sans">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="bg-base-100 border border-base-300 rounded-2xl p-8 shadow-2xl w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-xl font-bold text-base-content mb-1">Admin Portal</h1>
            <p className="text-base-content/70 text-sm mb-6">Restricted access — enter your admin credentials.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Admin Password"
              className="input w-full bg-base-200 border-base-300 text-base-content mb-3 focus:outline-none focus:border-accent"
            />
            {authError && <p className="text-error text-xs mb-3">{authError}</p>}
            <button onClick={handleLogin} className="btn btn-accent w-full">
              Login to Admin Panel
            </button>
            <p className="text-xs text-base-content/50 mt-3">Demo password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3Icon className="w-4 h-4" /> },
    { id: "questions", label: "Question Bank", icon: <BookOpenIcon className="w-4 h-4" /> },
    { id: "announcements", label: "Announcements", icon: <BellIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold mb-2">
              <ShieldCheckIcon className="w-3.5 h-3.5" /> Admin Portal
            </div>
            <h1 className="text-3xl font-black text-base-content">Platform Admin Dashboard</h1>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="btn btn-ghost btn-sm text-base-content/70">
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-base-100 p-1.5 rounded-xl border border-base-300 w-fit shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? "bg-accent text-accent-content shadow-lg" : "text-base-content/70 hover:text-base-content"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Sessions", value: stats.totalInterviews, icon: <BarChart3Icon className="w-6 h-6" />, color: "text-primary" },
                { label: "Platform Users", value: stats.totalUsers, icon: <UsersIcon className="w-6 h-6" />, color: "text-success" },
                { label: "Average Score", value: `${stats.avgScore}/100`, icon: <TrendingUpIcon className="w-6 h-6" />, color: "text-warning" },
              ].map((stat, i) => (
                <div key={i} className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-lg">
                  <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                  <div className="text-3xl font-black text-base-content">{stat.value}</div>
                  <div className="text-xs text-base-content/70 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-xl">
              <h2 className="font-bold text-base-content mb-3 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-accent" /> Platform Overview
              </h2>
              <div className="text-base-content/80 text-sm space-y-2">
                <p>✅ AI Mock Interview Engine — <span className="text-success font-semibold">Active</span></p>
                <p>✅ Speech-to-Text Voice Mode — <span className="text-success font-semibold">Active</span></p>
                <p>✅ Resume Analyzer — <span className="text-success font-semibold">Active</span></p>
                <p>✅ Analytics Dashboard — <span className="text-success font-semibold">Active</span></p>
                <p>✅ Company Prep Sets — <span className="text-success font-semibold">Active</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Question Bank Tab */}
        {activeTab === "questions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-base-content">Question Bank ({questions.length} Questions)</h2>
              <button onClick={() => setAddingQuestion(true)} className="btn btn-accent btn-sm gap-2">
                <PlusIcon className="w-4 h-4" /> Add Question
              </button>
            </div>

            {addingQuestion && (
              <div className="bg-base-100 border border-accent/40 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-bold text-base-content">Add New Question</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="input bg-base-200 border-base-300 text-base-content focus:outline-none"
                    placeholder="Question Title"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, title: e.target.value }))}
                  />
                  <input
                    className="input bg-base-200 border-base-300 text-base-content focus:outline-none"
                    placeholder="Category"
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, category: e.target.value }))}
                  />
                </div>
                <textarea
                  className="textarea w-full bg-base-200 border-base-300 text-base-content focus:outline-none"
                  placeholder="Full question text..."
                  rows={3}
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion((p) => ({ ...p, text: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="select bg-base-200 border-base-300 text-base-content focus:outline-none"
                    value={newQuestion.role}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, role: e.target.value }))}
                  >
                    {["Frontend", "Backend", "AI/ML", "System Design", "HR"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <select
                    className="select bg-base-200 border-base-300 text-base-content focus:outline-none"
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, difficulty: e.target.value }))}
                  >
                    {["Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddQuestion} className="btn btn-accent btn-sm gap-2">
                    <SaveIcon className="w-4 h-4" /> Save Question
                  </button>
                  <button onClick={() => setAddingQuestion(false)} className="btn btn-ghost btn-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {questions.map((q, i) => (
                <div key={q.id || i} className="flex items-center justify-between bg-base-100 border border-base-300 rounded-xl px-5 py-3.5 shadow-sm">
                  <div>
                    <div className="font-semibold text-base-content text-sm">{q.title}</div>
                    <div className="text-xs text-base-content/70">{q.role} • {q.category} • {q.difficulty}</div>
                  </div>
                  {q.id?.startsWith("custom-") && (
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-error hover:opacity-80 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-bold text-base-content">Platform Announcements</h2>
            <p className="text-base-content/70 text-sm">The message below will be displayed on the main dashboard for all users.</p>

            {announcement && (
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-sm text-accent">
                <span className="font-bold text-accent">Current Announcement: </span>
                {announcement}
              </div>
            )}

            <textarea
              className="textarea w-full bg-base-100 border-base-300 text-base-content focus:outline-none h-32"
              placeholder="Write a platform-wide announcement..."
              value={announcementDraft}
              onChange={(e) => setAnnouncementDraft(e.target.value)}
            />

            <button onClick={handleSaveAnnouncement} className="btn btn-accent gap-2">
              <BellIcon className="w-4 h-4" /> Publish Announcement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
