import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { analyzeResume } from "../lib/resumeAnalyzer";
import {
  UploadIcon, SparklesIcon, CheckCircle2Icon, XCircleIcon, ZapIcon,
  AlertCircleIcon, BotIcon, FileTextIcon, TargetIcon, RefreshCwIcon,
  FileUpIcon, Trash2Icon, Edit3Icon, ShieldCheckIcon, FileTypeIcon,
  CopyIcon, CheckIcon, Wand2Icon, ListChecksIcon, BarChart2Icon,
  AwardIcon, FileCode2Icon, TrendingUpIcon, TrendingDownIcon,
  AlertTriangleIcon, InfoIcon, ChevronDownIcon, ChevronUpIcon, BookOpenIcon,
} from "lucide-react";

// ─── Sample Resume ────────────────────────────────────────────────────────────
const SAMPLE_RESUME = `Alex Rivera | Senior Full Stack Software Engineer
Email: alex.rivera@example.com | Phone: (555) 019-2834 | San Francisco, CA | GitHub: github.com/alexrivera

PROFESSIONAL SUMMARY
Results-driven Senior Full Stack Engineer with 5+ years of experience building scalable web applications, microservices, and cloud-native systems. Expert in React, Node.js, TypeScript, PostgreSQL, and AWS architecture. Demonstrated track record of optimizing application performance by 40% and leading cross-functional teams of 8+ engineers.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL, HTML5, CSS3
Frontend: React, Redux, Next.js, TailwindCSS, Vue.js, GraphQL
Backend: Node.js, Express, FastAPI, PostgreSQL, MongoDB, REST APIs
DevOps & Cloud: Docker, Kubernetes, AWS (S3, EC2, Lambda), Git, CI/CD

PROFESSIONAL EXPERIENCE
Senior Software Engineer | TechCorp Solutions (2022 - Present)
- Architected and deployed microservices using Node.js and TypeScript, reducing server response latency by 35%.
- Led frontend development of a real-time analytics dashboard in React & TailwindCSS, serving 100,000+ monthly active users.
- Implemented automated CI/CD pipelines with GitHub Actions and Docker, reducing deployment cycle times by 50%.
- Mentored 4 junior engineers through code reviews and 1:1 coaching sessions.

Software Engineer | DevInnovations Inc (2019 - 2022)
- Built scalable RESTful APIs with Python FastAPI and PostgreSQL processing 2M+ daily transactions.
- Developed interactive UI components with React and Redux, improving user retention by 20%.
- Optimized database queries, reducing page load time by 45% across 3 product lines.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2015 - 2019) | GPA: 3.8/4.0

PROJECTS
Evalify Platform (github.com/alexrivera/evalify)
Built an AI-powered interview platform using React, Node.js, and OpenAI API serving 5,000+ users.`;

// ─── File Utilities ───────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"];

function validateFile(file) {
  if (!file) return "No file selected.";
  const ext = file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext))
    return `Unsupported format (.${ext}). Only .pdf, .docx, and .txt are allowed.`;
  if (file.size > MAX_FILE_SIZE)
    return `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the 5 MB limit.`;
  return null;
}

async function parseFileContent(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "txt") {
    const text = await file.text();
    if (!text.trim()) throw new Error("The TXT file is empty.");
    return text;
  }
  if (ext === "docx") {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const raw = decoder.decode(buffer);
    const wtMatches = raw.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (wtMatches?.length > 0) {
      const extracted = wtMatches.map((m) => m.replace(/<[^>]+>/g, "")).join(" ");
      if (extracted.trim().length > 10) return extracted;
    }
    const clean = raw.replace(/<[^>]+>/g, " ").replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
    if (!clean || clean.length < 10) throw new Error("Unable to extract text from DOCX. Ensure it contains readable text.");
    return clean;
  }
  if (ext === "pdf") {
    const buffer = await file.arrayBuffer();
    const raw = new TextDecoder("latin1").decode(buffer);
    // Strategy 1: Tagged PDF StructTree (Canva, Word, Google Docs, modern PDFs)
    const taggedText = extractTaggedPDFText(raw);
    if (taggedText && taggedText.trim().split(/\s+/).length > 15) return taggedText;
    // Strategy 2: Content stream Tj/TJ for older/simple PDFs
    const blocks = [];
    const rx = /\(([^()\\]|\\[\s\S])*\)\s*(?:Tj|TJ|'|")/g;
    let rxm;
    while ((rxm = rx.exec(raw)) !== null) {
      const inner = rxm[0].match(/\((.*?)\)/s);
      if (inner?.[1]) blocks.push(inner[1]
        .replace(/\\([0-7]{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)))
        .replace(/\\(.)/g, "$1"));
    }
    const result = blocks.join(" ").replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
    if (result.length > 30) return result;
    throw new Error(
      "Could not extract text from this PDF.\n\nThis usually happens with Canva PDFs that use compressed image layers.\n\nTip: Open the PDF, select all text (Ctrl+A), copy it, then use the Paste Text tab instead."
    );
  }
  throw new Error("Unsupported file format.");
}

// ─── Tagged PDF Text Extractor ────────────────────────────────────────────────
// Reads the StructTree /E and /T accessibility fields from tagged PDFs.
// Works even when content streams are FlateDecode-compressed (Canva, Word, Google Docs).
function extractTaggedPDFText(raw) {
  // Parse StructElem objects (N 0 obj ... endobj blocks)
  const elems = {};
  const objRx = /(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g;
  let om;
  while ((om = objRx.exec(raw)) !== null) {
    if (/\/Type\s*\/StructElem\b/.test(om[2])) elems[om[1]] = om[2];
  }
  if (!Object.keys(elems).length) return "";

  // Find the reading order array from the Part (or Document) StructElem
  let readingOrder = [];
  for (const [, body] of Object.entries(elems)) {
    if (/\/S\s*\/Part\b/.test(body) || /\/S\s*\/Document\b/.test(body)) {
      const km = body.match(/\/K\s*\[([^\]]+)\]/);
      if (km) {
        readingOrder = (km[1].match(/(\d+)\s+0\s+R/g) || []).map(r => r.split(/\s/)[0]);
        if (/\/S\s*\/Part\b/.test(body) && readingOrder.length) break;
      }
    }
  }
  if (!readingOrder.length) return "";

  // Extract literal or hex PDF string value for a given key
  function getString(body, key) {
    // Literal: /KEY (text with \( escaped parens \))
    const lm = body.match(new RegExp("\\/" + key + "\\s*\\(((\\\\[\\s\\S]|[^()\\\\])*)\\)"));
    if (lm) {
      return lm[1]
        .replace(/\\([0-7]{1,3})/g, (_, o) => { const c = parseInt(o, 8); return c >= 32 && c < 127 ? String.fromCharCode(c) : ""; })
        .replace(/\\n|\\r|\\t/g, " ")
        .replace(/\\(.)/g, "$1")
        .replace(/[\x00-\x08\x7F-\xFF]/g, "")
        .trim();
    }
    // Hex: /KEY <48657820737472696E67>
    const hm = body.match(new RegExp("\\/" + key + "\\s*<([0-9A-Fa-f\\s]+)>"));
    if (hm) {
      const hex = hm[1].replace(/\s/g, "");
      let s = "";
      for (let i = 0; i < hex.length - 1; i += 2) {
        const c = parseInt(hex.substring(i, i + 2), 16);
        if (c >= 0x20 && c < 0x7F) s += String.fromCharCode(c);
        else if (c === 0x0A || c === 0x0D) s += " ";
        else if (c === 0x85) s += " | "; // Canva uses 0x85 as a separator character
      }
      return s.replace(/\s{2,}/g, " ").trim();
    }
    return null;
  }

  // Get child object references from a K array or single K ref
  function getKList(body) {
    const am = body.match(/\/K\s*\[([^\]]*)\]/);
    if (am) return (am[1].match(/(\d+)\s+0\s+R/g) || []).map(r => r.split(/\s/)[0]);
    const sm = body.match(/\/K\s+(\d+)\s+0\s+R\b/);
    if (sm) return [sm[1]];
    return [];
  }

  // Recursively extract structured text from a StructElem
  function extractElem(num) {
    const body = elems[num];
    if (!body) return null;
    const sm = body.match(/\/S\s*\/(\w+)/);
    const type = sm ? sm[1] : "";
    // Skip purely presentational elements
    if (["Figure", "Link", "Lbl", "OBJR", "Annotation"].includes(type)) return null;
    // Try /E (expansion/actual text) then /T (title)
    const direct = getString(body, "E") || getString(body, "T");
    if (direct && direct.trim()) return { type, text: direct.trim() };
    // No direct text — recurse into children
    const kids = getKList(body).map(extractElem).filter(Boolean);
    if (!kids.length) return null;
    if (type === "L") {
      const items = kids.flatMap(c => c.items || (c.text ? [c.text] : []));
      return items.length ? { type: "L", items } : null;
    }
    if (type === "LI") {
      const text = kids.map(c => c.text || (c.items || []).join("\n")).filter(Boolean).join(" ").trim();
      return text ? { type: "LI", text } : null;
    }
    const text = kids.map(c => c.items ? c.items.map(i => "• " + i).join("\n") : (c.text || "")).filter(Boolean).join(" ").trim();
    return text ? { type, text } : null;
  }

  // Render elements in reading order with appropriate formatting
  const lines = [];
  for (const num of readingOrder) {
    const r = extractElem(num);
    if (!r) continue;
    if (r.type === "H1") lines.push(r.text);
    else if (r.type === "H2") lines.push("\n" + r.text.toUpperCase());
    else if (r.type === "H3") lines.push(r.text);
    else if (r.type === "H4") lines.push("\n" + r.text);
    else if (r.type === "L") (r.items || []).forEach(i => lines.push("• " + i));
    else if (r.type === "LI" || r.type === "LBody") lines.push("• " + r.text);
    else if (r.text) lines.push(r.text);
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ─── Helper Components ────────────────────────────────────────────────────────
function ScoreRing({ score, size = 100 }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-base-200" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-black text-xl leading-none" style={{ color }}>{score}</span>
        <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    high: "bg-error/15 text-error border-error/30",
    medium: "bg-warning/15 text-warning border-warning/30",
    low: "bg-info/15 text-info border-info/30",
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${map[severity] || map.low}`}>
      {severity}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    Critical: "bg-error/15 text-error border-error/30",
    High: "bg-warning/15 text-warning border-warning/30",
    Medium: "bg-info/15 text-info border-info/30",
    Low: "bg-base-300 text-base-content/60 border-base-300",
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${map[priority] || map.Low}`}>
      {priority}
    </span>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function ResumeAnalyzerPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [inputTab, setInputTab] = useState("upload");
  const [resultTab, setResultTab] = useState("overview");
  const [resumeText, setResumeText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [storedResume, setStoredResume] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedGrammar, setExpandedGrammar] = useState(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("iq_user_resume");
      if (saved) setStoredResume(JSON.parse(saved));
    } catch {}
  }, []);

  const saveToStorage = (text, result, fileName = "resume.txt") => {
    try {
      const payload = { fileName, text, atsScore: result.atsScore, inferredRole: result.inferredRole, updatedAt: new Date().toISOString() };
      localStorage.setItem("iq_user_resume", JSON.stringify(payload));
      setStoredResume(payload);
    } catch {}
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    setFileError("");
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setSelectedFile(file);
    setIsParsing(true);
    try {
      const text = await parseFileContent(file);
      setResumeText(text);
    } catch (e) {
      setFileError(e.message);
      setSelectedFile(null);
      setResumeText("");
    } finally {
      setIsParsing(false);
    }
  };

  const handleAnalyze = () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeResume(resumeText);
      setAnalysis(result);
      setIsAnalyzing(false);
      setResultTab("overview");
      saveToStorage(resumeText, result, selectedFile?.name);
    }, 1400);
  };

  const handleLaunchInterview = () => {
    if (!analysis) return;
    const sessionConfig = {
      id: "aisess-" + Date.now(), role: analysis.inferredRole,
      difficulty: "Hard", mode: "voice", company: "General",
      questionCount: 3, questions: [], startTime: new Date().toISOString(),
    };
    import("../data/aiQuestions.js").then((mod) => {
      const qs = (mod.AI_INTERVIEW_QUESTIONS[analysis.inferredRole] || mod.AI_INTERVIEW_QUESTIONS["Frontend"]).slice(0, 3);
      sessionConfig.questions = qs;
      sessionStorage.setItem("current_ai_interview", JSON.stringify(sessionConfig));
      navigate("/ai-interview/session");
    });
  };

  const handleCopy = () => {
    if (!analysis?.improvedResumeText) return;
    navigator.clipboard.writeText(analysis.improvedResumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const atsColor = !analysis ? "" : analysis.atsScore >= 80 ? "text-success" : analysis.atsScore >= 60 ? "text-warning" : "text-error";

  const RESULT_TABS = [
    { id: "overview", label: "Overview", icon: <BarChart2Icon className="w-3.5 h-3.5" /> },
    { id: "strengths", label: "Pros & Cons", icon: <AwardIcon className="w-3.5 h-3.5" /> },
    { id: "keywords", label: "Keywords", icon: <TargetIcon className="w-3.5 h-3.5" /> },
    { id: "grammar", label: "Grammar & Verbs", icon: <Wand2Icon className="w-3.5 h-3.5" /> },
    { id: "improved", label: "AI Rewrite", icon: <FileCode2Icon className="w-3.5 h-3.5" /> },
    { id: "action", label: "Action Plan", icon: <ListChecksIcon className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold mb-3">
            <SparklesIcon className="w-3.5 h-3.5" /> AI Resume Analysis Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">AI Resume Analyzer & ATS Optimizer</h1>
          <p className="text-base-content/60 text-sm">
            Upload or paste your resume for an instant ATS compatibility score, grammar audit, keyword gap analysis, strengths & weaknesses, and an AI-rewritten improved version.
          </p>
        </div>

        {/* ── Saved Resume Banner ── */}
        {storedResume && (
          <div className="bg-base-100 border border-success/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded-xl bg-success/10 text-success shrink-0">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold">Saved Resume: </span>
                <span className="text-success font-semibold">{storedResume.fileName}</span>
                <span className="text-xs text-base-content/50 ml-2">
                  ATS {storedResume.atsScore}% · {new Date(storedResume.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setResumeText(storedResume.text); setInputTab("editor"); }}
                className="px-3 py-1.5 bg-success/10 hover:bg-success/20 text-success border border-success/30 text-xs font-bold rounded-xl">
                Load Saved
              </button>
              <button onClick={() => { localStorage.removeItem("iq_user_resume"); setStoredResume(null); }}
                className="px-3 py-1.5 bg-base-200 hover:bg-error/10 hover:text-error border border-base-300 text-xs font-semibold rounded-xl text-base-content/60">
                Remove
              </button>
            </div>
          </div>
        )}

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left: Input Panel (5 cols) ── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-lg">
              {/* Input Tab Toggle */}
              <div className="flex bg-base-200 p-1 rounded-xl mb-5">
                {[
                  { id: "upload", label: "Upload File", icon: <FileUpIcon className="w-4 h-4" /> },
                  { id: "editor", label: "Paste Text", icon: <Edit3Icon className="w-4 h-4" /> },
                ].map((t) => (
                  <button key={t.id} onClick={() => setInputTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                      inputTab === t.id ? "bg-base-100 text-primary shadow-md" : "text-base-content/50 hover:text-base-content"
                    }`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Error */}
              {fileError && (
                <div className="mb-4 p-3 bg-error/10 border border-error/30 text-error rounded-xl text-xs flex items-start gap-2">
                  <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Upload Tab */}
              {inputTab === "upload" && (
                <div className="space-y-3">
                  <div
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]); }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center ${
                      isDragOver ? "border-primary bg-primary/5 scale-[1.01]"
                      : selectedFile ? "border-success/60 bg-success/5"
                      : "border-base-300 hover:border-primary/50 hover:bg-base-200/40"
                    }`}>
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }} />

                    {isParsing ? (
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCwIcon className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm font-bold">Extracting text from file…</p>
                      </div>
                    ) : selectedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileTypeIcon className="w-10 h-10 text-success" />
                        <p className="font-bold text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-base-content/50">{(selectedFile.size / 1024).toFixed(1)} KB · {wordCount} words extracted</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge badge-success badge-sm font-bold">✓ Ready</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setResumeText(""); setFileError(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                            className="p-1.5 hover:text-error rounded-lg transition-colors">
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <UploadIcon className="w-8 h-8 text-base-content/30" />
                        <p className="text-sm font-bold text-base-content">Drag & drop your resume, or <span className="text-primary underline">browse</span></p>
                        <p className="text-xs text-base-content/50">Supports PDF, DOCX, and TXT · Max 5 MB</p>
                      </div>
                    )}
                  </div>

                  {/* Parsed preview */}
                  {resumeText && inputTab === "upload" && (
                    <div>
                      <div className="flex justify-between text-xs text-base-content/50 mb-1">
                        <span className="font-semibold">Extracted Preview</span>
                        <span>{wordCount} words</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto bg-base-200 p-3 rounded-xl text-xs font-mono text-base-content/70 whitespace-pre-wrap border border-base-300">
                        {resumeText.slice(0, 600)}{resumeText.length > 600 ? "…" : ""}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Text Editor Tab */}
              {inputTab === "editor" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-base-content/60">Paste or type your resume</span>
                    <div className="flex gap-3">
                      <button onClick={() => setResumeText(SAMPLE_RESUME)} className="text-xs text-primary font-semibold hover:underline">
                        Load Sample
                      </button>
                      {resumeText && <button onClick={() => { setResumeText(""); setAnalysis(null); }} className="text-xs text-error font-semibold hover:underline">Clear</button>}
                    </div>
                  </div>
                  <textarea
                    className="w-full h-64 bg-base-200 border border-base-300 rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-primary resize-none"
                    placeholder="Paste your full resume content here…"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                  <div className="flex justify-between text-xs text-base-content/40">
                    <span>{wordCount} words</span>
                    <span>{resumeText.length} chars</span>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <button onClick={handleAnalyze}
                disabled={!resumeText.trim() || isAnalyzing || isParsing}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-content font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {isAnalyzing
                  ? <><RefreshCwIcon className="w-5 h-5 animate-spin" /> Running AI Analysis…</>
                  : <><SparklesIcon className="w-5 h-5" /> Analyze Resume & Generate AI Report</>}
              </button>
            </div>

            {/* Privacy Note */}
            <div className="bg-base-100 border border-base-300 rounded-2xl p-4 flex gap-3 items-start text-xs text-base-content/60">
              <ShieldCheckIcon className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <span><strong className="text-base-content">Fully Private:</strong> All analysis runs locally in your browser. Your resume text is never sent to any server.</span>
            </div>
          </div>

          {/* ── Right: Results Panel (7 cols) ── */}
          <div className="lg:col-span-7 space-y-4">
            {!analysis ? (
              <div className="bg-base-100 border border-base-300 rounded-2xl flex flex-col items-center justify-center text-center p-12 min-h-[500px]">
                <BotIcon className="w-16 h-16 text-base-content/20 mb-4" />
                <h3 className="font-bold text-lg text-base-content/60 mb-2">AI Analysis Not Yet Run</h3>
                <p className="text-xs text-base-content/40 max-w-xs">Upload your resume file or paste text on the left, then click <strong>Analyze</strong> to get your complete AI report.</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* ATS Score Summary Card */}
                <div className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-6">
                    <ScoreRing score={analysis.atsScore} size={110} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-extrabold text-lg">ATS Compatibility Score</h3>
                        <span className="badge badge-primary badge-sm font-bold">{analysis.inferredRole}</span>
                      </div>
                      <p className={`text-sm font-bold ${atsColor} mb-3`}>
                        {analysis.atsScore >= 80 ? "✅ Excellent — highly competitive for ATS filters."
                         : analysis.atsScore >= 65 ? "⚠️ Good — apply recommendations to reach 80+."
                         : "❌ Low match — significant improvements needed."}
                      </p>
                      {/* Mini score bars */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                        {[
                          { label: "Keywords", val: analysis.scoreBreakdown.keywordMatch, color: "progress-primary" },
                          { label: "Structure", val: analysis.scoreBreakdown.structure, color: "progress-info" },
                          { label: "Impact", val: analysis.scoreBreakdown.impact, color: "progress-warning" },
                          { label: "Length", val: analysis.scoreBreakdown.length, color: "progress-success" },
                        ].map(({ label, val, color }) => (
                          <div key={label}>
                            <div className="flex justify-between font-semibold mb-0.5">
                              <span className="text-base-content/60">{label}</span>
                              <span>{val}%</span>
                            </div>
                            <progress className={`progress ${color} w-full h-1.5`} value={val} max="100" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result Sub-tabs */}
                <div className="flex gap-1 overflow-x-auto bg-base-100 border border-base-300 p-1.5 rounded-2xl">
                  {RESULT_TABS.map((t) => (
                    <button key={t.id} onClick={() => setResultTab(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        resultTab === t.id ? "bg-primary text-primary-content shadow-sm" : "text-base-content/60 hover:bg-base-200"
                      }`}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                {/* ── Overview Tab ── */}
                {resultTab === "overview" && (
                  <div className="space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Word Count", value: analysis.wordCount, color: "text-primary" },
                        { label: "Metrics Found", value: analysis.metricCount, color: "text-success" },
                        { label: "Skills Detected", value: analysis.detectedSkills.length, color: "text-warning" },
                        { label: "Grammar Issues", value: analysis.grammarIssues.length, color: analysis.grammarIssues.length > 0 ? "text-error" : "text-success" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-base-100 border border-base-300 rounded-xl p-4 text-center shadow-sm">
                          <div className={`text-2xl font-black font-mono ${color}`}>{value}</div>
                          <div className="text-[11px] text-base-content/50 font-semibold mt-0.5">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Sections Detected */}
                    <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-base-content/50 mb-3">Resume Sections Detected by ATS</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(analysis.sections).map(([section, found]) => (
                          <div key={section}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                              found ? "bg-success/10 border-success/30 text-success" : "bg-base-200 border-base-300 text-base-content/40"
                            }`}>
                            {found ? <CheckCircle2Icon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top 3 Critical Issues at a glance */}
                    {analysis.grammarIssues.filter(g => g.severity === "high").length > 0 && (
                      <div className="bg-error/5 border border-error/25 rounded-2xl p-5">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-error mb-3 flex items-center gap-1.5">
                          <AlertTriangleIcon className="w-4 h-4" /> Critical Issues Found
                        </h4>
                        <ul className="space-y-1.5">
                          {analysis.grammarIssues.filter(g => g.severity === "high").slice(0, 3).map((g, i) => (
                            <li key={i} className="text-xs flex items-start gap-2">
                              <span className="text-error shrink-0 mt-0.5">•</span>
                              <span className="text-base-content/80">{g.issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Strengths & Weaknesses Tab ── */}
                {resultTab === "strengths" && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-base-100 border border-success/30 rounded-2xl p-5 shadow-sm">
                      <h4 className="font-bold text-success text-sm flex items-center gap-2 mb-3">
                        <TrendingUpIcon className="w-4 h-4" /> Strengths ({analysis.strengths.length})
                      </h4>
                      <ul className="space-y-2.5">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs">
                            <CheckCircle2Icon className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            <span className="text-base-content/80">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-base-100 border border-error/30 rounded-2xl p-5 shadow-sm">
                      <h4 className="font-bold text-error text-sm flex items-center gap-2 mb-3">
                        <TrendingDownIcon className="w-4 h-4" /> Weaknesses ({analysis.weaknesses.length})
                      </h4>
                      {analysis.weaknesses.length === 0 ? (
                        <p className="text-xs text-base-content/50">No significant weaknesses detected. Great work!</p>
                      ) : (
                        <ul className="space-y-2.5">
                          {analysis.weaknesses.map((w, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs">
                              <XCircleIcon className="w-4 h-4 text-error shrink-0 mt-0.5" />
                              <span className="text-base-content/80">{w}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Keywords Tab ── */}
                {resultTab === "keywords" && (
                  <div className="space-y-4">
                    <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-base-content/50 mb-3">
                        Detected Skills & Frequency
                      </h4>
                      {analysis.detectedSkills.length === 0 ? (
                        <p className="text-xs text-base-content/40">No standard tech skills detected.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {analysis.detectedSkills.map((skill) => (
                            <div key={skill} className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 border border-success/30 text-success text-xs font-bold rounded-lg">
                              {skill}
                              {analysis.keywordDensity[skill] > 1 && (
                                <span className="bg-success/20 px-1 rounded text-[10px]">×{analysis.keywordDensity[skill]}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-base-content/50 mb-1">
                        Missing High-Demand {analysis.inferredRole} Keywords
                      </h4>
                      <p className="text-xs text-base-content/40 mb-3">Add these naturally to your experience bullets and skills section.</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((skill) => (
                          <span key={skill} className="px-2.5 py-1 bg-error/10 border border-error/30 text-error text-xs font-bold rounded-lg">
                            + {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-base-content/50 mb-3">
                        Power Action Verbs Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.powerVerbMatches.length > 0 ? analysis.powerVerbMatches.map((v) => (
                          <span key={v} className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-lg capitalize">{v}</span>
                        )) : <p className="text-xs text-base-content/40">No power verbs detected. Add verbs like: architected, spearheaded, deployed, optimized.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Grammar & Verbs Tab ── */}
                {resultTab === "grammar" && (
                  <div className="space-y-3">
                    {analysis.grammarIssues.length === 0 ? (
                      <div className="bg-success/5 border border-success/30 rounded-2xl p-8 text-center">
                        <CheckCircle2Icon className="w-10 h-10 text-success mx-auto mb-2" />
                        <p className="font-bold text-success">No grammar issues detected!</p>
                        <p className="text-xs text-base-content/50 mt-1">Your resume passes all grammar and verb quality checks.</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-xs text-base-content/50">
                          <InfoIcon className="w-3.5 h-3.5" />
                          <span>{analysis.grammarIssues.length} issue{analysis.grammarIssues.length !== 1 ? "s" : ""} found — click any to expand the fix</span>
                        </div>
                        {analysis.grammarIssues.map((g, i) => (
                          <div key={i} className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm">
                            <button onClick={() => setExpandedGrammar(expandedGrammar === i ? null : i)}
                              className="w-full flex items-center justify-between p-4 hover:bg-base-200/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <SeverityBadge severity={g.severity} />
                                <span className="text-xs font-bold text-base-content">{g.type}</span>
                              </div>
                              {expandedGrammar === i ? <ChevronUpIcon className="w-4 h-4 text-base-content/40" /> : <ChevronDownIcon className="w-4 h-4 text-base-content/40" />}
                            </button>
                            {expandedGrammar === i && (
                              <div className="px-4 pb-4 space-y-2 border-t border-base-200">
                                <div className="mt-3">
                                  <p className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider mb-1">Issue</p>
                                  <p className="text-xs text-base-content/80">{g.issue}</p>
                                </div>
                                <div className="bg-success/5 border border-success/20 rounded-xl p-3">
                                  <p className="text-[11px] font-bold text-success uppercase tracking-wider mb-1">How to Fix</p>
                                  <p className="text-xs text-base-content/80">{g.fix}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* ── AI Improved Resume Tab ── */}
                {resultTab === "improved" && (
                  <div className="space-y-3">
                    {/* What was improved */}
                    <div className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-base-content/50 mb-2">Changes Applied</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "✦ Passive verbs upgraded to action verbs", color: "bg-primary/10 text-primary border-primary/30" },
                          { label: "✦ First-person (I / My) removed", color: "bg-warning/10 text-warning border-warning/30" },
                          { label: "✦ Double spaces cleaned up", color: "bg-info/10 text-info border-info/30" },
                          ...(!analysis.sections.summary ? [{ label: "✦ Professional Summary added", color: "bg-success/10 text-success border-success/30" }] : []),
                          ...(!analysis.sections.skills && analysis.detectedSkills.length > 0 ? [{ label: "✦ Technical Skills section added", color: "bg-success/10 text-success border-success/30" }] : []),
                        ].map(({ label, color }) => (
                          <span key={label} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${color}`}>{label}</span>
                        ))}
                      </div>
                    </div>

                    {/* Resume output */}
                    <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <Wand2Icon className="w-4 h-4 text-primary" /> AI-Enhanced Resume
                        </h4>
                        <button onClick={handleCopy}
                          className={`btn btn-sm gap-1.5 font-bold rounded-xl ${copied ? "btn-success" : "btn-primary"}`}>
                          {copied ? <><CheckIcon className="w-4 h-4" /> Copied!</> : <><CopyIcon className="w-4 h-4" /> Copy All</>}
                        </button>
                      </div>
                      <div className="max-h-[520px] overflow-y-auto bg-base-200 border border-base-300 rounded-xl p-5 text-sm text-base-content/90 whitespace-pre-wrap leading-relaxed">
                        {analysis.improvedResumeText}
                      </div>
                      <p className="text-[11px] text-base-content/40 italic">
                        💡 Copy this into Google Docs or Word and apply your preferred formatting before sending.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Action Plan Tab ── */}
                {resultTab === "action" && (
                  <div className="space-y-3">
                    <p className="text-xs text-base-content/50 flex items-center gap-1.5">
                      <InfoIcon className="w-3.5 h-3.5" />
                      {analysis.suggestions.length} prioritized recommendations — start with Critical and High items
                    </p>
                    {analysis.suggestions.map((s, i) => (
                      <div key={i} className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm">
                        <button onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 hover:bg-base-200/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                            <PriorityBadge priority={s.priority} />
                            <span className="text-xs font-bold text-base-content">{s.title}</span>
                          </div>
                          {expandedSuggestion === i ? <ChevronUpIcon className="w-4 h-4 text-base-content/40 shrink-0" /> : <ChevronDownIcon className="w-4 h-4 text-base-content/40 shrink-0" />}
                        </button>
                        {expandedSuggestion === i && (
                          <div className="px-4 pb-4 border-t border-base-200">
                            <p className="text-xs text-base-content/70 mt-3 leading-relaxed">{s.detail}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA: Launch Tailored Interview */}
                <button onClick={handleLaunchInterview}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2">
                  <ZapIcon className="w-5 h-5 fill-current" />
                  Launch {analysis.inferredRole}-Tailored AI Mock Interview
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
