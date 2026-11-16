import React from "react";
import {
  XIcon,
  AwardIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  FileTextIcon,
  PrinterIcon,
  UserCheckIcon,
  StarIcon,
} from "lucide-react";

export default function CandidateReportModal({ isOpen, onClose, interview }) {
  if (!isOpen || !interview) return null;

  const report = interview.report || {
    overallScore: interview.liveMonitoring?.liveScore || 85,
    decision: (interview.liveMonitoring?.liveScore || 85) >= 80 ? "Strong Hire" : "Hire",
    summary: `Candidate ${interview.candidateName} completed technical assessment for ${interview.role}.`,
    correctnessScore: 88,
    problemSolvingScore: 85,
    systemDesignScore: 82,
    communicationScore: 86,
    antiCheatIntegrity: 100 - (interview.liveMonitoring?.violations?.length || 0) * 15,
    violationsCount: interview.liveMonitoring?.violations?.length || 0,
    feedback: "Solid candidate with strong domain knowledge and effective problem-solving skills.",
  };

  const decisionBadgeClass =
    report.decision === "Strong Hire"
      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
      : report.decision === "Hire"
      ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
      : "bg-red-500/15 text-red-600 border-red-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-secondary font-bold text-xs">Evaluation Scorecard</span>
              <span className="text-xs text-base-content/50 font-mono">ID: {interview.id}</span>
            </div>
            <h2 className="text-2xl font-black mt-1">{interview.candidateName} — Final Assessment</h2>
            <p className="text-xs text-base-content/60">{interview.title} · {interview.role}</p>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Decision & Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-base-200 border border-base-300 rounded-2xl p-4 text-center flex flex-col justify-center">
              <div className="text-xs font-bold text-base-content/60 uppercase">Overall Rating</div>
              <div className="text-4xl font-black text-secondary my-1 font-mono">{report.overallScore}<span className="text-sm text-base-content/40">/100</span></div>
              <div className="flex justify-center gap-1 text-warning text-xs">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`size-3.5 fill-current ${i < Math.round(report.overallScore / 20) ? "text-warning" : "text-base-300"}`} />
                ))}
              </div>
            </div>

            <div className="bg-base-200 border border-base-300 rounded-2xl p-4 text-center flex flex-col justify-center">
              <div className="text-xs font-bold text-base-content/60 uppercase">Interviewer Decision</div>
              <div className={`mt-2 py-1.5 px-3 rounded-full border text-sm font-black uppercase tracking-wider ${decisionBadgeClass}`}>
                {report.decision}
              </div>
            </div>

            <div className="bg-base-200 border border-base-300 rounded-2xl p-4 text-center flex flex-col justify-center">
              <div className="text-xs font-bold text-base-content/60 uppercase">Proctoring Integrity</div>
              <div className="text-3xl font-black text-success mt-1 font-mono">{report.antiCheatIntegrity}%</div>
              <div className="text-[11px] text-base-content/50 mt-1">
                {report.violationsCount} Security Event{report.violationsCount !== 1 ? "s" : ""} Logged
              </div>
            </div>
          </div>

          {/* Breakdown Score Bars */}
          <div className="bg-base-200 border border-base-300 p-5 rounded-2xl space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-base-content/60">Competency Breakdown</h3>
            
            {[
              { label: "Code Correctness & Efficiency", score: report.correctnessScore, color: "progress-primary" },
              { label: "Problem Solving & Logic", score: report.problemSolvingScore, color: "progress-secondary" },
              { label: "System Design & Architecture", score: report.systemDesignScore, color: "progress-accent" },
              { label: "Communication & Clarity", score: report.communicationScore, color: "progress-success" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>{item.label}</span>
                  <span className="font-mono">{item.score}%</span>
                </div>
                <progress className={`progress ${item.color} w-full h-2`} value={item.score} max="100" />
              </div>
            ))}
          </div>

          {/* AI Executive Summary & Notes */}
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <FileTextIcon className="size-4" /> AI Feedback Summary
            </h4>
            <p className="text-base-content/80 leading-relaxed">{report.summary}</p>
            <p className="text-base-content/80 leading-relaxed font-medium mt-2">{report.feedback}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 bg-base-200/50 flex justify-between items-center">
          <button type="button" onClick={() => window.print()} className="btn btn-sm btn-ghost gap-1.5">
            <PrinterIcon className="size-4" /> Export PDF Report
          </button>
          <button type="button" onClick={onClose} className="btn btn-sm btn-secondary font-bold px-6">
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}
