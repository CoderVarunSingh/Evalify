import { useState, useEffect } from "react";
import LiveScoreBadge from "../components/LiveScoreBadge";
import ReportDownload from "../components/ReportDownload";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  CheckCircle2Icon,
  XCircleIcon,
  SparklesIcon,
  ArrowLeftIcon,
  TrendingUpIcon,
  BarChart3Icon,
  BotIcon,
  AlertCircleIcon,
  CheckIcon,
  PrinterIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  AlertTriangleIcon,
  LockIcon,
} from "lucide-react";

function AIReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("latest_ai_report");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setReport(parsed);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    const history = JSON.parse(localStorage.getItem("ai_interview_history") || "[]");
    const found = history.find((r) => r.id === id);
    if (found) {
      setReport(found);
    }
  }, [id]);

  if (!report) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
            <button onClick={() => navigate("/ai-interview")} className="btn btn-primary btn-sm">
              Start New AI Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allEvaluations = report.questionEvaluations || [];
  const attemptedCount = report.attemptedCount ?? allEvaluations.filter(
    (q) =>
      q.evaluation?.attemptStatus === "Attempted" ||
      (q.candidateAnswer && q.candidateAnswer !== "Not Attempted" && q.candidateAnswer.trim().length > 0)
  ).length;

  const securityReport = report.securityReport || {
    integrityScore: 100,
    trustStatus: "Verified High Integrity",
    trustBadgeColor: "success",
    totalViolations: 0,
    highSeverityCount: 0,
    violationsLogs: [],
    proctoringDetails: { tabSwitchCount: 0, fullscreenExits: 0, copyPasteAttempts: 0, devToolsAttempts: 0, mediaViolations: 0 },
  };

  const violationsLogs = securityReport.violationsLogs || [];

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans pb-16 print:bg-white print:text-black print:pb-0">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Top Actions & Navigation */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button
            onClick={() => navigate("/ai-interview")}
            className="flex items-center gap-2 text-base-content/70 hover:text-base-content transition-colors text-sm font-semibold"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to Interview Hub
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="btn btn-outline btn-sm gap-2 font-bold"
              title="Print or Save Web UI as PDF"
            >
              <PrinterIcon className="w-4 h-4" /> Print / Save Web PDF
            </button>
            <ReportDownload report={report} />
          </div>
        </div>

        {/* Printable Scorecard Container */}
        <div className="space-y-8 print:space-y-6">
          {/* Executive Overall Score Banner */}
          <div className="bg-base-100 border border-base-300 rounded-3xl p-8 shadow-2xl relative overflow-hidden print:border-black print:shadow-none">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold mb-3">
                  <SparklesIcon className="w-3.5 h-3.5" /> AI Evaluation Certificate
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-base-content mb-2 tracking-tight">
                  {report.role} Interview Report
                </h1>
                <p className="text-base-content/70 text-sm">
                  Candidate Evaluation Report • Mode: {report.company} • Date: {report.date}
                </p>
                <div className="mt-2 text-xs font-semibold text-base-content/60">
                  Attempted: <span className="text-primary font-bold">{attemptedCount}</span> / {allEvaluations.length} Questions
                </div>
              </div>

              {/* Score Badge */}
              <div className="flex items-center gap-4 bg-base-200/80 p-6 rounded-2xl border border-base-300 shadow-xl print:bg-white print:border-black">
                <LiveScoreBadge score={report.overallScore} />
                <div className="w-px h-12 bg-base-300 print:bg-black" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{report.grade}</div>
                  <div className="text-[10px] uppercase tracking-wider text-base-content/60 font-bold mt-1">
                    {report.status}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Criteria Metric Breakdown Grid */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
              <BarChart3Icon className="w-5 h-5 text-primary" /> Evaluation Criteria Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md print:border-black">
                <div className="text-xs text-base-content/70 font-semibold mb-1">Correctness</div>
                <div className="text-xl font-black text-primary mb-1.5">{report.avgCorrectness ?? report.overallScore} / 100</div>
                <progress className="progress progress-primary w-full" value={report.avgCorrectness ?? report.overallScore} max="100" />
              </div>

              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md print:border-black">
                <div className="text-xs text-base-content/70 font-semibold mb-1">Technical Accuracy</div>
                <div className="text-xl font-black text-secondary mb-1.5">{report.avgTech ?? 0} / 100</div>
                <progress className="progress progress-secondary w-full" value={report.avgTech ?? 0} max="100" />
              </div>

              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md print:border-black">
                <div className="text-xs text-base-content/70 font-semibold mb-1">Communication</div>
                <div className="text-xl font-black text-success mb-1.5">{report.avgComm ?? 0} / 100</div>
                <progress className="progress progress-success w-full" value={report.avgComm ?? 0} max="100" />
              </div>

              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md print:border-black">
                <div className="text-xs text-base-content/70 font-semibold mb-1">Confidence</div>
                <div className="text-xl font-black text-warning mb-1.5">{report.avgConf ?? 0} / 100</div>
                <progress className="progress progress-warning w-full" value={report.avgConf ?? 0} max="100" />
              </div>

              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md print:border-black">
                <div className="text-xs text-base-content/70 font-semibold mb-1">Completeness</div>
                <div className="text-xl font-black text-accent mb-1.5">{report.avgCompleteness ?? 0} / 100</div>
                <progress className="progress progress-accent w-full" value={report.avgCompleteness ?? 0} max="100" />
              </div>

              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md print:border-black">
                <div className="text-xs text-base-content/70 font-semibold mb-1">Logical Reasoning</div>
                <div className="text-xl font-black text-info mb-1.5">{report.avgLogicalReasoning ?? 0} / 100</div>
                <progress className="progress progress-info w-full" value={report.avgLogicalReasoning ?? 0} max="100" />
              </div>

              <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md sm:col-span-2 lg:col-span-2 print:border-black">
                <div className="text-xs text-base-content/70 font-semibold mb-1">Problem-Solving Skills</div>
                <div className="text-xl font-black text-primary mb-1.5">{report.avgProblemSolving ?? 0} / 100</div>
                <progress className="progress progress-primary w-full" value={report.avgProblemSolving ?? 0} max="100" />
              </div>
            </div>
          </div>

          {/* AI ANTI-CHEATING & PROCTORING INTEGRITY REPORT CARD */}
          <div className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 print:border-black print:shadow-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-base-300 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-${securityReport.trustBadgeColor || "success"}/10 text-${securityReport.trustBadgeColor || "success"}`}>
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-base-content">
                    AI Anti-Cheating & Security Integrity Report
                  </h2>
                  <p className="text-xs text-base-content/60">
                    Real-time tab switching, camera, microphone, copy-paste, and devtools proctoring audit
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-black text-primary">
                    {securityReport.integrityScore ?? 100}%
                  </div>
                  <div className="text-[10px] uppercase font-bold text-base-content/60">Integrity Score</div>
                </div>
                <span className={`badge badge-${securityReport.trustBadgeColor || "success"} badge-lg font-bold text-white px-3 py-1`}>
                  {securityReport.trustStatus || "Verified High Integrity"}
                </span>
              </div>
            </div>

            {/* Security Breakdown Stat Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center font-bold">
              <div className="p-3 rounded-xl bg-base-200/80 border border-base-300">
                <div className="text-base font-extrabold text-base-content">{securityReport.proctoringDetails?.tabSwitchCount ?? 0}</div>
                <div className="text-[10px] text-base-content/60">Tab Switches</div>
              </div>
              <div className="p-3 rounded-xl bg-base-200/80 border border-base-300">
                <div className="text-base font-extrabold text-base-content">{securityReport.proctoringDetails?.fullscreenExits ?? 0}</div>
                <div className="text-[10px] text-base-content/60">Fullscreen Exits</div>
              </div>
              <div className="p-3 rounded-xl bg-base-200/80 border border-base-300">
                <div className="text-base font-extrabold text-base-content">{securityReport.proctoringDetails?.copyPasteAttempts ?? 0}</div>
                <div className="text-[10px] text-base-content/60">Copy/Paste Events</div>
              </div>
              <div className="p-3 rounded-xl bg-base-200/80 border border-base-300">
                <div className="text-base font-extrabold text-base-content">{securityReport.proctoringDetails?.devToolsAttempts ?? 0}</div>
                <div className="text-[10px] text-base-content/60">DevTools Attempts</div>
              </div>
              <div className="p-3 rounded-xl bg-base-200/80 border border-base-300 col-span-2 sm:col-span-1">
                <div className="text-base font-extrabold text-base-content">{securityReport.proctoringDetails?.mediaViolations ?? 0}</div>
                <div className="text-[10px] text-base-content/60">Media Alerts</div>
              </div>
            </div>

            {/* Violation Logs List */}
            {violationsLogs.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-base-content/80 uppercase tracking-wider mb-2">Recorded Security Alerts ({violationsLogs.length})</h4>
                <div className="overflow-x-auto rounded-xl border border-base-300">
                  <table className="table table-sm w-full text-xs">
                    <thead>
                      <tr className="bg-base-200 text-base-content/80">
                        <th className="w-20">Time</th>
                        <th className="w-40">Violation Type</th>
                        <th>Proctoring Audit Description</th>
                        <th className="text-center w-24">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {violationsLogs.map((v, vIdx) => (
                        <tr key={vIdx} className="hover:bg-base-200/50">
                          <td className="font-mono text-base-content/70">{v.timestamp}</td>
                          <td className="font-bold text-base-content">{v.type}</td>
                          <td className="text-base-content/80">{v.message}</td>
                          <td className="text-center">
                            <span className={`badge badge-xs font-bold px-2 py-0.5 ${
                              v.severity === "High" ? "badge-error text-white" : v.severity === "Medium" ? "badge-warning" : "badge-ghost"
                            }`}>
                              {v.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-success/10 border border-success/30 flex items-center gap-3 text-xs text-success font-bold">
                <CheckCircle2Icon className="w-5 h-5 shrink-0" />
                <span>Zero proctoring violations recorded. Interview session completed with full security compliance.</span>
              </div>
            )}
          </div>

          {/* Full Question-by-Question Analysis */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
              <BarChart3Icon className="w-6 h-6 text-primary" /> Question-wise Detailed Evaluation
            </h2>

            {allEvaluations.map((item, idx) => {
              const isSkipped =
                item.evaluation?.attemptStatus === "Not Attempted" ||
                !item.candidateAnswer ||
                item.candidateAnswer === "Not Attempted" ||
                item.candidateAnswer.trim().length === 0;

              return (
                <div
                  key={idx}
                  className={`bg-base-100 border rounded-3xl p-6 shadow-xl space-y-4 print:border-black print:shadow-none ${
                    isSkipped ? "border-error/40 bg-error/5" : "border-base-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 border-b border-base-300 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-primary badge-sm font-bold">Question {idx + 1}</span>
                        {isSkipped ? (
                          <span className="badge badge-error badge-sm gap-1 font-bold text-white">
                            <AlertCircleIcon className="w-3 h-3" /> Not Attempted (Score: 0)
                          </span>
                        ) : (
                          <span className="badge badge-success badge-sm gap-1 font-bold text-white">
                            <CheckIcon className="w-3 h-3" /> Attempted
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-base-content">{item.question}</h3>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black ${isSkipped ? "text-error" : "text-success"}`}>
                        {item.evaluation?.score ?? 0}
                      </span>
                      <span className="text-xs text-base-content/60 font-bold block">/ 100</span>
                    </div>
                  </div>

                  {/* Candidate Answer */}
                  <div>
                    <div className="text-xs font-bold text-base-content/70 mb-1">Your Response:</div>
                    <div className={`p-4 rounded-xl border text-sm font-sans ${
                      isSkipped
                        ? "bg-error/10 border-error/30 text-error font-semibold italic"
                        : "bg-base-200/80 border-base-300 text-base-content/90"
                    }`}>
                      {isSkipped ? "Question Skipped / Not Attempted" : `"${item.candidateAnswer}"`}
                    </div>
                  </div>

                  {/* 7-Criteria Score Chips */}
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="px-2.5 py-1 rounded-lg bg-base-200 border border-base-300 text-primary">Correctness: {item.evaluation?.correctnessScore ?? 0}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-base-200 border border-base-300 text-secondary">Tech Accuracy: {item.evaluation?.technicalScore ?? 0}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-base-200 border border-base-300 text-success">Communication: {item.evaluation?.communicationScore ?? 0}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-base-200 border border-base-300 text-warning">Confidence: {item.evaluation?.confidenceScore ?? 0}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-base-200 border border-base-300 text-accent">Completeness: {item.evaluation?.completenessScore ?? 0}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-base-200 border border-base-300 text-info">Logical Reasoning: {item.evaluation?.logicalReasoningScore ?? 0}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-base-200 border border-base-300 text-primary">Problem Solving: {item.evaluation?.problemSolvingScore ?? 0}</span>
                  </div>

                  {/* Strengths & Mistakes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-success/10 border border-success/30 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-success mb-2 flex items-center gap-1.5">
                        <CheckCircle2Icon className="w-4 h-4" /> Key Strengths
                      </h4>
                      <ul className="text-xs text-base-content/80 space-y-1 list-disc list-inside">
                        {item.evaluation?.strengths?.map((s, sIdx) => (
                          <li key={sIdx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-error/10 border border-error/30 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-error mb-2 flex items-center gap-1.5">
                        <XCircleIcon className="w-4 h-4" /> Improvement Areas
                      </h4>
                      <ul className="text-xs text-base-content/80 space-y-1 list-disc list-inside">
                        {item.evaluation?.mistakes?.map((m, mIdx) => (
                          <li key={mIdx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* AI Model Answer */}
                  <div className="bg-base-200/90 p-4 rounded-xl border border-primary/30">
                    <div className="text-xs font-bold text-primary mb-1 flex items-center gap-1.5">
                      <BotIcon className="w-4 h-4" /> AI Model Ideal Answer:
                    </div>
                    <p className="text-xs text-base-content/80 leading-relaxed">{item.evaluation?.modelAnswer}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Personalized Learning Roadmap */}
          <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xl print:border-black print:shadow-none">
            <h2 className="text-xl font-bold text-base-content mb-4 flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5 text-primary" /> Actionable Learning Roadmap
            </h2>
            <div className="space-y-3">
              {report.learningRoadmap?.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-base-200/60 p-3.5 rounded-2xl border border-base-300 text-sm text-base-content/80 print:border-black"
                >
                  <div className="w-7 h-7 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div>{tip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIReportPage;
