import React, { useState } from "react";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  Trash2Icon,
  CheckCircle2Icon,
  SparklesIcon,
  ShieldAlertIcon,
  Code2Icon,
  HelpCircleIcon,
  LayersIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  SlidersIcon,
  VideoIcon,
  MicIcon,
  Maximize2Icon,
  CopyIcon,
  XIcon,
} from "lucide-react";
import { problemsData } from "../data/problemsData";
import { getStoredCandidates, saveCandidate } from "../lib/interviewerStorage";

export default function CreateInterviewModal({ isOpen, onClose, onSchedule }) {
  const [step, setStep] = useState(1);
  const candidates = getStoredCandidates();

  // Form state
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("Full Stack Developer");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  
  // New candidate form (if creating new candidate)
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCandName, setNewCandName] = useState("");
  const [newCandEmail, setNewCandEmail] = useState("");
  const [newCandPhone, setNewCandPhone] = useState("");

  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [scheduledTime, setScheduledTime] = useState("14:00");
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Coding Problems Assignment
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [problemSearch, setProblemSearch] = useState("");

  // Custom Questions
  const [customQuestions, setCustomQuestions] = useState([
    { id: "q-1", question: "Explain the architecture of your recent production application.", category: "System Design", points: 10 },
  ]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] = useState("Technical");

  // AI Evaluation Config
  const [aiEnabled, setAiEnabled] = useState(true);
  const [strictness, setStrictness] = useState("moderate");
  const [weights, setWeights] = useState({
    codeCorrectness: 35,
    problemSolving: 25,
    systemDesign: 20,
    communication: 20,
  });

  // Anti-Cheat Config
  const [antiCheat, setAntiCheat] = useState({
    tabSwitchLimit: 3,
    webcamRequired: true,
    audioMonitoring: true,
    copyPasteDisabled: true,
    fullScreenRequired: true,
    devToolsBlock: true,
  });

  if (!isOpen) return null;

  const handleAddCustomQuestion = () => {
    if (!newQuestionText.trim()) return;
    setCustomQuestions([
      ...customQuestions,
      {
        id: "q-" + Date.now(),
        question: newQuestionText.trim(),
        category: newQuestionCategory,
        points: 10,
      },
    ]);
    setNewQuestionText("");
  };

  const handleRemoveCustomQuestion = (id) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== id));
  };

  const toggleProblemSelection = (prob) => {
    if (selectedProblems.some((p) => p.id === prob._id || p._id === prob._id)) {
      setSelectedProblems(selectedProblems.filter((p) => (p.id || p._id) !== prob._id));
    } else {
      setSelectedProblems([
        ...selectedProblems,
        { id: prob._id, title: prob.title, difficulty: prob.difficulty, category: prob.category },
      ]);
    }
  };

  const handleCreateNewCandidate = () => {
    if (!newCandName.trim() || !newCandEmail.trim()) return;
    const newCand = {
      id: "cand-" + Date.now(),
      name: newCandName.trim(),
      email: newCandEmail.trim(),
      phone: newCandPhone.trim() || "+1 (555) 000-0000",
      role,
      experience: "N/A",
    };
    saveCandidate(newCand);
    setSelectedCandidateId(newCand.id);
    setShowAddCandidate(false);
    setNewCandName("");
    setNewCandEmail("");
    setNewCandPhone("");
  };

  const handleSubmit = () => {
    const selectedCand = candidates.find((c) => c.id === selectedCandidateId) || {
      name: "Candidate " + selectedCandidateId,
      email: "candidate@example.com",
    };

    const newInterview = {
      id: "intv-" + Date.now(),
      title: title || `${role} Technical Assessment`,
      role,
      candidateId: selectedCandidateId,
      candidateName: selectedCand.name,
      candidateEmail: selectedCand.email,
      candidatePhone: selectedCand.phone || "+1 (555) 876-5432",
      scheduledDate,
      scheduledTime,
      durationMinutes: Number(durationMinutes),
      status: "scheduled",
      customQuestions,
      assignedProblems: selectedProblems,
      aiEvaluationConfig: {
        enabled: aiEnabled,
        strictness,
        weights,
        autoFeedback: true,
      },
      antiCheatConfig: antiCheat,
      liveMonitoring: {
        candidateStatus: "active",
        lastSeen: "Scheduled",
        currentProblemIndex: 0,
        violations: [],
        liveScore: 0,
        codeSnapshot: "// Candidate has not started coding yet",
      },
      report: null,
      createdAt: new Date().toISOString(),
    };

    onSchedule(newInterview);
    onClose();
  };

  const filteredProblems = problemsData.filter(
    (p) =>
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.difficulty.toLowerCase().includes(problemSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-secondary font-bold text-xs">Interviewer Portal</span>
              <span className="text-xs text-base-content/50 font-bold uppercase tracking-wider">Step {step} of 5</span>
            </div>
            <h2 className="text-2xl font-black mt-1">Create & Schedule New Interview</h2>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Wizard Steps Bar */}
        <div className="flex bg-base-200 border-b border-base-300 px-6 py-2 overflow-x-auto gap-2">
          {[
            { num: 1, label: "1. Info & Schedule" },
            { num: 2, label: "2. Candidate" },
            { num: 3, label: "3. Problems & Questions" },
            { num: 4, label: "4. AI Evaluation" },
            { num: 5, label: "5. Anti-Cheat & Review" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                step === s.num
                  ? "bg-secondary text-secondary-content shadow-sm"
                  : step > s.num
                  ? "bg-success/15 text-success border border-success/30"
                  : "text-base-content/60 hover:bg-base-300"
              }`}
            >
              {step > s.num && <CheckCircle2Icon className="size-3.5" />}
              {s.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Basic Info & Schedule */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="form-control">
                <label className="label font-bold text-sm">Interview Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Architecture & Live Coding"
                  className="input input-bordered input-primary w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label font-bold text-sm">Target Role</label>
                  <select
                    className="select select-bordered w-full"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Frontend Engineer">Frontend Engineer</option>
                    <option value="Backend Systems Engineer">Backend Systems Engineer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="AI/ML Specialist">AI/ML Specialist</option>
                    <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label font-bold text-sm">Duration (Minutes)</label>
                  <select
                    className="select select-bordered w-full"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  >
                    <option value={30}>30 Minutes (Quick Screen)</option>
                    <option value={45}>45 Minutes (Standard Technical)</option>
                    <option value={60}>60 Minutes (Deep Technical & Architecture)</option>
                    <option value={90}>90 Minutes (Comprehensive Live System Design)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label font-bold text-sm flex items-center gap-1.5">
                    <CalendarIcon className="size-4 text-secondary" /> Scheduled Date
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label font-bold text-sm flex items-center gap-1.5">
                    <ClockIcon className="size-4 text-secondary" /> Scheduled Time
                  </label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Select Candidate */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <UserIcon className="size-5 text-secondary" /> Choose Candidate
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddCandidate(!showAddCandidate)}
                  className="btn btn-xs btn-outline btn-secondary gap-1"
                >
                  <PlusIcon className="size-3.5" />
                  {showAddCandidate ? "Choose Existing" : "Add New Candidate"}
                </button>
              </div>

              {showAddCandidate ? (
                <div className="bg-base-200 border border-base-300 p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-secondary">New Candidate Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Candidate Full Name"
                      className="input input-sm input-bordered"
                      value={newCandName}
                      onChange={(e) => setNewCandName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Candidate Email Address"
                      className="input input-sm input-bordered"
                      value={newCandEmail}
                      onChange={(e) => setNewCandEmail(e.target.value)}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (optional)"
                      className="input input-sm input-bordered"
                      value={newCandPhone}
                      onChange={(e) => setNewCandPhone(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateNewCandidate}
                    className="btn btn-sm btn-secondary font-bold"
                  >
                    Save & Select Candidate
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {candidates.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidateId(c.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedCandidateId === c.id
                          ? "bg-secondary/15 border-secondary shadow-sm scale-[1.01]"
                          : "bg-base-100 border-base-300 hover:border-secondary/40"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-xs text-base-content/60">{c.email}</div>
                        <div className="text-[11px] text-secondary font-semibold mt-1">{c.role || role} · {c.experience}</div>
                      </div>
                      <input
                        type="radio"
                        name="candidateSelection"
                        checked={selectedCandidateId === c.id}
                        onChange={() => setSelectedCandidateId(c.id)}
                        className="radio radio-secondary radio-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Assign Coding Problems & Custom Questions */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Problem Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Code2Icon className="size-4 text-primary" /> Assign Coding Problems ({selectedProblems.length} Selected)
                  </h3>
                  <input
                    type="text"
                    placeholder="Search problem bank..."
                    className="input input-xs input-bordered w-48"
                    value={problemSearch}
                    onChange={(e) => setProblemSearch(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-base-200 border border-base-300 rounded-2xl">
                  {filteredProblems.map((prob) => {
                    const isSelected = selectedProblems.some((p) => (p.id || p._id) === prob._id);
                    return (
                      <div
                        key={prob._id}
                        onClick={() => toggleProblemSelection(prob)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          isSelected ? "bg-primary/15 border-primary font-bold text-primary" : "bg-base-100 border-base-300 hover:bg-base-200"
                        }`}
                      >
                        <div>
                          <div className="font-bold">{prob.title}</div>
                          <div className="text-[10px] text-base-content/60">{prob.category}</div>
                        </div>
                        <span
                          className={`badge badge-xs font-bold ${
                            prob.difficulty === "Easy" ? "badge-success" : prob.difficulty === "Medium" ? "badge-warning" : "badge-error"
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Questions Section */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <HelpCircleIcon className="size-4 text-secondary" /> Custom Interview Questions ({customQuestions.length})
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type custom interview question..."
                    className="input input-sm input-bordered flex-1"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                  />
                  <select
                    className="select select-sm select-bordered"
                    value={newQuestionCategory}
                    onChange={(e) => setNewQuestionCategory(e.target.value)}
                  >
                    <option value="Technical">Technical</option>
                    <option value="System Design">System Design</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="CS Fundamentals">CS Fundamentals</option>
                  </select>
                  <button type="button" onClick={handleAddCustomQuestion} className="btn btn-sm btn-secondary">
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {customQuestions.map((q) => (
                    <div key={q.id} className="p-3 bg-base-200 border border-base-300 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="badge badge-outline badge-xs mr-2">{q.category}</span>
                        <span className="font-semibold">{q.question}</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveCustomQuestion(q.id)} className="text-error hover:opacity-80 p-1">
                        <Trash2Icon className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Configure AI Evaluation */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="size-6 text-primary" />
                  <div>
                    <h4 className="font-bold text-sm">AI Automated Evaluation Engine</h4>
                    <p className="text-xs text-base-content/60">Generate real-time grading breakdown, feedback, and complexity metrics.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                />
              </div>

              {aiEnabled && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label font-bold text-sm">Evaluation Strictness</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["lenient", "moderate", "strict"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStrictness(s)}
                          className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            strictness === s
                              ? "bg-primary text-primary-content border-primary"
                              : "bg-base-200 border-base-300 text-base-content/70 hover:bg-base-300"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 bg-base-200 border border-base-300 p-4 rounded-2xl">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-base-content/60">AI Scoring Weightage Distribution</h4>
                    
                    {[
                      { key: "codeCorrectness", label: "Code Correctness & Tests" },
                      { key: "problemSolving", label: "Problem Solving & Logic" },
                      { key: "systemDesign", label: "System Design & Architecture" },
                      { key: "communication", label: "Communication & Explanation" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{label}</span>
                          <span className="text-primary">{weights[key]}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          value={weights[key]}
                          onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                          className="range range-xs range-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Enable Anti-Cheat & Review */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="bg-base-200 border border-base-300 p-4 rounded-2xl space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <ShieldAlertIcon className="size-5 text-warning" /> Anti-Cheat Proctoring Rules
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300 cursor-pointer">
                    <span className="font-semibold flex items-center gap-2"><VideoIcon className="size-3.5 text-secondary" /> Webcam Feed Required</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-secondary"
                      checked={antiCheat.webcamRequired}
                      onChange={(e) => setAntiCheat({ ...antiCheat, webcamRequired: e.target.checked })}
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300 cursor-pointer">
                    <span className="font-semibold flex items-center gap-2"><MicIcon className="size-3.5 text-secondary" /> Audio Track Monitoring</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-secondary"
                      checked={antiCheat.audioMonitoring}
                      onChange={(e) => setAntiCheat({ ...antiCheat, audioMonitoring: e.target.checked })}
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300 cursor-pointer">
                    <span className="font-semibold flex items-center gap-2"><Maximize2Icon className="size-3.5 text-secondary" /> Enforce Fullscreen Mode</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-secondary"
                      checked={antiCheat.fullScreenRequired}
                      onChange={(e) => setAntiCheat({ ...antiCheat, fullScreenRequired: e.target.checked })}
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300 cursor-pointer">
                    <span className="font-semibold flex items-center gap-2"><CopyIcon className="size-3.5 text-secondary" /> Block Copy-Paste / Cut</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-secondary"
                      checked={antiCheat.copyPasteDisabled}
                      onChange={(e) => setAntiCheat({ ...antiCheat, copyPasteDisabled: e.target.checked })}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold">Max Tab Switch Violations Allowed:</span>
                  <select
                    className="select select-xs select-bordered"
                    value={antiCheat.tabSwitchLimit}
                    onChange={(e) => setAntiCheat({ ...antiCheat, tabSwitchLimit: Number(e.target.value) })}
                  >
                    <option value={1}>1 Warning (Strict)</option>
                    <option value={3}>3 Warnings (Standard)</option>
                    <option value={5}>5 Warnings (Lenient)</option>
                  </select>
                </div>
              </div>

              {/* Final Summary Card */}
              <div className="bg-gradient-to-r from-secondary/15 to-primary/15 border border-secondary/30 p-4 rounded-2xl text-xs space-y-2">
                <h4 className="font-black text-sm text-secondary uppercase tracking-wider">Interview Ready Summary</h4>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <div>Title: <span className="text-base-content font-bold">{title || `${role} Technical`}</span></div>
                  <div>Candidate: <span className="text-base-content font-bold">{candidates.find((c) => c.id === selectedCandidateId)?.name || "Selected Candidate"}</span></div>
                  <div>Schedule: <span className="text-base-content font-bold">{scheduledDate} at {scheduledTime}</span></div>
                  <div>Problems: <span className="text-base-content font-bold">{selectedProblems.length} assigned</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-base-300 bg-base-200/50 flex justify-between items-center">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="btn btn-sm btn-ghost gap-1">
              <ChevronLeftIcon className="size-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="btn btn-sm btn-secondary gap-1 font-bold">
              Next Step <ChevronRightIcon className="size-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} className="btn btn-sm btn-success gap-2 font-bold px-6">
              <CheckCircle2Icon className="size-4" /> Schedule Interview Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
