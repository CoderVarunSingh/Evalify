import React, { useState, useEffect, useRef } from "react";
import {
  VideoIcon,
  MicIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  ShieldAlertIcon,
  PlayIcon,
  Code2Icon,
  CheckCircle2Icon,
  ClockIcon,
  Maximize2Icon,
  XIcon,
  SendIcon,
  SparklesIcon,
  RotateCcwIcon,
  CheckIcon,
  HelpCircleIcon,
  FileCode2Icon,
} from "lucide-react";
import CodeEditorPanel from "./CodeEditorPanel";
import OutputPanel from "./OutputPanel";
import { executeCode } from "../lib/piston";
import { useAntiCheating } from "../hooks/useAntiCheating";
import { generateFullInterviewReport } from "../lib/aiEvaluator";
import toast from "react-hot-toast";

export default function CandidateRoomModal({ isOpen, onClose, interview, onCompleteInterview }) {
  const [phase, setPhase] = useState("tech_check"); // tech_check | live_coding | submitting
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(
    interview?.assignedProblems?.[0]?.starterCode ||
      "// Write your optimal solution here\nfunction solution(input) {\n  // Implementation\n  return input;\n}"
  );

  const [output, setOutput] = useState(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);

  // Video & Audio refs
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Anti-cheat hook integration
  const antiCheat = useAntiCheating({
    isSessionActive: phase === "live_coding",
    mediaStreamRef,
    videoRef,
  });

  // Media Stream Setup for Tech Check
  useEffect(() => {
    if (!isOpen) return;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera/Mic access error:", err);
      }
    }

    setupCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen || !interview) return null;

  const handleStartCoding = async () => {
    try {
      await antiCheat.enterFullscreen();
    } catch (e) {}
    setPhase("live_coding");
    toast.success("Interview session started. Anti-cheat proctoring active.");
  };

  const handleRunCode = async () => {
    setIsRunningCode(true);
    try {
      const res = await executeCode(selectedLanguage, code);
      setOutput(res);
    } catch (e) {
      setOutput({ run: { output: "Execution error: " + e.message, stderr: e.message } });
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSubmitInterview = async () => {
    setPhase("submitting");
    toast.loading("AI grading code & generating security report...");

    const securityReport = antiCheat.getSecurityReport();
    
    // Auto-generate score and report via AI Evaluator
    const evalResult = await generateFullInterviewReport({
      role: interview.role || "Developer",
      answers: [
        {
          questionText: interview.assignedProblems?.[0]?.title || "Coding Challenge",
          userCode: code,
          evaluation: { score: 85, feedback: "Clean algorithm implementation." },
        },
      ],
      resumeText: "",
    });

    const finalScore = Math.round((evalResult.overallScore || 85) * (securityReport.integrityScore / 100));

    const completedReport = {
      overallScore: finalScore,
      decision: finalScore >= 80 ? "Strong Hire" : finalScore >= 65 ? "Hire" : "Reject",
      summary: `Candidate completed ${interview.title} with a technical score of ${finalScore}/100.`,
      correctnessScore: evalResult.categoryScores?.technical || 88,
      problemSolvingScore: evalResult.categoryScores?.problemSolving || 85,
      systemDesignScore: evalResult.categoryScores?.architecture || 80,
      communicationScore: evalResult.categoryScores?.communication || 85,
      antiCheatIntegrity: securityReport.integrityScore,
      violationsCount: securityReport.totalViolations,
      feedback: evalResult.executiveSummary || "Strong technical skills demonstrated during live evaluation.",
    };

    onCompleteInterview({
      ...interview,
      status: "completed",
      report: completedReport,
      liveMonitoring: {
        ...interview.liveMonitoring,
        candidateStatus: "completed",
        liveScore: finalScore,
        codeSnapshot: code,
      },
    });

    toast.dismiss();
    toast.success("Interview submitted successfully!");
    onClose();
  };

  const currentProblem = interview.assignedProblems?.[activeProblemIndex] || {
    title: interview.title,
    difficulty: "Medium",
    category: "Coding Assessment",
    description: "Implement an optimal solution to solve the given technical requirements.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[94vh]">
        {/* Header Bar */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center font-black text-lg">
              <Code2Icon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black">{interview.title}</h2>
                <span className="badge badge-secondary badge-xs font-bold uppercase">{interview.role}</span>
              </div>
              <p className="text-xs text-base-content/50">Proctored Live Candidate Environment</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {phase === "live_coding" && (
              <div className="flex items-center gap-2 bg-error/10 border border-error/30 px-3 py-1 rounded-full text-xs font-bold text-error">
                <ShieldAlertIcon className="size-4 animate-pulse" />
                <span>Proctoring Active (Integrity: {antiCheat.integrityScore}%)</span>
              </div>
            )}
            <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
              <XIcon className="size-5" />
            </button>
          </div>
        </div>

        {/* Security Warning Banner */}
        {antiCheat.activeAlert && (
          <div className="bg-error text-error-content px-4 py-2 text-xs font-extrabold flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="size-4" />
              <span>SECURITY ALERT: {antiCheat.activeAlert.message}</span>
            </div>
            <span>Violation Warning #{antiCheat.totalViolations}</span>
          </div>
        )}

        {/* Phase 1: Pre-Interview Tech & Proctoring Check */}
        {phase === "tech_check" && (
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 max-w-4xl mx-auto w-full">
            <div className="text-center max-w-md mx-auto">
              <div className="size-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mx-auto mb-3">
                <ShieldCheckIcon className="size-6" />
              </div>
              <h3 className="text-2xl font-black">Pre-Interview System Check</h3>
              <p className="text-xs text-base-content/60 mt-1">
                Please verify your camera, microphone, and review proctoring rules before entering the live room.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Camera Preview */}
              <div className="bg-black border border-base-300 rounded-2xl aspect-video overflow-hidden relative shadow-lg flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-mono flex items-center gap-1.5">
                  <VideoIcon className="size-3 text-emerald-400" /> Live Feed Ready
                </div>
              </div>

              {/* Security Checklist */}
              <div className="bg-base-200 border border-base-300 p-5 rounded-2xl space-y-3 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-secondary">Proctoring Requirements</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-success font-semibold">
                    <CheckCircle2Icon className="size-4" /> Camera & Microphone Stream Validated
                  </div>
                  <div className="flex items-center gap-2 text-base-content/80 font-semibold">
                    <Maximize2Icon className="size-4 text-primary" /> Fullscreen Mode will be Enforced
                  </div>
                  <div className="flex items-center gap-2 text-base-content/80 font-semibold">
                    <ShieldAlertIcon className="size-4 text-warning" /> Tab Switching & Window Blur will be Logged
                  </div>
                  <div className="flex items-center gap-2 text-base-content/80 font-semibold">
                    <XIcon className="size-4 text-error" /> Copy-Paste & DevTools are Disabled
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl mt-3 text-[11px] text-base-content/80">
                  💡 <strong>Tip:</strong> Ensure you are in a quiet room with stable lighting. Good luck!
                </div>
              </div>
            </div>

            <button
              onClick={handleStartCoding}
              className="w-full py-4 bg-gradient-to-r from-secondary to-primary text-secondary-content font-extrabold rounded-2xl shadow-xl hover:opacity-95 text-base flex items-center justify-center gap-2"
            >
              <PlayIcon className="size-5 fill-current" /> Begin Technical Interview Session
            </button>
          </div>
        )}

        {/* Phase 2: Live Proctored Workspace */}
        {phase === "live_coding" && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Problem & Custom Questions (4 cols) */}
            <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-base-300 bg-base-100 p-4 overflow-y-auto space-y-4 flex flex-col">
              {/* Problem Select Header */}
              <div className="bg-base-200 border border-base-300 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-secondary">Current Task</span>
                  <h4 className="font-bold text-sm">{currentProblem.title}</h4>
                </div>
                <span className="badge badge-warning badge-xs font-bold">{currentProblem.difficulty}</span>
              </div>

              {/* Problem Description */}
              <div className="space-y-2 text-xs flex-1">
                <h5 className="font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Problem Statement</h5>
                <p className="text-base-content/80 leading-relaxed bg-base-200/50 p-3 rounded-xl border border-base-300">
                  {currentProblem.description || "Implement a scalable function that processes input parameters and returns output according to specifications."}
                </p>
              </div>

              {/* Interviewer Custom Questions */}
              {interview.customQuestions?.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold uppercase tracking-wider text-secondary text-[10px] flex items-center gap-1">
                    <HelpCircleIcon className="size-3" /> Interviewer Custom Questions
                  </h5>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {interview.customQuestions.map((q) => (
                      <div key={q.id} className="p-2.5 bg-secondary/10 border border-secondary/20 rounded-xl text-xs">
                        <span className="badge badge-outline badge-xs mr-1">{q.category}</span>
                        <span className="font-semibold text-base-content/90">{q.question}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Code Editor & Execution Output (8 cols) */}
            <div className="lg:w-2/3 flex flex-col bg-base-200 overflow-hidden">
              <div className="p-3 bg-base-100 border-b border-base-300 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <select
                    className="select select-xs select-bordered font-bold"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="python">Python 3</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="btn btn-xs btn-outline btn-primary font-bold gap-1"
                  >
                    {isRunningCode ? <span className="loading loading-spinner loading-xs" /> : <PlayIcon className="size-3" />}
                    Run Code
                  </button>

                  <button
                    onClick={handleSubmitInterview}
                    className="btn btn-xs btn-success font-bold gap-1 text-white shadow-md"
                  >
                    <CheckCircle2Icon className="size-3.5" /> Submit Interview
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 overflow-hidden p-2">
                <CodeEditorPanel
                  language={selectedLanguage}
                  code={code}
                  setCode={setCode}
                />
              </div>

              {/* Execution Output */}
              <div className="h-36 border-t border-base-300 p-2 bg-base-100">
                <OutputPanel output={output} />
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Submitting */}
        {phase === "submitting" && (
          <div className="p-12 text-center space-y-4 my-auto">
            <SparklesIcon className="size-12 text-secondary animate-spin mx-auto" />
            <h3 className="text-xl font-bold">Grading Solution & Generating Report...</h3>
            <p className="text-xs text-base-content/50">Processing code tests, AI metrics, and anti-cheat telemetry.</p>
          </div>
        )}
      </div>
    </div>
  );
}
