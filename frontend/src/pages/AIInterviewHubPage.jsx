import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  SparklesIcon,
  BriefcaseIcon,
  SlidersIcon,
  ZapIcon,
  Code2Icon,
  MicIcon,
  Building2Icon,
  CheckCircle2Icon,
  ClockIcon,
  LayersIcon,
  UserCheckIcon,
  BrainCircuitIcon,
  CpuIcon,
  CloudIcon,
  ShieldCheckIcon,
  TerminalIcon,
  ShuffleIcon,
  PlusCircleIcon,
  TargetIcon,
  AwardIcon,
} from "lucide-react";
import { generateQuestionsForSession } from "../data/aiQuestions";

function AIInterviewHubPage() {
  const navigate = useNavigate();

  // Selected state
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [customRole, setCustomRole] = useState("");
  const [selectedType, setSelectedType] = useState("Technical"); // HR, Technical, Coding, System Design, Voice, Mixed
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium"); // Easy, Medium, Hard, Expert
  const [selectedDuration, setSelectedDuration] = useState(30); // 15, 30, 45, 60 Mins
  const [questionCount, setQuestionCount] = useState(10); // 5, 10, 15, 20
  const [selectedCompany, setSelectedCompany] = useState("General");

  // Effective Role computation
  const effectiveRole = selectedRole === "Other" ? (customRole.trim() || "Custom Role") : selectedRole;

  // Target Roles List
  const roles = [
    { id: "Software Engineer", name: "Software Engineer", desc: "Core CS, Data Structures, OOP & Design", icon: TerminalIcon },
    { id: "Backend Developer", name: "Backend Developer", desc: "APIs, Databases, Node.js & Microservices", icon: CpuIcon },
    { id: "Frontend Developer", name: "Frontend Developer", desc: "React, DOM, State & Web Vitals", icon: Code2Icon },
    { id: "Full Stack Developer", name: "Full Stack Developer", desc: "End-to-End Apps, SSR & Database", icon: LayersIcon },
    { id: "AI Engineer", name: "AI Engineer", desc: "LLMs, RAG Pipelines, Vector DBs & Agents", icon: BrainCircuitIcon },
    { id: "ML Engineer", name: "ML Engineer", desc: "Deep Learning, PyTorch, MLOps & Models", icon: SparklesIcon },
    { id: "Data Scientist", name: "Data Scientist", desc: "A/B Testing, Statistics, Pandas & ML", icon: TargetIcon },
    { id: "DevOps Engineer", name: "DevOps Engineer", desc: "CI/CD, Docker, Kubernetes & Terraform", icon: TerminalIcon },
    { id: "Cloud Engineer", name: "Cloud Engineer", desc: "AWS/GCP/Azure, Serverless & Infrastructure", icon: CloudIcon },
    { id: "QA Engineer", name: "QA Engineer", desc: "Automation, Cypress, Playwright & Load Test", icon: CheckCircle2Icon },
    { id: "Cyber Security", name: "Cyber Security", desc: "OWASP Top 10, PKI, Penetration Testing", icon: ShieldCheckIcon },
    { id: "Product Manager", name: "Product Manager", desc: "Roadmaps, RICE Prioritization & Metrics", icon: BriefcaseIcon },
    { id: "System Architect", name: "System Architect", desc: "High Availability, Sharding & Scale", icon: LayersIcon },
    { id: "UI/UX Designer", name: "UI/UX Designer", desc: "Design Systems, Usability & Wireframes", icon: SlidersIcon },
    { id: "HR & Behavioral", name: "HR & Behavioral", desc: "STAR Scenarios, Conflict & Leadership", icon: UserCheckIcon },
    { id: "Other", name: "Other (Custom Role)", desc: "Specify your own custom position", icon: PlusCircleIcon },
  ];

  // Interview Types List
  const interviewTypes = [
    { id: "HR", name: "HR / Behavioral", desc: "Culture fit, STAR scenario & leadership", icon: UserCheckIcon },
    { id: "Technical", name: "Technical Round", desc: "Core concepts, architecture & frameworks", icon: CpuIcon },
    { id: "Coding", name: "Coding Challenge", desc: "Live code editor, algorithms & problem solving", icon: Code2Icon },
    { id: "System Design", name: "System Design", desc: "Scalability, microservices & data architecture", icon: LayersIcon },
    { id: "Voice", name: "Voice & Audio", desc: "Speech-to-text & real-time conversational AI", icon: MicIcon },
    { id: "Mixed", name: "Mixed Comprehensive", desc: "Balanced blend of Technical, Coding & HR", icon: ShuffleIcon },
  ];

  // Companies List
  const companies = ["General", "Google", "Amazon", "Meta", "Microsoft", "Apple", "Netflix", "TCS", "Infosys", "Wipro"];

  // Handle Interview Launch
  const handleStartInterview = () => {
    // Mode mapping for session page compatibility: "coding" if Coding, else "voice"
    const sessionMode = selectedType === "Coding" ? "coding" : "voice";
    
    // Generate tailored questions
    const generatedQuestions = generateQuestionsForSession(
      effectiveRole,
      selectedType,
      selectedDifficulty,
      questionCount
    );

    const sessionConfig = {
      id: "aisess-" + Date.now(),
      role: effectiveRole,
      type: selectedType,
      difficulty: selectedDifficulty,
      duration: selectedDuration, // Minutes
      questionCount: Number(questionCount),
      mode: sessionMode,
      company: selectedCompany,
      questions: generatedQuestions,
      startTime: new Date().toISOString(),
    };

    sessionStorage.setItem("current_ai_interview", JSON.stringify(sessionConfig));
    navigate("/ai-interview/session");
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-semibold mb-4 shadow-sm">
            <SparklesIcon className="w-4 h-4" /> Next-Gen AI Technical Interview Simulator
          </div>
          <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3 tracking-tight">
            Configure Your AI Interview
          </h1>
          <p className="text-base-content/70 text-sm sm:text-base leading-relaxed">
            Customize target roles, interview types, difficulty level, duration, and question count for a simulated real-time AI evaluation session.
          </p>
        </div>

        {/* Main Grid Layout: Left Column (Steps 1, 2, 3) + Right Column (Session Overview Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: All Configuration Cards (7 Cols on LG) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. TARGET ROLE SELECTION */}
            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2.5 text-base-content">
                  <BriefcaseIcon className="w-5 h-5 text-primary" /> 1. Select Target Role
                </h2>
                <span className="text-xs text-base-content/60 font-medium">
                  {roles.length} Specialized Tracks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? "bg-primary/10 border-primary ring-2 ring-primary/40 shadow-md"
                          : "bg-base-200/40 border-base-300 hover:border-primary/40 hover:bg-base-200/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl ${isSelected ? "bg-primary text-primary-content" : "bg-base-300 text-base-content/70"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm text-base-content">{r.name}</span>
                        </div>
                        {isSelected && <CheckCircle2Icon className="w-5 h-5 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-base-content/65 pl-1">{r.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Conditional Input Field for "Other" Custom Role */}
              {selectedRole === "Other" && (
                <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/30 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs sm:text-sm font-bold text-base-content mb-2 block flex items-center gap-2">
                    <PlusCircleIcon className="w-4 h-4 text-primary" /> Enter Custom Role Name:
                  </label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Embedded Systems Engineer, Blockchain Architect, Game Developer..."
                    className="w-full input input-bordered bg-base-100 border-primary/50 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-[11px] text-base-content/60 mt-1.5 pl-1">
                    The AI interviewer will adapt technical questions specifically tailored for <span className="font-bold text-primary">{customRole || "your custom role"}</span>.
                  </p>
                </div>
              )}
            </div>

            {/* 2. INTERVIEW TYPE / ROUND */}
            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h2 className="text-lg sm:text-xl font-bold mb-5 flex items-center gap-2.5 text-base-content">
                <SlidersIcon className="w-5 h-5 text-primary" /> 2. Interview Type & Format
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {interviewTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedType === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-secondary/10 border-secondary ring-2 ring-secondary/40 shadow-md"
                          : "bg-base-200/40 border-base-300 hover:border-secondary/40 hover:bg-base-200/70"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl ${isSelected ? "bg-secondary text-secondary-content" : "bg-base-300 text-base-content/70"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <CheckCircle2Icon className="w-4 h-4 text-secondary" />}
                      </div>
                      <div className="font-bold text-sm text-base-content mb-1">{t.name}</div>
                      <div className="text-xs text-base-content/65 leading-tight">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. DIFFICULTY LEVEL */}
            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <label className="text-sm font-bold text-base-content mb-3 block flex items-center gap-2">
                  <AwardIcon className="w-4 h-4 text-primary" /> 3. Difficulty Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Easy", "Medium", "Hard", "Expert"].map((diff) => {
                    const isSelected = selectedDifficulty === diff;
                    return (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`py-3 px-4 rounded-xl border font-bold text-xs sm:text-sm transition-all ${
                          isSelected
                            ? "bg-primary border-primary text-primary-content shadow-lg scale-[1.02]"
                            : "bg-base-200/60 border-base-300 text-base-content/70 hover:bg-base-200"
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY SESSION OVERVIEW & LAUNCH SIDEBAR (5 Cols on LG) */}
          <div className="lg:col-span-5 sticky top-6 space-y-6">
            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              {/* Card Header */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <ZapIcon className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-black text-base-content text-base">Session Overview</h3>
                  <p className="text-xs text-base-content/60">Configure & review before starting</p>
                </div>
              </div>

              {/* Target Company Selector */}
              <div>
                <label className="text-xs font-bold text-base-content/70 mb-1.5 block flex items-center gap-1.5">
                  <Building2Icon className="w-3.5 h-3.5 text-primary" /> Target Company
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="select select-bordered select-sm w-full bg-base-200 border-base-300 text-base-content font-bold focus:outline-none rounded-xl"
                >
                  {companies.map((c) => (
                    <option key={c} value={c}>
                      {c === "General" ? "General Industry Standard" : `${c} Interview Pattern`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Count - Slider + Input */}
              <div className="bg-base-200/50 rounded-2xl p-4 border border-base-300/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                    <LayersIcon className="w-3.5 h-3.5 text-primary" /> Number of Questions
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={questionCount}
                    onChange={(e) => {
                      const v = Math.min(30, Math.max(1, Number(e.target.value) || 1));
                      setQuestionCount(v);
                    }}
                    className="w-16 text-center input input-xs input-bordered bg-base-100 border-primary/40 text-primary font-extrabold text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="range range-xs range-primary w-full"
                />
                <div className="flex justify-between text-[10px] text-base-content/50 font-semibold px-0.5">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                  <span>30</span>
                </div>
              </div>

              {/* Duration - Slider + Input */}
              <div className="bg-base-200/50 rounded-2xl p-4 border border-base-300/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5 text-secondary" /> Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={selectedDuration}
                    onChange={(e) => {
                      const v = Math.min(120, Math.max(5, Number(e.target.value) || 5));
                      setSelectedDuration(v);
                    }}
                    className="w-16 text-center input input-xs input-bordered bg-base-100 border-secondary/40 text-secondary font-extrabold text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  />
                </div>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Number(e.target.value))}
                  className="range range-xs range-secondary w-full"
                />
                <div className="flex justify-between text-[10px] text-base-content/50 font-semibold px-0.5">
                  <span>5m</span>
                  <span>15m</span>
                  <span>30m</span>
                  <span>45m</span>
                  <span>60m</span>
                  <span>90m</span>
                  <span>120m</span>
                </div>
              </div>

              {/* Summary Details */}
              <div className="bg-base-200/60 rounded-2xl p-4 border border-base-300/80 space-y-2 text-xs text-base-content/80">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/60 font-medium">Target Role:</span>
                  <span className="font-bold text-primary max-w-[160px] truncate text-right">
                    {effectiveRole}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/60 font-medium">Interview Type:</span>
                  <span className="font-bold text-secondary">{selectedType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/60 font-medium">Difficulty:</span>
                  <span className="font-bold text-accent">{selectedDifficulty}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-base-300/50">
                  <span className="text-base-content/60 font-medium">Est. Time / Question:</span>
                  <span className="font-bold text-primary">{Math.max(1, Math.round(selectedDuration / questionCount))} Mins</span>
                </div>
              </div>

              {/* Start Interview CTA */}
              <button
                onClick={handleStartInterview}
                className="w-full py-4 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-95 text-white font-extrabold rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all text-base hover:scale-[1.01] active:scale-[0.99]"
              >
                <ZapIcon className="w-5 h-5 fill-current" /> Launch AI Interview
              </button>

              <div className="text-[11px] text-center text-base-content/50 leading-normal px-2">
                Real-time speech analysis, live coding, and AI scoring enabled.
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AIInterviewHubPage;
