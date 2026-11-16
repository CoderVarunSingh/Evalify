import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  MicIcon,
  MicOffIcon,
  Volume2Icon,
  VolumeXIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  BotIcon,
  ClockIcon,
  PhoneOffIcon,
  CheckCircle2Icon,
  Maximize2Icon,
  UserIcon,
  VideoIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  ShieldAlertIcon,
  LockIcon,
  SparklesIcon,
  Code2Icon,
  LayersIcon,
  UserCheckIcon,
  CpuIcon,
  CheckIcon,
  PlayIcon,
  InfoIcon,
  Loader2Icon,
  RotateCcwIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";

import { generateFullInterviewReport, evaluateAnswerAsync, generateAdaptiveFollowUpQuestion } from "../lib/aiEvaluator";
import { analyzeResume } from "../lib/resumeAnalyzer";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import { executeCode } from "../lib/piston";
import { useAntiCheating } from "../hooks/useAntiCheating";
import { getCalendarStreak } from "../lib/streakManager";

const DEFAULT_QUESTIONS = [
  {
    id: "fe-1",
    title: "Virtual DOM & React Reconciliation",
    text: "Explain how React's Virtual DOM works and how the reconciliation diffing algorithm optimizes browser DOM updates.",
    category: "Frontend Architecture",
    difficulty: "Medium",
    mode: "voice",
  },
  {
    id: "fe-2",
    title: "JavaScript Closures & Lexical Scope",
    text: "What is a Closure in JavaScript? Give a practical example where closures are useful in real-world application state or event handlers.",
    category: "JavaScript Deep Dive",
    difficulty: "Easy",
    mode: "voice",
  },
  {
    id: "fe-3",
    title: "Web Performance Optimization",
    text: "How do you optimize initial page load performance for a large React single-page application? Mention code splitting and lazy loading.",
    category: "Performance",
    difficulty: "Hard",
    mode: "voice",
  },
];

function AIInterviewSessionPage() {
  const navigate = useNavigate();

  // Session Flow Lifecycle Steps: "setup" | "countdown" | "interview" | "evaluating"
  const [flowStep, setFlowStep] = useState("setup");
  const [countdownValue, setCountdownValue] = useState(3);

  // Hardware Checks State (Pre-interview Setup)
  const [micLevel, setMicLevel] = useState(0);
  const [isMicWorking, setIsMicWorking] = useState(true);
  const [isCamWorking, setIsCamWorking] = useState(true);
  const [setupVideoRef, setSetupVideoRef] = useState(null);

  // Evaluation Processing Loader Tickers
  const [evalProgress, setEvalProgress] = useState(0);
  const [evalStatusText, setEvalStatusText] = useState("Evaluating technical correctness...");

  const [sessionData, setSessionData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('ai_streak') || '0', 10));
  const [resumeFile, setResumeFile] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);

  // Video feed swap state
  const [isBigScreenCandidate, setIsBigScreenCandidate] = useState(true);

  // TTS & STT States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const isVoiceEnabledRef = useRef(isVoiceEnabled);
  const isSpeakingRef = useRef(isSpeaking);

  // Video & Media Stream Refs
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const videoRef = useRef(null);
  const smallVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Anti-Cheating System Hook
  const antiCheating = useAntiCheating({
    isSessionActive: flowStep === "interview",
    mediaStreamRef,
    videoRef,
  });

  useEffect(() => {
    isVoiceEnabledRef.current = isVoiceEnabled;
  }, [isVoiceEnabled]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Pre-Interview System Mic Audio Meter Verification
  useEffect(() => {
    if (flowStep !== "setup") return;
    let audioCtx;
    let analyser;
    let micStream;
    let animId;

    async function initMicLevel() {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(micStream);
        source.connect(analyser);
        analyser.fftSize = 64;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animId = requestAnimationFrame(updateLevel);
        };
        updateLevel();
        setIsMicWorking(true);
      } catch (e) {
        setIsMicWorking(false);
      }
    }

    initMicLevel();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (micStream) micStream.getTracks().forEach((t) => t.stop());
      if (audioCtx) audioCtx.close();
    };
  }, [flowStep]);

  // Pre-Interview Camera Preview Feed
  useEffect(() => {
    if (flowStep !== "setup" || !setupVideoRef) return;
    let camStream;

    async function initCamPreview() {
      try {
        camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (setupVideoRef) {
          setupVideoRef.srcObject = camStream;
        }
        setIsCamWorking(true);
      } catch (e) {
        setIsCamWorking(false);
      }
    }

    initCamPreview();

    return () => {
      if (camStream) camStream.getTracks().forEach((t) => t.stop());
    };
  }, [flowStep, setupVideoRef]);

  // STT Speech Recognition Lifecycle
  useEffect(() => {
    if (flowStep !== "interview") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isVoiceEnabled && !isSpeaking) {
      if (!recognitionRef.current) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.onstart = () => setIsRecording(true);
        rec.onend = () => {
          setIsRecording(false);
          if (isVoiceEnabledRef.current && !isSpeakingRef.current) {
            try { rec.start(); } catch (e) {}
          }
        };
        rec.onerror = () => setIsRecording(false);
        rec.onresult = (event) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          setAnswers(prev => ({ ...prev, [currentIdx]: currentTranscript }));
        };
        recognitionRef.current = rec;
      }
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [isVoiceEnabled, isSpeaking, currentIdx, flowStep]);

  // Code Editor States
  const [code, setCode] = useState("// Write your solution here\nfunction solution() {\n  return true;\n}");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLang, setSelectedLang] = useState("javascript");

  // Timer calculation
  const getTimerSeconds = () => {
    const duration = sessionData?.duration || 30;
    const qCount = sessionData?.questionCount || 5;
    return Math.max(30, Math.round((duration * 60) / qCount));
  };
  const [timeLeft, setTimeLeft] = useState(60);

  // Load session from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("current_ai_interview");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.questions || parsed.questions.length === 0) {
          parsed.questions = DEFAULT_QUESTIONS;
        }
        setSessionData(parsed);
      } catch (e) {
        console.error("Session parse error:", e);
        setSessionData({
          id: "aisess-" + Date.now(),
          role: "Frontend",
          difficulty: "Medium",
          mode: "voice",
          company: "General",
          questionCount: 3,
          questions: DEFAULT_QUESTIONS,
          startTime: new Date().toISOString(),
        });
      }
    } else {
      setSessionData({
        id: "aisess-" + Date.now(),
        role: "Frontend",
        difficulty: "Medium",
        mode: "voice",
        company: "General",
        questionCount: 3,
        questions: DEFAULT_QUESTIONS,
        startTime: new Date().toISOString(),
      });
    }
  }, []);

  const currentQuestion = sessionData?.questions?.[currentIdx] || DEFAULT_QUESTIONS[0];
  const isRealInterview = sessionData?.mode === "live" || sessionData?.isRealInterview === true;
  const interviewerName = sessionData?.interviewerName || (isRealInterview ? "Senior Tech Lead" : "AI Technical Interviewer");
  const isCodingQuestion = currentQuestion?.mode === "coding" || (sessionData?.mode === "coding" && currentQuestion?.mode !== "voice");

  // Animated Countdown Controller
  const startCountdown = () => {
    antiCheating.enterFullscreen();
    setFlowStep("countdown");
    setCountdownValue(3);

    const timer = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFlowStep("interview");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Live Timer Countdown per question
  useEffect(() => {
    if (flowStep !== "interview" || isSpeaking) return;
    if (timeLeft <= 0) {
      handleNextQuestion();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSpeaking, flowStep]);

  // Camera stream persistence during live session
  useEffect(() => {
    if (flowStep !== "interview") return;
    async function startCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (e) {
          console.warn("Camera access fallback:", e);
          setIsVideoOn(false);
        }
      }
    }
    if (isVideoOn && !mediaStreamRef.current) {
      startCamera();
    }
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isVideoOn, flowStep]);

  useEffect(() => {
    if (flowStep !== "interview") return;
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
    if (smallVideoRef.current && mediaStreamRef.current) {
      smallVideoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isBigScreenCandidate, isVideoOn, flowStep]);

  const speakQuestion = () => {
    if (flowStep !== "interview" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const textToSpeak = `${currentQuestion?.title || ""}. ${currentQuestion?.text || ""}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Adaptive Question Generation Effect
  useEffect(() => {
    if (flowStep !== "interview") return;
    async function prepareAdaptiveQuestion() {
      if (!sessionData?.questions || !currentQuestion) return;

      if (currentQuestion.codeSnippet) {
        setCode(currentQuestion.codeSnippet);
      }

      if (currentQuestion.isAdaptive && !currentQuestion.isAdapted) {
        const prevQ = sessionData.questions[currentIdx - 1];
        const prevAns = answers[currentIdx - 1] || answers[prevQ?.id] || "";
        
        const adaptiveObj = await generateAdaptiveFollowUpQuestion(prevQ, prevAns, sessionData.role);

        const updatedQuestions = [...sessionData.questions];
        updatedQuestions[currentIdx] = {
          ...updatedQuestions[currentIdx],
          title: adaptiveObj.title,
          text: adaptiveObj.text,
          category: adaptiveObj.category,
          difficulty: adaptiveObj.difficulty,
          isAdapted: true,
        };

        setSessionData((prev) => ({ ...prev, questions: updatedQuestions }));
      }
    }

    prepareAdaptiveQuestion();
    speakQuestion();
    setTranscript(answers[currentIdx] || "");
    setTimeLeft(getTimerSeconds());
  }, [currentIdx, sessionData?.questions?.length, flowStep]);

  const handleTextAnswerChange = (val) => {
    setTranscript(val);
    setAnswers(prev => ({ ...prev, [currentIdx]: val }));
  };

  const evaluateCurrentAnswer = async () => {
    const currentAns = isCodingQuestion ? code : transcript;
    if (currentAns.trim() && currentQuestion) {
      try {
        await evaluateAnswerAsync(currentQuestion, currentAns);
      } catch (e) {
        console.warn("Answer evaluation error:", e);
      }
    }
  };

  const handleNextQuestion = () => {
    window.speechSynthesis?.cancel();
    if (isCodingQuestion) {
      setAnswers(prev => ({ ...prev, [currentIdx]: code }));
    }

    if (sessionData) {
      evaluateCurrentAnswer();
    }

    if (currentIdx < (sessionData?.questions?.length || 1) - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      finishInterview();
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      window.speechSynthesis?.cancel();
      setCurrentIdx(prev => prev - 1);
    }
  };

  const finishInterview = async () => {
    window.speechSynthesis?.cancel();
    setFlowStep("evaluating");

    // Simulated evaluation progress tickers
    setEvalProgress(15);
    setEvalStatusText("Evaluating technical accuracy & solution correctness...");

    setTimeout(() => {
      setEvalProgress(45);
      setEvalStatusText("Analyzing logical reasoning, communication & completeness...");
    }, 1200);

    setTimeout(() => {
      setEvalProgress(75);
      setEvalStatusText("Running AI anti-cheating & proctoring integrity audit...");
    }, 2400);

    const finalAnswers = { ...answers, [currentIdx]: isCodingQuestion ? code : transcript };
    const secReport = antiCheating.getSecurityReport();
    const finalData = { ...sessionData, answers: finalAnswers, securityReport: secReport, id: "rpt-" + Date.now() };

    let report = await generateFullInterviewReport(finalData);

    if (resumeFile) {
      try {
        const resumeText = await resumeFile.text();
        const resumeData = await analyzeResume(resumeText);
        report = { ...report, resumeScore: resumeData.score, resumeAnalysis: resumeData };
      } catch (e) {
        console.warn('Resume analysis failed', e);
      }
    }

    setTimeout(() => {
      setEvalProgress(100);
      setEvalStatusText("Generating executive evaluation report & learning roadmap...");
      
      const existingReports = JSON.parse(localStorage.getItem("ai_interview_history") || "[]");
      existingReports.unshift(report);
      localStorage.setItem("ai_interview_history", JSON.stringify(existingReports));

      const updatedStreak = getCalendarStreak(existingReports);
      setStreak(updatedStreak);
      localStorage.setItem('ai_streak', updatedStreak.toString());
      sessionStorage.setItem("latest_ai_report", JSON.stringify(report));

      setTimeout(() => {
        navigate(`/ai-interview/report/${report.id}`);
      }, 800);
    }, 3600);
  };

  const handleQuitWithoutSaving = () => {
    window.speechSynthesis?.cancel();
    sessionStorage.removeItem("current_ai_interview");
    navigate("/ai-interview");
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const res = await executeCode(selectedLang, code);
    setOutput(res);
    setIsRunning(false);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  // Video feed render helpers
  const renderInterviewerFeed = (isSmallBox = false) => {
    if (isRealInterview) {
      return (
        <div className={`w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center relative p-4 ${isSmallBox ? "rounded-xl" : "rounded-3xl"}`}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-xl mb-2">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-center">{interviewerName}</h4>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Feed Connected
          </span>
        </div>
      );
    }
    return (
      <div className={`w-full h-full bg-gradient-to-tr from-primary/20 via-base-100 to-secondary/20 flex flex-col items-center justify-center p-4 relative ${isSmallBox ? "rounded-xl" : "rounded-3xl"}`}>
        <div className="relative mb-3 sm:mb-4">
          <div className={`${isSmallBox ? "w-12 h-12 rounded-xl" : "w-28 h-28 rounded-3xl"} bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-2xl ${isSpeaking ? "animate-bounce" : "animate-pulse"}`}>
            <BotIcon className={isSmallBox ? "w-6 h-6" : "w-14 h-14"} />
          </div>
          {isSpeaking && <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-primary border-2 border-base-100 animate-ping" />}
        </div>
        {!isSmallBox && (
          <>
            <h3 className="text-lg sm:text-xl font-bold text-base-content mb-1">AI Technical Interviewer</h3>
            <p className="text-xs text-success font-semibold flex items-center gap-1.5 bg-success/10 px-3.5 py-1 rounded-full border border-success/30">
              <span className="w-2 h-2 rounded-full bg-success animate-ping" />
              {isSpeaking ? "Asking Question Aloud..." : "Listening & Evaluating Candidate"}
            </p>
          </>
        )}
        {isSmallBox && (
          <span className="text-[10px] font-bold text-base-content text-center leading-tight">AI Interviewer</span>
        )}
      </div>
    );
  };

  const renderCandidateFeed = (isSmallBox = false) => {
    return (
      <div className="w-full h-full relative bg-base-300 flex items-center justify-center overflow-hidden">
        {isVideoOn ? (
          isSmallBox ? (
            <video ref={smallVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-base-content/50 gap-2 p-2 text-center">
            <UserIcon className={isSmallBox ? "w-8 h-8" : "w-16 h-16"} />
            <span className={isSmallBox ? "text-[10px]" : "text-sm font-semibold"}>Candidate Camera Off</span>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // STAGE 1: PRE-INTERVIEW SETUP & CHECKLIST
  // ==========================================
  if (flowStep === "setup") {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-8 flex flex-col justify-center">
          <div className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            {/* Header Title */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold">
                <ShieldCheckIcon className="w-4 h-4" /> System Readiness Verification
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-base-content tracking-tight">
                Pre-Interview Hardware & Rules Setup
              </h1>
              <p className="text-xs sm:text-sm text-base-content/70">
                Target Role: <span className="font-bold text-primary">{sessionData?.role || "Software Engineer"}</span> • Track: {sessionData?.company || "General"}
              </p>
            </div>

            {/* Grid 2 Columns: Hardware Preview (Camera & Mic) + Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left Column: Camera Preview & Mic Audio Meter */}
              <div className="space-y-4">
                <div className="w-full h-56 bg-slate-900 rounded-2xl overflow-hidden relative border-2 border-base-300 shadow-inner flex items-center justify-center">
                  <video
                    ref={(el) => setSetupVideoRef(el)}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isCamWorking && (
                    <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                      <UserIcon className="w-12 h-12 text-slate-500" />
                      <span className="text-xs font-semibold">Camera Access Offline</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 border border-white/20">
                    <VideoIcon className="w-3.5 h-3.5 text-primary" /> Camera Test
                  </div>
                </div>

                {/* Mic Audio Level Visualizer */}
                <div className="bg-base-200/80 p-4 rounded-2xl border border-base-300 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-base-content">
                      <MicIcon className="w-4 h-4 text-primary" /> Microphone Level Meter
                    </span>
                    <span className={isMicWorking ? "text-success" : "text-error"}>
                      {isMicWorking ? "Mic Working" : "Mic Offline"}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-base-300 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-secondary to-success rounded-full transition-all duration-75"
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-base-content/60">Speak aloud to verify mic responsiveness.</p>
                </div>
              </div>

              {/* Right Column: Interview Rules & Instructions */}
              <div className="space-y-4">
                <div className="bg-base-200/50 p-5 rounded-2xl border border-base-300 space-y-3 text-xs">
                  <h3 className="font-extrabold text-sm text-base-content flex items-center gap-2">
                    <InfoIcon className="w-4 h-4 text-primary" /> Mandatory Interview Rules
                  </h3>
                  <ul className="space-y-2 text-base-content/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span><strong>Proctored Session:</strong> Tab switching, exiting fullscreen, or minimizing will trigger security warnings.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span><strong>Hardware Active:</strong> Keep your camera and microphone enabled throughout the session.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span><strong>AI Zero-Score Policy:</strong> Skipped or blank questions automatically receive a score of 0.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span><strong>Adaptive AI Rounds:</strong> Follow-up questions adapt dynamically based on your previous responses.</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={startCountdown}
                  className="w-full btn btn-primary btn-lg rounded-2xl gap-3 text-sm font-extrabold shadow-xl"
                >
                  <PlayIcon className="w-5 h-5" /> Hardware Checked • Start Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STAGE 2: ANIMATED COUNTDOWN SCREEN (3..2..1)
  // ==========================================
  if (flowStep === "countdown") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden">
        <div className="text-center space-y-6 animate-in zoom-in-75 duration-300">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold">
            <SparklesIcon className="w-4 h-4 animate-spin" /> Preparing AI Interview Workspace
          </div>
          
          <div className="relative">
            <div className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-primary via-secondary to-accent animate-bounce">
              {countdownValue > 0 ? countdownValue : "BEGIN!"}
            </div>
          </div>

          <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">
            Full-screen proctoring is enabled. Get ready for Question 1!
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // STAGE 4: AUTOMATED AI EVALUATION LOADER
  // ==========================================
  if (flowStep === "evaluating") {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-base-100 border border-base-300 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center mx-auto shadow-2xl animate-pulse">
            <BotIcon className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-base-content mb-1">Generating AI Performance Report</h2>
            <p className="text-xs text-base-content/70 font-medium">{evalStatusText}</p>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-base-200 h-3 rounded-full overflow-hidden p-0.5 border border-base-300">
              <div
                className="bg-gradient-to-r from-primary via-secondary to-success h-full rounded-full transition-all duration-500"
                style={{ width: `${evalProgress}%` }}
              />
            </div>
            <div className="text-xs font-bold text-primary text-right">{evalProgress}% Complete</div>
          </div>

          <div className="p-4 rounded-2xl bg-base-200/60 border border-base-300 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 text-success font-bold">
              <CheckCircle2Icon className="w-4 h-4" /> 7-Criteria Metric Evaluation
            </div>
            <div className="flex items-center gap-2 text-success font-bold">
              <CheckCircle2Icon className="w-4 h-4" /> Anti-Cheating Security Audit
            </div>
            <div className="flex items-center gap-2 text-success font-bold">
              <CheckCircle2Icon className="w-4 h-4" /> Actionable Learning Roadmap
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STAGE 3: LIVE INTERVIEW SESSION WORKSPACE
  // ==========================================
  return (
    <div className="h-screen bg-base-200 text-base-content flex flex-col font-sans overflow-hidden">
      <Navbar />

      {/* Real-time Anti-Cheating Warning Toast Banner */}
      {antiCheating.activeAlert && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-error text-white font-extrabold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white/40">
            <ShieldAlertIcon className="w-6 h-6 shrink-0 animate-bounce" />
            <div>
              <div className="text-xs uppercase tracking-wider opacity-90">Anti-Cheating Security Alert</div>
              <div className="text-sm">{antiCheating.activeAlert.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="bg-base-100 border-b border-base-300 px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
            <BotIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base-content text-sm flex items-center gap-2">
              {sessionData?.role || "Frontend"} {sessionData?.type === "Mixed" ? "Mixed Adaptive" : "AI"} Interview
            </h1>
            
            {/* Question Progress Tracker Pills */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {sessionData?.questions?.map((_, qIdx) => (
                <div
                  key={qIdx}
                  className={`w-5 h-1.5 rounded-full transition-all ${
                    qIdx === currentIdx
                      ? "bg-primary w-8"
                      : qIdx < currentIdx
                      ? "bg-success"
                      : "bg-base-300"
                  }`}
                  title={`Question ${qIdx + 1}`}
                />
              ))}
              <span className="text-[11px] text-base-content/70 font-semibold ml-2">
                Q{currentIdx + 1} / {sessionData?.questions?.length || 1}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Proctored Anti-Cheating Status Pill */}
          <div
            onClick={antiCheating.enterFullscreen}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all shadow-sm ${
              antiCheating.totalViolations > 0
                ? "bg-error/10 border-error/40 text-error hover:bg-error/20"
                : "bg-success/10 border-success/40 text-success hover:bg-success/20"
            }`}
            title="Click to enter full-screen proctored mode"
          >
            {antiCheating.totalViolations > 0 ? (
              <AlertTriangleIcon className="w-4 h-4 text-error" />
            ) : (
              <LockIcon className="w-4 h-4 text-success" />
            )}
            <span>
              {antiCheating.totalViolations > 0
                ? `${antiCheating.totalViolations} Security Alert${antiCheating.totalViolations > 1 ? "s" : ""}`
                : "Proctored Mode"}
            </span>
          </div>

          {/* Highlighted Timer */}
          <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-xl border-2 text-sm font-mono font-black transition-all shadow-md ${
            isSpeaking
              ? "bg-primary/15 border-primary text-primary shadow-primary/20 animate-pulse"
              : timeLeft <= 15
              ? "bg-error/20 border-error text-error shadow-error/30 animate-bounce"
              : "bg-warning/15 border-warning/60 text-warning"
          }`}>
            <ClockIcon className="w-4 h-4 shrink-0" />
            <span>{isSpeaking ? "AI Speaking..." : formatTime(timeLeft)}</span>
          </div>

          {/* End Interview Button */}
          <button onClick={() => setShowEndModal(true)} className="btn btn-error btn-outline btn-xs gap-1.5 font-bold" title="End or Leave Interview Session">
            <PhoneOffIcon className="w-3.5 h-3.5" /> End Interview
          </button>
        </div>
      </div>

      {/* Main Interview Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden p-4 gap-4">
        {/* LEFT HALF */}
        <div className="lg:col-span-6 h-full relative bg-base-100 border border-base-300 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          {/* MAIN BIG SCREEN VIDEO VIEW */}
          <div className="w-full h-full relative flex items-center justify-center bg-base-300 overflow-hidden">
            {isBigScreenCandidate ? renderCandidateFeed(false) : renderInterviewerFeed(false)}
            <div className="absolute top-4 left-4 bg-base-200/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-base-300 text-xs font-bold text-base-content/90 shadow-md z-10 flex items-center gap-2">
              <VideoIcon className="w-3.5 h-3.5 text-primary" />
              {isBigScreenCandidate ? "Candidate (You) • Main Feed" : `${interviewerName} • Main Feed`}
            </div>

            {/* Face Detector Status Indicator */}
            {antiCheating.faceStatus !== "Normal" && (
              <div className="absolute top-4 right-4 bg-error/90 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-extrabold text-white border border-white/40 shadow-lg flex items-center gap-1.5 animate-pulse">
                <AlertTriangleIcon className="w-3.5 h-3.5" /> {antiCheating.faceStatus}
              </div>
            )}
          </div>

          {/* SMALL FLOATING PIP BOX */}
          <div onClick={() => setIsBigScreenCandidate(prev => !prev)} className="absolute bottom-5 right-5 z-30 w-44 h-32 sm:w-52 sm:h-36 bg-base-100/90 backdrop-blur-lg rounded-2xl border-2 border-primary/70 shadow-2xl overflow-hidden cursor-pointer hover:scale-105 hover:border-primary transition-all duration-300 group" title="Click to Swap Big / Small Video Screen">
            {isBigScreenCandidate ? renderInterviewerFeed(true) : renderCandidateFeed(true)}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-1.5 pointer-events-none">
              <span className="bg-base-200/90 backdrop-blur-md text-[9px] font-bold px-2.5 py-0.5 rounded-md text-base-content border border-base-300 flex items-center gap-1 shadow">
                <Maximize2Icon className="w-2.5 h-2.5 text-primary" /> Tap to Swap Screen
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT HALF */}
        <div className="lg:col-span-6 h-full flex flex-col gap-4 overflow-y-auto">
          {/* TOP QUESTION CARD WITH DYNAMIC STAGE BADGES */}
          <div className="bg-base-100 border border-base-300 rounded-3xl p-5 shadow-xl flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary badge-sm font-bold">
                  {currentQuestion?.category || "General"}
                </span>
                
                {/* Mixed Mode Round Stage Badges */}
                {currentQuestion?.questionType === "hr" && (
                  <span className="badge badge-info badge-sm font-bold gap-1">
                    <UserCheckIcon className="w-3 h-3" /> HR Round
                  </span>
                )}
                {currentQuestion?.questionType === "technical" && (
                  <span className="badge badge-secondary badge-sm font-bold gap-1">
                    <CpuIcon className="w-3 h-3" /> Technical Core
                  </span>
                )}
                {currentQuestion?.questionType === "coding" && (
                  <span className="badge badge-accent badge-sm font-bold gap-1">
                    <Code2Icon className="w-3 h-3" /> Coding Challenge
                  </span>
                )}
                {currentQuestion?.questionType === "system_design" && (
                  <span className="badge badge-warning badge-sm font-bold gap-1">
                    <LayersIcon className="w-3 h-3" /> System Architecture
                  </span>
                )}
                {currentQuestion?.isAdaptive && (
                  <span className="badge badge-error text-white badge-sm font-bold gap-1 animate-pulse">
                    <SparklesIcon className="w-3 h-3" /> Adaptive AI Probe
                  </span>
                )}
              </div>

              <button onClick={speakQuestion} className={`btn btn-xs gap-1.5 rounded-lg border transition-all ${isSpeaking ? "bg-primary text-primary-content border-primary animate-pulse" : "bg-base-200 border-base-300 text-base-content/80 hover:bg-base-300"}`} title="Listen to Question Aloud">
                {isSpeaking ? <Volume2Icon className="w-3.5 h-3.5" /> : <VolumeXIcon className="w-3.5 h-3.5" />}
                {isSpeaking ? "Speaking..." : "Read Question"}
              </button>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-base-content leading-snug mb-1">
                {currentQuestion?.title || "Question"}
              </h2>
              <p className="text-base-content/80 text-xs sm:text-sm leading-relaxed">
                {currentQuestion?.text || currentQuestion?.title}
              </p>
            </div>
          </div>

          {/* DYNAMIC RESPONSE AREA */}
          <div className="flex-1 bg-base-100 border border-base-300 rounded-3xl p-5 shadow-xl flex flex-col overflow-hidden min-h-[300px]">
            {isCodingQuestion ? (
              <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-base-content/70 flex items-center gap-1.5">
                    <Code2Icon className="w-4 h-4 text-accent" /> Live Code Workspace
                  </span>
                  <div className="text-xs font-semibold text-base-content/60">
                    Language: <span className="font-bold text-primary uppercase">{selectedLang}</span>
                  </div>
                </div>
                <div className="flex-1 border border-base-300 rounded-xl overflow-hidden">
                  <CodeEditorPanel
                    selectedLanguage={selectedLang}
                    code={code}
                    isRunning={isRunning}
                    onLanguageChange={e => setSelectedLang(e.target.value)}
                    onCodeChange={setCode}
                    onRunCode={handleRunCode}
                  />
                </div>
                <div className="h-32"><OutputPanel output={output} /></div>
                
                {/* Navigation Bar */}
                <div className="flex items-center justify-between bg-base-200/80 p-3 rounded-xl border border-base-300 shrink-0">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentIdx === 0}
                    className="btn btn-outline btn-xs gap-1 font-bold disabled:opacity-40"
                  >
                    <ArrowLeftIcon className="w-3.5 h-3.5" /> Previous
                  </button>

                  <button onClick={() => setShowEndModal(true)} className="btn btn-ghost btn-xs text-error font-semibold">End Session</button>

                  <button onClick={handleNextQuestion} className="btn btn-primary btn-sm px-5 gap-2 text-xs font-bold shadow-lg">
                    {currentIdx < (sessionData?.questions?.length || 1) - 1 ? "Next Question" : "Submit Interview"} <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base-content text-sm sm:text-base">Your Verbal Response</h3>
                  <button
                    onClick={() => setIsVoiceEnabled(prev => !prev)}
                    className={`btn btn-xs sm:btn-sm gap-2 font-bold ${
                      isVoiceEnabled
                        ? (isRecording ? "btn-primary animate-pulse" : "btn-primary")
                        : "btn-outline border-base-300 text-base-content/60"
                    }`}
                  >
                    {isVoiceEnabled ? <MicIcon className="w-4 h-4" /> : <MicOffIcon className="w-4 h-4" />}
                    {isVoiceEnabled ? (isRecording ? "Listening (Voice On)..." : "Voice Answer On") : "Voice Answer Off"}
                  </button>
                </div>
                <textarea
                  value={transcript}
                  onChange={e => handleTextAnswerChange(e.target.value)}
                  placeholder="Type your response or speak answer aloud..."
                  className="w-full flex-1 bg-base-200/60 border border-base-300 rounded-2xl p-4 text-base-content font-sans text-xs sm:text-sm focus:outline-none focus:border-primary resize-none shadow-inner"
                />

                {/* Navigation Bar */}
                <div className="flex items-center justify-between bg-base-200/80 p-3 rounded-xl border border-base-300 shrink-0">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentIdx === 0}
                    className="btn btn-outline btn-xs gap-1 font-bold disabled:opacity-40"
                  >
                    <ArrowLeftIcon className="w-3.5 h-3.5" /> Previous
                  </button>

                  <div className="text-[11px] text-base-content/70 hidden sm:block">
                    Words: <span className="text-base-content font-bold">{transcript.split(/\s+/).filter(Boolean).length}</span>
                  </div>

                  <button onClick={handleNextQuestion} className="btn btn-primary btn-sm px-5 gap-2 text-xs font-bold shadow-lg">
                    {currentIdx < (sessionData?.questions?.length || 1) - 1 ? "Next Question" : "Submit Interview"} <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* End Interview Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-base-100 max-w-md w-full rounded-2xl p-6 shadow-2xl border border-error/30 text-center">
            <div className="size-12 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-3"><PhoneOffIcon className="size-6" /></div>
            <h3 className="text-xl font-bold text-base-content mb-2">End AI Interview Early?</h3>
            <p className="text-xs text-base-content/70 mb-6">You can finish now to generate your performance report on questions answered so far, or exit directly to the interview hub.</p>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => { setShowEndModal(false); finishInterview(); }} className="btn btn-primary w-full gap-2 rounded-xl text-xs font-bold"><CheckCircle2Icon className="size-4" /> Finish & View AI Report</button>
              <button onClick={handleQuitWithoutSaving} className="btn btn-outline btn-error w-full rounded-xl text-xs font-semibold">Exit Without Saving</button>
              <button onClick={() => setShowEndModal(false)} className="btn btn-ghost btn-sm text-xs text-base-content/60 mt-1">Cancel & Resume Interview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIInterviewSessionPage;
