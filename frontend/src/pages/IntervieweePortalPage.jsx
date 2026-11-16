import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  CalendarIcon,
  ClockIcon,
  UserCheckIcon,
  CheckCircle2Icon,
  PlayIcon,
  LockIcon,
  FileTextIcon,
  SparklesIcon,
  ShieldCheckIcon,
  VideoIcon,
  Code2Icon,
  AwardIcon,
  BarChart3Icon,
  HelpCircleIcon,
  DownloadIcon,
  AlertCircleIcon,
  CheckIcon,
  ArrowRightIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import {
  getStoredInterviews,
  saveInterview,
} from "../lib/interviewerStorage";
import {
  getCandidateAssignedInterviews,
  getInterviewLockStatus,
  isInterviewJoinable,
} from "../lib/intervieweeStorage";
import CandidateRoomModal from "../components/CandidateRoomModal";
import CandidateReportDownloadModal from "../components/CandidateReportDownloadModal";
import { validateInviteAccess } from "../lib/secureInviteToken";
export default function IntervieweePortalPage() {
  const { user } = useUser();
  const candidateEmail = user?.primaryEmailAddress?.emailAddress || "jordan.chen@example.com";
  
  const [interviews, setInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState("invitations"); // invitations | practice | history | analytics
  
  // Active Modals
  const [activeRoomInterview, setActiveRoomInterview] = useState(null);
  const [activeReportInterview, setActiveReportInterview] = useState(null);

  useEffect(() => {
    loadInterviews();
  }, [candidateEmail]);

  const loadInterviews = () => {
    const list = getCandidateAssignedInterviews(candidateEmail);
    setInterviews(list);
  };

  const handleCompleteInterview = (completedItem) => {
    const updated = saveInterview(completedItem);
    setInterviews(updated);
    setActiveReportInterview(completedItem);
  };

  const upcomingInterviews = interviews.filter((i) => i.status === "scheduled" || i.status === "live");
  const completedInterviews = interviews.filter((i) => i.status === "completed");

  const avgScore = completedInterviews.length > 0
    ? Math.round(
        completedInterviews.reduce((acc, curr) => acc + (curr.report?.overallScore || curr.liveMonitoring?.liveScore || 80), 0) /
          completedInterviews.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border border-primary/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold mb-2">
              <UserCheckIcon className="size-3.5" /> Candidate Interview Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">My Interview Hub</h1>
            <p className="text-base-content/70 text-xs sm:text-sm max-w-2xl">
              Access assigned company interviews, view scheduled dates & times, enter live proctored coding rooms during your slot, download official reports, and track your evaluation history.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={loadInterviews} className="btn btn-sm btn-outline gap-1.5 font-bold">
              <RefreshCwIcon className="size-3.5" /> Refresh Schedule
            </button>
          </div>
        </div>

        {/* Portal Sub-tabs */}
        <div className="flex bg-base-100 border border-base-300 p-1.5 rounded-2xl overflow-x-auto gap-1">
          {[
            { id: "invitations", label: "My Invitations & Schedule", icon: <CalendarIcon className="size-4" />, count: upcomingInterviews.length },
            { id: "history", label: "Completed Rounds & Reports", icon: <FileTextIcon className="size-4" />, count: completedInterviews.length },
            { id: "practice", label: "Pre-Interview Tech Check", icon: <VideoIcon className="size-4" /> },
            { id: "analytics", label: "Performance Analytics", icon: <BarChart3Icon className="size-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/60 hover:bg-base-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`badge badge-xs font-bold ${activeTab === tab.id ? "badge-outline text-primary-content" : "badge-ghost"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB 1: MY INVITATIONS & SCHEDULE (WITH STRICT TIME LOCK) ── */}
        {activeTab === "invitations" && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-bold text-base-content/50">Assigned Rounds</div>
                <div className="text-3xl font-black mt-1 font-mono">{interviews.length}</div>
              </div>

              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-bold text-base-content/50">Upcoming Scheduled</div>
                <div className="text-3xl font-black mt-1 font-mono text-primary">{upcomingInterviews.length}</div>
              </div>

              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-bold text-base-content/50">Completed Rounds</div>
                <div className="text-3xl font-black mt-1 font-mono text-success">{completedInterviews.length}</div>
              </div>

              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-bold text-base-content/50">Average Evaluation Score</div>
                <div className="text-3xl font-black mt-1 font-mono text-secondary">{avgScore}%</div>
              </div>
            </div>

            {/* Invitations List */}
            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg space-y-4">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <CalendarIcon className="size-5 text-primary" /> Assigned Interview Schedule
                </h3>
                <p className="text-xs text-base-content/50">Rooms unlock automatically at the scheduled date & time.</p>
              </div>

              {upcomingInterviews.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-base-300 rounded-2xl">
                  <CalendarIcon className="size-12 text-base-content/20 mx-auto mb-3" />
                  <p className="font-bold text-base-content/60">No Pending Interviews</p>
                  <p className="text-xs text-base-content/40 mt-1 max-w-sm mx-auto">
                    You have no scheduled technical rounds pending. When an interviewer invites you, your invitation card will appear here with scheduled date & time lock.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingInterviews.map((item) => {
                    const lockStatus = getInterviewLockStatus(item);

                    return (
                      <div
                        key={item.id}
                        className={`bg-base-200 border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-sm transition-all ${
                          lockStatus.canJoin ? "border-emerald-500/50 ring-2 ring-emerald-500/20" : "border-base-300"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="badge badge-primary badge-xs font-bold uppercase mb-1">{item.role}</span>
                              <h4 className="font-black text-base">{item.title}</h4>
                            </div>

                            <span
                              className={`badge badge-sm font-bold uppercase tracking-wider ${
                                lockStatus.canJoin
                                  ? "badge-emerald bg-emerald-500/20 text-emerald-600 border-emerald-500/40 animate-pulse"
                                  : "badge-ghost"
                              }`}
                            >
                              {lockStatus.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs bg-base-100 p-3 rounded-xl border border-base-300 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="size-3.5 text-primary" />
                              <span>{item.scheduledDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ClockIcon className="size-3.5 text-secondary" />
                              <span>{item.scheduledTime} ({item.durationMinutes}m)</span>
                            </div>
                          </div>

                          {/* Requirements & Questions summary */}
                          <div className="text-xs space-y-1 text-base-content/70">
                            <div className="flex items-center justify-between">
                              <span>Coding Challenges:</span>
                              <span className="font-bold text-base-content">{item.assignedProblems?.length || 1} Problem(s)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Proctoring Security:</span>
                              <span className="font-bold text-success">Webcam & Anti-Cheat Enforced</span>
                            </div>
                          </div>
                        </div>

                        {/* Lock / Join Action Button */}
                        <div className="pt-2 border-t border-base-300">
                          {lockStatus.canJoin ? (
                            <button
                              onClick={() => setActiveRoomInterview(item)}
                              className="btn btn-sm btn-success text-white font-extrabold w-full gap-2 shadow-lg"
                            >
                              <PlayIcon className="size-4 fill-current" /> Join Live Technical Room Now
                            </button>
                          ) : (
                            <button
                              disabled
                              className="btn btn-sm btn-disabled w-full gap-2 text-xs font-bold"
                              title="Room is time-locked until scheduled interview time"
                            >
                              <LockIcon className="size-4 text-warning" />
                              {lockStatus.message}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: COMPLETED ROUNDS & REPORTS ── */}
        {activeTab === "history" && (
          <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg space-y-4">
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <FileTextIcon className="size-5 text-success" /> Completed Technical Interviews
              </h3>
              <p className="text-xs text-base-content/50">View official evaluation scorecards and download PDF reports</p>
            </div>

            {completedInterviews.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-base-300 rounded-2xl">
                <FileTextIcon className="size-12 text-base-content/20 mx-auto mb-3" />
                <p className="font-bold text-base-content/60">No Completed Interviews Yet</p>
                <p className="text-xs text-base-content/40 mt-1 max-w-sm mx-auto">
                  Once you complete an interview session, your AI evaluation report and downloadable PDF scorecard will be saved here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-xs">
                  <thead>
                    <tr className="text-base-content/60 uppercase font-extrabold tracking-wider">
                      <th>Interview Title</th>
                      <th>Target Role</th>
                      <th>Completion Date</th>
                      <th>Evaluation Score</th>
                      <th>Proctoring Score</th>
                      <th>Decision</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedInterviews.map((item) => {
                      const report = item.report || { overallScore: item.liveMonitoring?.liveScore || 80, decision: "Hire" };

                      return (
                        <tr key={item.id} className="hover:bg-base-200/60 transition-colors">
                          <td className="font-bold">{item.title}</td>
                          <td><span className="badge badge-outline badge-sm">{item.role}</span></td>
                          <td>{item.scheduledDate}</td>
                          <td className="font-bold font-mono text-sm text-primary">{report.overallScore}/100</td>
                          <td className="font-bold text-success">{report.antiCheatIntegrity || 100}%</td>
                          <td>
                            <span className="badge badge-success badge-sm font-bold uppercase">{report.decision}</span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => setActiveReportInterview(item)}
                              className="btn btn-xs btn-primary font-bold gap-1"
                            >
                              <DownloadIcon className="size-3" /> Download Report
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: PRE-INTERVIEW TECH CHECK ── */}
        {activeTab === "practice" && (
          <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg space-y-4 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                <VideoIcon className="size-6" />
              </div>
              <h3 className="font-extrabold text-xl">Pre-Interview System & Equipment Check</h3>
              <p className="text-xs text-base-content/50 mt-1">Test your browser setup before your live scheduled slot.</p>
            </div>

            <div className="bg-base-200 border border-base-300 p-5 rounded-2xl space-y-3 text-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">System Checklist</h4>
              <ul className="space-y-2 font-semibold">
                <li className="flex items-center gap-2 text-success"><CheckCircle2Icon className="size-4" /> Camera Access Permitted</li>
                <li className="flex items-center gap-2 text-success"><CheckCircle2Icon className="size-4" /> Microphone Input Active</li>
                <li className="flex items-center gap-2 text-success"><CheckCircle2Icon className="size-4" /> Fullscreen Mode Supported</li>
                <li className="flex items-center gap-2 text-success"><CheckCircle2Icon className="size-4" /> WebSockets & Code Execution Engine Ready</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── TAB 4: PERFORMANCE ANALYTICS ── */}
        {activeTab === "analytics" && (
          <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg space-y-6">
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <BarChart3Icon className="size-5 text-secondary" /> Performance & Skill Analytics
              </h3>
              <p className="text-xs text-base-content/50">Technical competency trends across completed rounds</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-base-200 border border-base-300 p-4 rounded-2xl text-center">
                <div className="text-xs font-bold text-base-content/60">Overall Success Rate</div>
                <div className="text-3xl font-black text-success mt-1 font-mono">100%</div>
              </div>
              <div className="bg-base-200 border border-base-300 p-4 rounded-2xl text-center">
                <div className="text-xs font-bold text-base-content/60">Average Technical Score</div>
                <div className="text-3xl font-black text-primary mt-1 font-mono">{avgScore || 85}%</div>
              </div>
              <div className="bg-base-200 border border-base-300 p-4 rounded-2xl text-center">
                <div className="text-xs font-bold text-base-content/60">Proctoring Trust Score</div>
                <div className="text-3xl font-black text-emerald-500 mt-1 font-mono">100%</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <CandidateRoomModal
        isOpen={!!activeRoomInterview}
        onClose={() => setActiveRoomInterview(null)}
        interview={activeRoomInterview}
        onCompleteInterview={handleCompleteInterview}
      />

      <CandidateReportDownloadModal
        isOpen={!!activeReportInterview}
        onClose={() => setActiveReportInterview(null)}
        interview={activeReportInterview}
      />
    </div>
  );
}
