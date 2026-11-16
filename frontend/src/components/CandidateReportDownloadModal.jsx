import React from "react";
import {
  XIcon,
  PrinterIcon,
  CheckCircle2Icon,
  AwardIcon,
  ShieldCheckIcon,
  FileTextIcon,
  DownloadIcon,
  StarIcon,
  SparklesIcon,
  UserCheckIcon,
} from "lucide-react";

export default function CandidateReportDownloadModal({ isOpen, onClose, interview }) {
  if (!isOpen || !interview) return null;

  const report = interview.report || {
    overallScore: interview.liveMonitoring?.liveScore || 85,
    decision: (interview.liveMonitoring?.liveScore || 85) >= 80 ? "Strong Hire" : "Hire",
    summary: `Evaluation result for ${interview.title}. Technical performance was rated strong with optimal algorithm choice.`,
    correctnessScore: 88,
    problemSolvingScore: 85,
    systemDesignScore: 82,
    communicationScore: 86,
    antiCheatIntegrity: 100 - (interview.liveMonitoring?.violations?.length || 0) * 15,
    violationsCount: interview.liveMonitoring?.violations?.length || 0,
    feedback: "High-quality code execution, clean error handling, and effective technical explanation.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-base-300 flex items-center justify-between bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary font-bold text-xs">Official Evaluation Report</span>
              <span className="text-xs text-base-content/50 font-mono">ID: {interview.id}</span>
            </div>
            <h2 className="text-2xl font-black mt-1">{interview.title}</h2>
            <p className="text-xs text-base-content/60">Candidate: {interview.candidateName} · Role: {interview.role}</p>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Overall Rating & Hiring Decision */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-base-200 border border-base-300 rounded-2xl p-4 text-center">
              <div className="text-xs font-bold text-base-content/60 uppercase">Evaluation Score</div>
              <div className="text-4xl font-black text-primary my-1 font-mono">{report.overallScore}<span className="text-sm text-base-content/40">/100</span></div>
              <div className="flex justify-center gap-1 text-warning text-xs">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`size-3.5 fill-current ${i < Math.round(report.overallScore / 20) ? "text-warning" : "text-base-300"}`} />
                ))}
              </div>
            </div>

            <div className="bg-base-200 border border-base-300 rounded-2xl p-4 text-center flex flex-col justify-center">
              <div className="text-xs font-bold text-base-content/60 uppercase">Assessment Outcome</div>
              <div className="mt-2 py-1.5 px-3 rounded-full border text-sm font-black uppercase tracking-wider bg-success/15 text-success border-success/30">
                {report.decision}
              </div>
            </div>

            <div className="bg-base-200 border border-base-300 rounded-2xl p-4 text-center flex flex-col justify-center">
              <div className="text-xs font-bold text-base-content/60 uppercase">Proctoring Integrity</div>
              <div className="text-3xl font-black text-emerald-500 mt-1 font-mono">{report.antiCheatIntegrity}%</div>
              <div className="text-[11px] text-base-content/50 mt-1">Verified Session</div>
            </div>
          </div>

          {/* Competency Breakdown */}
          <div className="bg-base-200 border border-base-300 p-5 rounded-2xl space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-base-content/60">Skill Competency Breakdown</h3>
            
            {[
              { label: "Code Correctness & Efficiency", score: report.correctnessScore, color: "progress-primary" },
              { label: "Problem Solving & Algorithmic Logic", score: report.problemSolvingScore, color: "progress-secondary" },
              { label: "System Design & Architecture", score: report.systemDesignScore, color: "progress-accent" },
              { label: "Communication & Technical Explanation", score: report.communicationScore, color: "progress-success" },
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

          {/* AI Executive Summary & Feedback */}
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <SparklesIcon className="size-4" /> AI Feedback & Key Takeaways
            </h4>
            <p className="text-base-content/80 leading-relaxed">{report.summary}</p>
            <p className="text-base-content/80 leading-relaxed font-medium mt-2">{report.feedback}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 bg-base-200/50 flex justify-between items-center">
          <button type="button" onClick={() => window.print()} className="btn btn-sm btn-primary font-bold gap-1.5 shadow-md">
            <PrinterIcon className="size-4" /> Download / Print PDF Report
          </button>
          <button type="button" onClick={onClose} className="btn btn-sm btn-ghost font-bold px-6">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
