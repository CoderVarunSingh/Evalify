import React, { useState, useEffect } from "react";
import {
  VideoIcon,
  MicIcon,
  ShieldAlertIcon,
  SparklesIcon,
  SendIcon,
  Code2Icon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertTriangleIcon,
  ActivityIcon,
  PlayIcon,
  MessageSquareIcon,
  RadioIcon,
  UserIcon,
} from "lucide-react";

export default function LiveInterviewMonitor({ interview, onUpdateInterview, onClose }) {
  const [activeTab, setActiveTab] = useState("code"); // code | violations | ai
  const [interviewerNote, setInterviewerNote] = useState("");
  const [messages, setMessages] = useState([
    { sender: "Interviewer", text: "Welcome to the technical round! Please begin by explaining your initial approach.", time: "16:30" },
    { sender: "Candidate", text: "Thanks! I'm planning to use a Hash Map to achieve O(N) time complexity.", time: "16:31" },
  ]);

  const [liveCode, setLiveCode] = useState(
    interview?.liveMonitoring?.codeSnapshot ||
      "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}"
  );

  const [violations, setViolations] = useState(interview?.liveMonitoring?.violations || []);
  const [candidateStatus, setCandidateStatus] = useState(interview?.liveMonitoring?.candidateStatus || "active");
  const [liveScore, setLiveScore] = useState(interview?.liveMonitoring?.liveScore || 82);

  // Simulate real-time live feed updates if interview is active/live
  useEffect(() => {
    if (interview?.status !== "live") return;

    const interval = setInterval(() => {
      // Small random score fluctuation or simulated typing
      setLiveScore((prev) => Math.min(98, Math.max(60, prev + (Math.random() > 0.6 ? 1 : -1))));
    }, 6000);

    return () => clearInterval(interval);
  }, [interview]);

  const handleSendMessage = () => {
    if (!interviewerNote.trim()) return;
    const newMsg = {
      sender: "Interviewer",
      text: interviewerNote.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMsg]);
    setInterviewerNote("");
  };

  const handleFlagCandidate = () => {
    const newViolation = {
      id: "v-" + Date.now(),
      type: "Manual Flag",
      message: "Interviewer manually flagged candidate for suspicious behavior.",
      timestamp: new Date().toLocaleTimeString(),
      severity: "High",
    };
    const updatedViolations = [...violations, newViolation];
    setViolations(updatedViolations);
    setCandidateStatus("flagged");
    
    if (onUpdateInterview) {
      onUpdateInterview({
        ...interview,
        liveMonitoring: {
          ...interview.liveMonitoring,
          candidateStatus: "flagged",
          violations: updatedViolations,
        },
      });
    }
  };

  const handleCompleteInterview = () => {
    const finalReport = {
      overallScore: liveScore,
      decision: liveScore >= 80 ? "Strong Hire" : liveScore >= 70 ? "Hire" : "Reject",
      summary: `Candidate ${interview.candidateName} completed the live technical evaluation with a score of ${liveScore}/100.`,
      correctnessScore: Math.min(100, liveScore + 5),
      problemSolvingScore: liveScore,
      systemDesignScore: Math.max(60, liveScore - 5),
      communicationScore: 85,
      antiCheatIntegrity: Math.max(0, 100 - violations.length * 15),
      violationsCount: violations.length,
      feedback: "Demonstrated solid coding skill and problem solving methodology under proctored evaluation.",
    };

    if (onUpdateInterview) {
      onUpdateInterview({
        ...interview,
        status: "completed",
        report: finalReport,
        liveMonitoring: {
          ...interview.liveMonitoring,
          candidateStatus: "completed",
        },
      });
    }
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-black text-xl border border-secondary/30">
              {interview.candidateName?.charAt(0) || "C"}
            </div>
            <span className="absolute -bottom-1 -right-1 flex size-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-4 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">{interview.candidateName}</h2>
              <span
                className={`badge badge-sm font-bold uppercase tracking-wider ${
                  candidateStatus === "flagged"
                    ? "badge-error"
                    : candidateStatus === "active"
                    ? "badge-success"
                    : "badge-ghost"
                }`}
              >
                {candidateStatus === "active" ? "LIVE • Proctored" : candidateStatus === "flagged" ? "⚠️ FLAGGED" : "Completed"}
              </span>
            </div>
            <p className="text-xs text-base-content/60">
              {interview.title} · {interview.role} · Room ID: <code className="font-mono">{interview.id}</code>
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button onClick={handleFlagCandidate} className="btn btn-sm btn-outline btn-error gap-1.5 font-bold">
            <AlertTriangleIcon className="size-4" /> Flag Candidate
          </button>
          <button onClick={handleCompleteInterview} className="btn btn-sm btn-success gap-1.5 font-bold">
            <CheckCircle2Icon className="size-4" /> Conclude & Grade
          </button>
        </div>
      </div>

      {/* Main Grid: Stream & Real-time Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Feed & Live Candidate Code (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Simulated Live Video Container */}
          <div className="bg-black border border-base-300 rounded-3xl overflow-hidden relative shadow-xl aspect-video flex flex-col justify-between p-4 text-white">
            <div className="flex justify-between items-center z-10">
              <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-mono font-bold flex items-center gap-2">
                <RadioIcon className="size-3.5 text-red-500 animate-pulse" />
                <span>REC • Candidate Camera (Proctored)</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-mono">
                FPS: 30 · Audio: Active
              </div>
            </div>

            {/* Video Placeholder avatar overlay */}
            <div className="flex flex-col items-center justify-center my-auto">
              <div className="size-24 rounded-full bg-gradient-to-tr from-secondary to-accent flex items-center justify-center text-4xl font-black shadow-2xl">
                {interview.candidateName?.charAt(0)}
              </div>
              <p className="text-sm font-bold mt-3 text-white/90">{interview.candidateName} (Live Video Feed)</p>
              <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                <VideoIcon className="size-3.5 text-emerald-400" /> Camera OK
                <MicIcon className="size-3.5 text-emerald-400" /> Mic Stream Active
              </div>
            </div>

            <div className="flex justify-between items-center z-10 text-xs text-white/70 font-mono">
              <span>Face Status: {candidateStatus === "flagged" ? "⚠️ Anomaly Detected" : "Normal"}</span>
              <span>Webcam HD 1080p</span>
            </div>
          </div>

          {/* Real-time Code Editor View */}
          <div className="bg-base-100 border border-base-300 rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <div className="flex items-center gap-2">
                <Code2Icon className="size-5 text-primary" />
                <h3 className="font-bold text-sm">Live Candidate Code Stream</h3>
              </div>
              <span className="badge badge-primary badge-xs font-bold font-mono">JavaScript</span>
            </div>

            <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 min-h-[180px]">
              <pre>{liveCode}</pre>
            </div>
          </div>
        </div>

        {/* Right Column: Live Proctoring Ticker & Live AI Evaluator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sub-tabs header */}
          <div className="flex bg-base-100 border border-base-300 p-1 rounded-2xl">
            {[
              { id: "code", label: "AI Real-time Score", icon: <SparklesIcon className="size-3.5" /> },
              { id: "violations", label: `Anti-Cheat (${violations.length})`, icon: <ShieldAlertIcon className="size-3.5" /> },
              { id: "chat", label: "Live Chat", icon: <MessageSquareIcon className="size-3.5" /> },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === t.id ? "bg-secondary text-secondary-content shadow-sm" : "text-base-content/60 hover:text-base-content"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: AI Real-Time Scorecard */}
          {activeTab === "code" && (
            <div className="bg-base-100 border border-base-300 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Real-time Evaluation Score</h4>
                  <p className="text-xs text-base-content/60">Live AI code quality & speed telemetry</p>
                </div>
                <div className="text-3xl font-black text-secondary font-mono">{liveScore}/100</div>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { label: "Algorithm Time Complexity", value: "O(N) Optimal", color: "text-success" },
                  { label: "Space Complexity", value: "O(N) Hash Map", color: "text-success" },
                  { label: "Code Readability & Style", value: "92 / 100", color: "text-primary" },
                  { label: "Edge Case Coverage", value: "Passed 4 / 5 cases", color: "text-warning" },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-base-200 border border-base-300 rounded-xl flex justify-between items-center">
                    <span className="font-semibold">{item.label}</span>
                    <span className={`font-bold font-mono ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-secondary/10 border border-secondary/30 p-3 rounded-xl text-xs space-y-1">
                <div className="font-bold text-secondary flex items-center gap-1">
                  <SparklesIcon className="size-3.5" /> AI Interviewer Suggestion
                </div>
                <p className="text-base-content/80">
                  Candidate has implemented the optimal two-pointer/hash map approach. Ask them: <em>"What happens if memory is strictly limited to O(1) space?"</em>
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Anti-Cheat Violation Stream */}
          {activeTab === "violations" && (
            <div className="bg-base-100 border border-base-300 rounded-3xl p-5 shadow-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <ShieldAlertIcon className="size-4 text-warning" /> Proctoring Log Stream
                </h4>
                <span className="badge badge-warning badge-xs font-bold">{violations.length} Events</span>
              </div>

              {violations.length === 0 ? (
                <div className="p-8 text-center bg-success/5 border border-success/20 rounded-2xl">
                  <CheckCircle2Icon className="size-8 text-success mx-auto mb-2" />
                  <p className="font-bold text-xs text-success">No Security Violations Logged</p>
                  <p className="text-[11px] text-base-content/50 mt-1">Candidate is following all proctoring guidelines cleanly.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {violations.map((v) => (
                    <div key={v.id} className="p-3 bg-error/10 border border-error/30 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-error">
                        <span>{v.type}</span>
                        <span className="font-mono text-[10px]">{v.timestamp}</span>
                      </div>
                      <p className="text-base-content/80 text-[11px]">{v.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Live Interviewer Chat & Instructions */}
          {activeTab === "chat" && (
            <div className="bg-base-100 border border-base-300 rounded-3xl p-5 shadow-lg space-y-3 flex flex-col h-[320px]">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <MessageSquareIcon className="size-4 text-secondary" /> Candidate Communication
              </h4>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                      m.sender === "Interviewer"
                        ? "bg-secondary text-secondary-content ml-auto"
                        : "bg-base-200 border border-base-300"
                    }`}
                  >
                    <div className="font-bold text-[10px] opacity-75">{m.sender} · {m.time}</div>
                    <div>{m.text}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Send prompt or message..."
                  className="input input-sm input-bordered flex-1"
                  value={interviewerNote}
                  onChange={(e) => setInterviewerNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className="btn btn-sm btn-secondary">
                  <SendIcon className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
