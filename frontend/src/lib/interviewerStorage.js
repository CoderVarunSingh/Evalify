// src/lib/interviewerStorage.js
import { problemsData } from "../data/problemsData";

const STORAGE_KEY = "iq_interviewer_interviews";
const CANDIDATES_KEY = "iq_interviewer_candidates";

// Initial default candidates
export const DEFAULT_CANDIDATES = [
  { id: "cand-1", name: "Alex Rivera", email: "alex.rivera@example.com", role: "Frontend Engineer", experience: "4 years", phone: "+1 (555) 234-5678" },
  { id: "cand-2", name: "Jordan Chen", email: "jordan.chen@example.com", role: "Full Stack Developer", experience: "5 years", phone: "+1 (555) 876-5432" },
  { id: "cand-3", name: "Priya Sharma", email: "priya.sharma@example.com", role: "Backend Systems Engineer", experience: "6 years", phone: "+91 98765-43210" },
  { id: "cand-4", name: "Marcus Vance", email: "marcus.vance@example.com", role: "AI/ML Engineer", experience: "3 years", phone: "+1 (555) 345-6789" },
  { id: "cand-5", name: "Sophia Lee", email: "sophia.lee@example.com", role: "Senior DevOps Specialist", experience: "7 years", phone: "+1 (555) 901-2345" },
];

// Initial default interviews
export const DEFAULT_INTERVIEWS = [
  {
    id: "intv-101",
    title: "Senior Full Stack Technical Round",
    role: "Full Stack Developer",
    candidateId: "cand-2",
    candidateName: "Jordan Chen",
    candidateEmail: "jordan.chen@example.com",
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // tomorrow
    scheduledTime: "14:00",
    durationMinutes: 60,
    status: "scheduled", // scheduled | live | completed | cancelled
    customQuestions: [
      { id: "cq-1", question: "Explain how you handle React state hydration in Next.js Server Components.", category: "System Architecture", points: 10 },
      { id: "cq-2", question: "Describe a scenario where you optimized a slow PostgreSQL database query.", category: "Database & Backend", points: 10 },
    ],
    assignedProblems: [
      { id: "prob-001", title: "Two Sum", difficulty: "Easy", category: "Array" },
      { id: "prob-003", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: "String" },
    ],
    aiEvaluationConfig: {
      enabled: true,
      strictness: "moderate",
      weights: {
        codeCorrectness: 35,
        problemSolving: 25,
        systemDesign: 20,
        communication: 20,
      },
      autoFeedback: true,
    },
    antiCheatConfig: {
      tabSwitchLimit: 3,
      webcamRequired: true,
      audioMonitoring: true,
      copyPasteDisabled: true,
      fullScreenRequired: true,
      devToolsBlock: true,
    },
    liveMonitoring: {
      candidateStatus: "active", // active | flagged | offline | completed
      lastSeen: "Just now",
      currentProblemIndex: 0,
      violations: [],
      liveScore: 88,
      codeSnapshot: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}",
    },
    report: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "intv-102",
    title: "Frontend Engineering Assessment",
    role: "Frontend Engineer",
    candidateId: "cand-1",
    candidateName: "Alex Rivera",
    candidateEmail: "alex.rivera@example.com",
    scheduledDate: new Date().toISOString().split("T")[0], // today
    scheduledTime: "16:30",
    durationMinutes: 45,
    status: "live",
    customQuestions: [
      { id: "cq-3", question: "What is the difference between useLayoutEffect and useEffect in React?", category: "React Core", points: 10 },
    ],
    assignedProblems: [
      { id: "prob-005", title: "Valid Parentheses", difficulty: "Easy", category: "Stack" },
    ],
    aiEvaluationConfig: {
      enabled: true,
      strictness: "strict",
      weights: {
        codeCorrectness: 40,
        problemSolving: 30,
        systemDesign: 15,
        communication: 15,
      },
      autoFeedback: true,
    },
    antiCheatConfig: {
      tabSwitchLimit: 2,
      webcamRequired: true,
      audioMonitoring: true,
      copyPasteDisabled: true,
      fullScreenRequired: true,
      devToolsBlock: true,
    },
    liveMonitoring: {
      candidateStatus: "flagged",
      lastSeen: "10 sec ago",
      currentProblemIndex: 0,
      violations: [
        { id: "v-1", type: "Tab Switch", message: "Candidate switched browser tab", timestamp: "16:35:12", severity: "High" },
        { id: "v-2", type: "Paste Event", message: "Pasted 120 chars into code editor", timestamp: "16:38:40", severity: "Medium" },
      ],
      liveScore: 74,
      codeSnapshot: "function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (let char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}",
    },
    report: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "intv-103",
    title: "Backend Distributed Systems Interview",
    role: "Backend Systems Engineer",
    candidateId: "cand-3",
    candidateName: "Priya Sharma",
    candidateEmail: "priya.sharma@example.com",
    scheduledDate: "2026-10-02",
    scheduledTime: "10:00",
    durationMinutes: 60,
    status: "completed",
    customQuestions: [
      { id: "cq-4", question: "How do you handle Redis cache stampede in high-throughput APIs?", category: "Caching & Systems", points: 15 },
    ],
    assignedProblems: [
      { id: "prob-002", title: "Add Two Numbers", difficulty: "Medium", category: "Linked List" },
      { id: "prob-004", title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Binary Search" },
    ],
    aiEvaluationConfig: {
      enabled: true,
      strictness: "strict",
      weights: {
        codeCorrectness: 35,
        problemSolving: 30,
        systemDesign: 20,
        communication: 15,
      },
      autoFeedback: true,
    },
    antiCheatConfig: {
      tabSwitchLimit: 3,
      webcamRequired: true,
      audioMonitoring: true,
      copyPasteDisabled: true,
      fullScreenRequired: true,
      devToolsBlock: true,
    },
    liveMonitoring: {
      candidateStatus: "completed",
      lastSeen: "Completed",
      violations: [],
      liveScore: 92,
      codeSnapshot: "// Completed Solution submitted successfully",
    },
    report: {
      overallScore: 92,
      decision: "Strong Hire",
      summary: "Priya demonstrated exceptional problem solving and deep understanding of distributed systems and caching mechanisms.",
      correctnessScore: 95,
      problemSolvingScore: 90,
      systemDesignScore: 94,
      communicationScore: 88,
      antiCheatIntegrity: 100,
      violationsCount: 0,
      feedback: "Top candidate for the Backend Systems position. Clean code structure, efficient algorithm choices, and clear technical communication.",
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

// Helper functions for LocalStorage management
export function getStoredInterviews() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INTERVIEWS));
      return DEFAULT_INTERVIEWS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.warn("Failed to parse interviews from localStorage", e);
    return DEFAULT_INTERVIEWS;
  }
}

export function saveInterview(interview) {
  const current = getStoredInterviews();
  const existsIndex = current.findIndex((item) => item.id === interview.id);
  let updated;
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = interview;
  } else {
    updated = [interview, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save interview to localStorage", e);
  }
  return updated;
}

export function deleteInterview(id) {
  const current = getStoredInterviews();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to delete interview", e);
  }
  return updated;
}

export function getStoredCandidates() {
  try {
    const data = localStorage.getItem(CANDIDATES_KEY);
    if (!data) {
      localStorage.setItem(CANDIDATES_KEY, JSON.stringify(DEFAULT_CANDIDATES));
      return DEFAULT_CANDIDATES;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_CANDIDATES;
  }
}

export function saveCandidate(candidate) {
  const current = getStoredCandidates();
  const updated = [candidate, ...current];
  try {
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}
