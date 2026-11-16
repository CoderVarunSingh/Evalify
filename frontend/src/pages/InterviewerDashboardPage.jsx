import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  CalendarIcon,
  UsersIcon,
  VideoIcon,
  PlusCircleIcon,
  UserCheckIcon,
  CheckCircle2Icon,
  ShieldAlertIcon,
  SparklesIcon,
  ClockIcon,
  PlayIcon,
  FileTextIcon,
  SlidersIcon,
  SearchIcon,
  Trash2Icon,
  EyeIcon,
  AlertTriangleIcon,
  BarChart3Icon,
  FilterIcon,
  Building2Icon,
  MailIcon,
  MessageSquareIcon,
  SendIcon,
  Edit2Icon,
} from "lucide-react";
import {
  getStoredInterviews,
  saveInterview,
  deleteInterview,
  getStoredCandidates,
  saveCandidate,
} from "../lib/interviewerStorage";
import CreateInterviewModal from "../components/CreateInterviewModal";
import LiveInterviewMonitor from "../components/LiveInterviewMonitor";
import CandidateReportModal from "../components/CandidateReportModal";
import InterviewNotificationModal from "../components/InterviewNotificationModal";
import EditCandidateModal from "../components/EditCandidateModal";

export default function InterviewerDashboardPage() {
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview | live | candidates | settings
  
  // Modals & Active Selections
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLiveInterview, setSelectedLiveInterview] = useState(null);
  const [selectedReportInterview, setSelectedReportInterview] = useState(null);
  const [selectedNotifyInterview, setSelectedNotifyInterview] = useState(null);
  const [selectedEditCandidate, setSelectedEditCandidate] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadedInterviews = getStoredInterviews();
    const loadedCandidates = getStoredCandidates();
    setInterviews(loadedInterviews);
    setCandidates(loadedCandidates);

    // Auto-select a live interview if available
    const liveItem = loadedInterviews.find((i) => i.status === "live");
    if (liveItem) {
      setSelectedLiveInterview(liveItem);
    }
  }, []);

  const handleScheduleNew = (newInterview) => {
    const updated = saveInterview(newInterview);
    setInterviews(updated);
    // Auto-open notification dispatcher modal for candidate
    setSelectedNotifyInterview(newInterview);
  };

  const handleUpdateInterview = (updatedItem) => {
    const updatedList = saveInterview(updatedItem);
    setInterviews(updatedList);
    if (selectedLiveInterview?.id === updatedItem.id) {
      setSelectedLiveInterview(updatedItem);
    }
    if (selectedNotifyInterview?.id === updatedItem.id) {
      setSelectedNotifyInterview(updatedItem);
    }
  };

  const handleSaveCandidate = (updatedCand) => {
    const updatedList = saveCandidate(updatedCand);
    setCandidates(updatedList);

    // Also update any scheduled interviews matching this candidate
    const currentInterviews = getStoredInterviews();
    let modified = false;
    const updatedInterviews = currentInterviews.map((i) => {
      if (i.candidateId === updatedCand.id || i.candidateEmail === updatedCand.email) {
        modified = true;
        return {
          ...i,
          candidateName: updatedCand.name,
          candidateEmail: updatedCand.email,
          candidatePhone: updatedCand.phone,
        };
      }
      return i;
    });

    if (modified) {
      localStorage.setItem("iq_interviewer_interviews", JSON.stringify(updatedInterviews));
      setInterviews(updatedInterviews);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel and delete this interview?")) {
      const updated = deleteInterview(id);
      setInterviews(updated);
      if (selectedLiveInterview?.id === id) {
        setSelectedLiveInterview(null);
      }
      if (selectedNotifyInterview?.id === id) {
        setSelectedNotifyInterview(null);
      }
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const scheduledCount = interviews.filter((i) => i.status === "scheduled").length;
  const liveCount = interviews.filter((i) => i.status === "live").length;
  const completedCount = interviews.filter((i) => i.status === "completed").length;
  const flaggedCount = interviews.filter((i) => i.liveMonitoring?.candidateStatus === "flagged").length;

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-secondary/20 via-primary/20 to-accent/20 border border-secondary/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-bold mb-2">
              <UserCheckIcon className="size-3.5" /> Professional Interviewer Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">Interviewer Command Center</h1>
            <p className="text-base-content/70 text-xs sm:text-sm max-w-2xl">
              Create custom technical evaluations, schedule candidate dates & times, edit email & phone contact info, dispatch notifications, and monitor live coding rooms.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-secondary font-bold gap-2 shadow-lg hover:scale-105 transition-all"
            >
              <PlusCircleIcon className="size-5" />
              Schedule New Interview
            </button>
          </div>
        </div>

        {/* Portal Tabs Bar */}
        <div className="flex bg-base-100 border border-base-300 p-1.5 rounded-2xl overflow-x-auto gap-1">
          {[
            { id: "overview", label: "Overview & Schedule", icon: <BarChart3Icon className="size-4" />, count: interviews.length },
            { id: "live", label: "Live Room Monitor", icon: <VideoIcon className="size-4" />, count: liveCount, badge: liveCount > 0 ? "badge-error animate-pulse" : "" },
            { id: "candidates", label: "Candidates Directory", icon: <UsersIcon className="size-4" />, count: candidates.length },
            { id: "settings", label: "AI & Security Config", icon: <SlidersIcon className="size-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-secondary text-secondary-content shadow-sm"
                  : "text-base-content/60 hover:bg-base-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`badge badge-xs font-bold ${tab.badge || (activeTab === tab.id ? "badge-outline text-secondary-content" : "badge-ghost")}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB 1: OVERVIEW & SCHEDULED INTERVIEWS ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-base-content/60">Upcoming Scheduled</span>
                  <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl">
                    <CalendarIcon className="size-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-2 font-mono">{scheduledCount}</div>
              </div>

              <div className="bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-base-content/60">Live Rooms Active</span>
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <VideoIcon className="size-5 animate-pulse" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-2 font-mono text-emerald-500">{liveCount}</div>
              </div>

              <div className="bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-base-content/60">Evaluated Candidates</span>
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <CheckCircle2Icon className="size-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-2 font-mono">{completedCount}</div>
              </div>

              <div className="bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-base-content/60">Security Flagged</span>
                  <div className="p-2.5 bg-error/10 text-error rounded-xl">
                    <ShieldAlertIcon className="size-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-2 font-mono text-error">{flaggedCount}</div>
              </div>
            </div>

            {/* Interviews Filter & Table */}
            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-lg flex items-center gap-2">
                    <UserCheckIcon className="size-5 text-secondary" /> Technical Interview Schedule
                  </h3>
                  <p className="text-xs text-base-content/50">Manage candidates, edit email/phone, dispatch notifications, monitor live rooms</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <SearchIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                    <input
                      type="text"
                      placeholder="Search title, candidate..."
                      className="input input-sm input-bordered w-full pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="select select-sm select-bordered font-bold text-xs"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {filteredInterviews.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-base-300 rounded-2xl">
                  <CalendarIcon className="size-12 text-base-content/20 mx-auto mb-3" />
                  <p className="font-bold text-base-content/60">No Interviews Found</p>
                  <p className="text-xs text-base-content/40 mt-1 max-w-sm mx-auto">
                    Click "Schedule New Interview" above to create an evaluation with custom questions, coding problems, and anti-cheat rules.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full text-xs">
                    <thead>
                      <tr className="text-base-content/60 uppercase font-extrabold tracking-wider">
                        <th>Candidate Contact</th>
                        <th>Target Role</th>
                        <th>Date & Time</th>
                        <th>Notifications Sent</th>
                        <th>Proctoring & AI</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInterviews.map((item) => (
                        <tr key={item.id} className="hover:bg-base-200/60 transition-colors">
                          <td>
                            <div className="font-bold text-sm">{item.candidateName}</div>
                            <div className="text-[11px] text-primary">{item.candidateEmail}</div>
                            <div className="text-[10px] text-emerald-600 font-semibold">{item.candidatePhone || "+1 (555) 876-5432"}</div>
                          </td>
                          <td>
                            <span className="badge badge-outline badge-sm font-semibold">{item.role}</span>
                          </td>
                          <td>
                            <div className="font-bold">{item.scheduledDate}</div>
                            <div className="text-[11px] text-secondary font-semibold">{item.scheduledTime} ({item.durationMinutes}m)</div>
                          </td>
                          <td>
                            <div className="flex flex-wrap items-center gap-1">
                              <span className={`badge badge-xs font-bold gap-1 ${item.notifications?.emailSent ? "badge-success" : "badge-ghost"}`}>
                                <MailIcon className="size-3" /> {item.notifications?.emailSent ? "Email Sent" : "Email Pending"}
                              </span>
                              <span className={`badge badge-xs font-bold gap-1 ${item.notifications?.whatsappSent ? "badge-emerald bg-emerald-500/20 text-emerald-600 border-emerald-500/30" : "badge-ghost"}`}>
                                <MessageSquareIcon className="size-3" /> {item.notifications?.whatsappSent ? "WA Sent" : "WA Pending"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              {item.antiCheatConfig?.webcamRequired && <span className="badge badge-success badge-xs">Webcam</span>}
                              {item.antiCheatConfig?.copyPasteDisabled && <span className="badge badge-info badge-xs">No-Copy</span>}
                              {item.aiEvaluationConfig?.enabled && <span className="badge badge-primary badge-xs">AI</span>}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge badge-sm font-bold uppercase tracking-wider ${
                                item.status === "live"
                                  ? "badge-emerald font-black bg-emerald-500/20 text-emerald-600 border-emerald-500/40 animate-pulse"
                                  : item.status === "completed"
                                  ? "badge-success"
                                  : "badge-secondary"
                              }`}
                            >
                              {item.status === "live" ? "🔴 Live Now" : item.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Notify & Edit Button */}
                              <button
                                onClick={() => setSelectedNotifyInterview(item)}
                                className="btn btn-xs btn-outline btn-secondary font-bold gap-1"
                                title="Edit Email/Phone & Dispatch Invites"
                              >
                                <MailIcon className="size-3" />
                                Invite / Edit
                              </button>

                              {item.status === "live" || item.status === "scheduled" ? (
                                <button
                                  onClick={() => {
                                    setSelectedLiveInterview(item);
                                    setActiveTab("live");
                                  }}
                                  className="btn btn-xs btn-secondary font-bold gap-1"
                                >
                                  <PlayIcon className="size-3" />
                                  {item.status === "live" ? "Monitor Live" : "Start Room"}
                                </button>
                              ) : null}

                              {item.status === "completed" && (
                                <button
                                  onClick={() => setSelectedReportInterview(item)}
                                  className="btn btn-xs btn-outline btn-primary gap-1"
                                >
                                  <EyeIcon className="size-3" /> Report
                                </button>
                              )}

                              <button
                                onClick={() => handleDelete(item.id)}
                                className="btn btn-xs btn-ghost text-error hover:bg-error/10"
                                title="Cancel / Delete"
                              >
                                <Trash2Icon className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: LIVE ROOM MONITOR ── */}
        {activeTab === "live" && (
          <div className="space-y-6">
            {!selectedLiveInterview ? (
              <div className="bg-base-100 border border-base-300 rounded-3xl p-12 text-center">
                <VideoIcon className="size-16 text-base-content/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No Live Interview Room Selected</h3>
                <p className="text-xs text-base-content/50 max-w-md mx-auto mt-1 mb-4">
                  Select an active interview from the Overview schedule or start a room to monitor candidate video, live code, anti-cheat violations, and AI scoring.
                </p>
                {interviews.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedLiveInterview(interviews[0]);
                    }}
                    className="btn btn-sm btn-secondary font-bold"
                  >
                    Select {interviews[0].candidateName}'s Room
                  </button>
                )}
              </div>
            ) : (
              <LiveInterviewMonitor
                interview={selectedLiveInterview}
                onUpdateInterview={handleUpdateInterview}
                onClose={() => setActiveTab("overview")}
              />
            )}
          </div>
        )}

        {/* ── TAB 3: CANDIDATES DIRECTORY ── */}
        {activeTab === "candidates" && (
          <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <UsersIcon className="size-5 text-secondary" /> Registered Candidates Directory
                </h3>
                <p className="text-xs text-base-content/50">Manage candidate profiles, edit email & phone contact info, and view scorecards</p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-sm btn-secondary font-bold gap-1"
              >
                <PlusCircleIcon className="size-4" /> Schedule Candidate
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((c) => {
                const candidateInterviews = interviews.filter((i) => i.candidateId === c.id || i.candidateEmail === c.email);
                const completed = candidateInterviews.find((i) => i.status === "completed");

                return (
                  <div key={c.id} className="bg-base-200 border border-base-300 p-5 rounded-2xl space-y-3 shadow-sm flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center font-bold text-lg border border-secondary/30">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{c.name}</div>
                            <div className="text-xs text-primary font-semibold">{c.email}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedEditCandidate(c)}
                          className="btn btn-xs btn-outline btn-secondary font-bold gap-1"
                          title="Edit Candidate Contact Info"
                        >
                          <Edit2Icon className="size-3" /> Edit
                        </button>
                      </div>

                      <div className="text-xs space-y-1.5 pt-2 border-t border-base-300">
                        <div className="flex justify-between">
                          <span className="text-base-content/60">WhatsApp Phone:</span>
                          <span className="font-bold text-emerald-600">{c.phone || "+1 (555) 876-5432"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Target Role:</span>
                          <span className="font-bold text-secondary">{c.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Experience:</span>
                          <span className="font-semibold">{c.experience}</span>
                        </div>
                      </div>
                    </div>

                    {completed ? (
                      <button
                        onClick={() => setSelectedReportInterview(completed)}
                        className="btn btn-xs btn-outline btn-success w-full gap-1 font-bold mt-3"
                      >
                        <CheckCircle2Icon className="size-3.5" /> View Evaluation Scorecard
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn btn-xs btn-outline btn-secondary w-full gap-1 font-bold mt-3"
                      >
                        <CalendarIcon className="size-3.5" /> Schedule New Round
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 4: AI & SECURITY CONFIGURATION ── */}
        {activeTab === "settings" && (
          <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg space-y-6">
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <SlidersIcon className="size-5 text-secondary" /> Portal Default Configuration
              </h3>
              <p className="text-xs text-base-content/50">Global templates for AI grading weights, candidate contact options, and security proctoring rules</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Defaults */}
              <div className="bg-base-200 border border-base-300 p-5 rounded-2xl space-y-4">
                <h4 className="font-bold text-sm flex items-center gap-2 text-primary">
                  <SparklesIcon className="size-4" /> Global AI Evaluation Defaults
                </h4>
                <p className="text-xs text-base-content/70">
                  These weights are applied automatically when scheduling new candidate interviews.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Code Correctness & Unit Tests</span>
                    <span className="text-primary">35%</span>
                  </div>
                  <progress className="progress progress-primary w-full h-2" value="35" max="100" />

                  <div className="flex justify-between font-bold">
                    <span>Problem Solving & Algorithmic Logic</span>
                    <span className="text-secondary">25%</span>
                  </div>
                  <progress className="progress progress-secondary w-full h-2" value="25" max="100" />

                  <div className="flex justify-between font-bold">
                    <span>System Design & Architecture</span>
                    <span className="text-accent">20%</span>
                  </div>
                  <progress className="progress progress-accent w-full h-2" value="20" max="100" />

                  <div className="flex justify-between font-bold">
                    <span>Technical Communication</span>
                    <span className="text-success">20%</span>
                  </div>
                  <progress className="progress progress-success w-full h-2" value="20" max="100" />
                </div>
              </div>

              {/* Proctoring & Messaging Defaults */}
              <div className="bg-base-200 border border-base-300 p-5 rounded-2xl space-y-4">
                <h4 className="font-bold text-sm flex items-center gap-2 text-emerald-600">
                  <MessageSquareIcon className="size-4" /> Email & WhatsApp Dispatch Rules
                </h4>
                <p className="text-xs text-base-content/70">
                  Automated notification settings and candidate contact management.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-base-100 rounded-xl border border-base-300 flex justify-between items-center font-semibold">
                    <span>Inline Edit Candidate Email & Phone</span>
                    <span className="badge badge-success badge-sm">Enabled</span>
                  </div>
                  <div className="p-3 bg-base-100 rounded-xl border border-base-300 flex justify-between items-center font-semibold">
                    <span>WhatsApp Deep Link Integration (wa.me)</span>
                    <span className="badge badge-emerald bg-emerald-500/20 text-emerald-600 border-emerald-500/30 badge-sm">Active</span>
                  </div>
                  <div className="p-3 bg-base-100 rounded-xl border border-base-300 flex justify-between items-center font-semibold">
                    <span>Email Template Formatting</span>
                    <span className="badge badge-primary badge-sm">HTML + Text</span>
                  </div>
                  <div className="p-3 bg-base-100 rounded-xl border border-base-300 flex justify-between items-center font-semibold">
                    <span>Webcam & DevTools Proctoring Rules</span>
                    <span className="badge badge-warning badge-sm">Standard (3 Warnings)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <CreateInterviewModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSchedule={handleScheduleNew}
      />

      <CandidateReportModal
        isOpen={!!selectedReportInterview}
        onClose={() => setSelectedReportInterview(null)}
        interview={selectedReportInterview}
      />

      <InterviewNotificationModal
        isOpen={!!selectedNotifyInterview}
        onClose={() => setSelectedNotifyInterview(null)}
        interview={selectedNotifyInterview}
        onUpdateInterview={handleUpdateInterview}
      />

      <EditCandidateModal
        isOpen={!!selectedEditCandidate}
        onClose={() => setSelectedEditCandidate(null)}
        candidate={selectedEditCandidate}
        onSaveCandidate={handleSaveCandidate}
      />
    </div>
  );
}
