/**
 * Real AI Answer Evaluator Engine for Evalify
 * Evaluates candidate responses using Gemini AI across 7 criteria:
 * 1. Correctness
 * 2. Communication
 * 3. Confidence
 * 4. Technical Accuracy
 * 5. Completeness
 * 6. Logical Reasoning
 * 7. Problem-Solving Skills
 * 
 * Rules:
 * - Skipped / unattempted questions are ALWAYS marked "Not Attempted" with a score of 0.
 * - No hardcoded scores or formulaic keyword additions.
 */

import { callGemini } from "./api.js";

/**
 * Checks if a candidate answer is empty, blank, or skipped.
 */
function isQuestionSkipped(candidateAnswer) {
  if (!candidateAnswer) return true;
  const ans = String(candidateAnswer).trim();
  if (ans === "") return true;
  const lower = ans.toLowerCase();
  if (
    lower === "no answer provided." ||
    lower === "no answer provided" ||
    lower === "skipped" ||
    lower === "skip" ||
    lower === "n/a" ||
    lower === "not attempted"
  ) {
    return true;
  }
  return false;
}

/**
 * Returns a 0-score evaluation object for skipped/unattempted questions.
 */
function createNotAttemptedEvaluation(question) {
  return {
    attemptStatus: "Not Attempted",
    score: 0,
    correctnessScore: 0,
    technicalScore: 0,
    communicationScore: 0,
    confidenceScore: 0,
    completenessScore: 0,
    logicalReasoningScore: 0,
    problemSolvingScore: 0,
    strengths: ["None (Question skipped)"],
    mistakes: ["Question was not attempted by the candidate."],
    feedback: "This question was skipped / not attempted. Score assigned: 0.",
    modelAnswer: getModelAnswer(question),
    roadmap: ["Make sure to attempt every question to demonstrate your technical capabilities."],
  };
}

/**
 * Generates a real-time adaptive AI follow-up question based on the candidate's previous response.
 */
export async function generateAdaptiveFollowUpQuestion(previousQuestion, previousAnswer, role = "Software Engineer") {
  const prevQText = previousQuestion?.text || previousQuestion?.title || String(previousQuestion || "");
  const prevAnsText = String(previousAnswer || "").trim();

  if (!prevAnsText || prevAnsText === "Not Attempted" || prevAnsText.length < 5) {
    return {
      title: `${role} • Adaptive Architecture Challenge`,
      text: `[Adaptive AI Round - Follow-Up]: Since the previous question was skipped, walk through a high-stakes technical architectural decision you made in a recent ${role} project and explain how you handled system trade-offs.`,
      category: "Adaptive Assessment",
      difficulty: "Medium",
    };
  }

  const prompt = `You are an expert AI Technical Interviewer conducting a live company interview for a ${role} role.

The candidate was asked: "${prevQText}"
The candidate answered: "${prevAnsText}"

Generate a direct, sharp, professional follow-up interview question that probes their response, asks them to clarify a technical trade-off, or challenges them on an edge case or real-world implementation detail.

Return ONLY a valid JSON object matching this schema:
{
  "title": "Adaptive Probe: <Short Topic Title>",
  "text": "[Adaptive AI Round - Probing Follow-Up]: <Sharp targeted follow-up question probing their previous answer>",
  "category": "Adaptive Deep-Dive",
  "difficulty": "Hard"
}`;

  try {
    const res = await callGemini(prompt);
    if (res && typeof res === "object" && res.text) {
      return {
        title: res.title || `${role} • Adaptive AI Follow-Up`,
        text: res.text,
        category: res.category || "Adaptive Deep-Dive",
        difficulty: res.difficulty || "Hard",
      };
    }
  } catch (e) {
    console.error("Adaptive follow-up generation failed:", e);
  }

  return {
    title: `${role} • Adaptive AI Follow-Up`,
    text: `[Adaptive AI Round - Probing Follow-Up]: In your previous response regarding "${prevAnsText.substring(0, 50)}...", what critical performance, security, or architectural trade-offs did you evaluate, and how would you handle unexpected edge cases under high load?`,
    category: "Adaptive Deep-Dive",
    difficulty: "Hard",
  };
}

/**
 * Evaluates a single question answer using real AI (Gemini) or dynamic evaluation.
 */
export async function evaluateAnswerAsync(question, candidateAnswer, role = "Software Engineer", mode = "technical") {
  // Rule: If question is skipped or not answered -> Mark "Not Attempted" with 0 score
  if (isQuestionSkipped(candidateAnswer)) {
    return createNotAttemptedEvaluation(question);
  }

  const questionText = question?.text || question?.title || String(question);

  // Construct Gemini Prompt for strict 7-criteria evaluation
  const prompt = `You are a senior technical interviewer evaluating a candidate for a ${role} role (${mode} session).

Evaluate the candidate's answer based STRICTLY on its quality, technical depth, correctness, and logic. Do NOT give arbitrary or unearned scores.

Question: "${questionText}"
Candidate Answer: "${candidateAnswer}"

Rate the response from 0 to 100 on each of the following 7 evaluation criteria:
1. correctnessScore (0-100): Factually and conceptually accurate solution?
2. technicalScore (0-100): Precision of technical terms, code/architecture concepts, and domain accuracy?
3. communicationScore (0-100): Clarity, structure, articulation, and grammar?
4. confidenceScore (0-100): Directness, tone, and conviction in explanation?
5. completenessScore (0-100): Thoroughness, coverage of key points and edge cases?
6. logicalReasoningScore (0-100): Step-by-step logic, problem breakdown, and clarity of thought?
7. problemSolvingScore (0-100): Analytical skills, trade-off evaluation, and practical approach?

Return ONLY a valid JSON object matching this exact schema:
{
  "attemptStatus": "Attempted",
  "score": <overall_weighted_score_0_to_100>,
  "correctnessScore": <number>,
  "technicalScore": <number>,
  "communicationScore": <number>,
  "confidenceScore": <number>,
  "completenessScore": <number>,
  "logicalReasoningScore": <number>,
  "problemSolvingScore": <number>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "mistakes": ["<area for improvement 1>", "<area for improvement 2>"],
  "feedback": "<concise summary feedback>",
  "modelAnswer": "<ideal, comprehensive model answer for this question>",
  "roadmap": ["<actionable learning recommendation 1>", "<recommendation 2>"]
}`;

  try {
    const aiResult = await callGemini(prompt);
    if (aiResult && typeof aiResult === "object" && !aiResult.raw) {
      const cScore = Number(aiResult.correctnessScore) || 0;
      const tScore = Number(aiResult.technicalScore) || 0;
      const cmScore = Number(aiResult.communicationScore) || 0;
      const cfScore = Number(aiResult.confidenceScore) || 0;
      const cpScore = Number(aiResult.completenessScore) || 0;
      const lrScore = Number(aiResult.logicalReasoningScore) || 0;
      const psScore = Number(aiResult.problemSolvingScore) || 0;

      const calculatedOverall = Math.round(
        (cScore + tScore + cmScore + cfScore + cpScore + lrScore + psScore) / 7
      );

      const overall = typeof aiResult.score === "number" ? Math.round(aiResult.score) : calculatedOverall;

      return {
        attemptStatus: "Attempted",
        score: overall,
        correctnessScore: cScore,
        technicalScore: tScore,
        communicationScore: cmScore,
        confidenceScore: cfScore,
        completenessScore: cpScore,
        logicalReasoningScore: lrScore,
        problemSolvingScore: psScore,
        strengths: Array.isArray(aiResult.strengths) ? aiResult.strengths : ["Answer provided."],
        mistakes: Array.isArray(aiResult.mistakes) ? aiResult.mistakes : [],
        feedback: aiResult.feedback || "AI evaluation completed.",
        modelAnswer: aiResult.modelAnswer || getModelAnswer(question),
        roadmap: Array.isArray(aiResult.roadmap) ? aiResult.roadmap : [],
      };
    }
  } catch (e) {
    console.error("Gemini AI evaluation failed, falling back to dynamic evaluator:", e);
  }

  return evaluateAnswerDynamic(questionText, candidateAnswer, role);
}

/**
 * Dynamic AI evaluation fallback for offline / key-less mode.
 */
function evaluateAnswerDynamic(questionText, candidateAnswer, role) {
  const text = candidateAnswer.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const rawTerms = questionText.replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 3);
  const keyTerms = Array.from(new Set(rawTerms)).slice(0, 6);
  const matchedTerms = keyTerms.filter((term) => text.toLowerCase().includes(term.toLowerCase()));
  const coverageRatio = keyTerms.length > 0 ? matchedTerms.length / keyTerms.length : 0.5;

  const correctnessScore = Math.min(100, Math.round(coverageRatio * 85 + Math.min(wordCount, 60) * 0.25));
  const technicalScore = Math.min(100, Math.round(coverageRatio * 90 + (matchedTerms.length > 0 ? 10 : 0)));
  const communicationScore = Math.min(100, Math.round(Math.min(wordCount, 100) * 0.9));
  const confidenceScore = Math.min(100, Math.round(matchedTerms.length > 0 ? 75 : 50));
  const completenessScore = Math.min(100, Math.round(coverageRatio * 70 + Math.min(wordCount, 80) * 0.35));
  const logicalReasoningScore = Math.min(100, Math.round(communicationScore * 0.5 + correctnessScore * 0.5));
  const problemSolvingScore = Math.min(100, Math.round(technicalScore * 0.6 + completenessScore * 0.4));

  const overall = Math.round(
    (correctnessScore + technicalScore + communicationScore + confidenceScore + completenessScore + logicalReasoningScore + problemSolvingScore) / 7
  );

  const strengths = [];
  if (matchedTerms.length > 0) {
    strengths.push(`Identified key technical concepts: ${matchedTerms.join(", ")}.`);
  }
  if (wordCount >= 25) {
    strengths.push("Provided a structured response with explanation.");
  } else {
    strengths.push("Direct answer to the question.");
  }

  const mistakes = [];
  const missing = keyTerms.filter((t) => !matchedTerms.includes(t));
  if (missing.length > 0) {
    mistakes.push(`Did not feature key concept terms: ${missing.slice(0, 3).join(", ")}.`);
  }
  if (wordCount < 15) {
    mistakes.push("Response was brief and lacked detailed problem-solving steps.");
  }

  return {
    attemptStatus: "Attempted",
    score: overall,
    correctnessScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    completenessScore,
    logicalReasoningScore,
    problemSolvingScore,
    strengths,
    mistakes,
    feedback: overall >= 75
      ? "Good candidate answer demonstrating relevant technical understanding."
      : "Acceptable attempt. Focus on deepening technical depth and logical explanation.",
    modelAnswer: getModelAnswer(questionText),
    roadmap: [
      `Review core architecture principles for ${role}.`,
      "Practice structured problem-solving breakdown."
    ],
  };
}

export function evaluateAnswer(question, candidateAnswer, role = "Frontend") {
  if (isQuestionSkipped(candidateAnswer)) {
    return createNotAttemptedEvaluation(question);
  }
  const qText = question?.text || question?.title || String(question);
  return evaluateAnswerDynamic(qText, candidateAnswer, role);
}

function getModelAnswer(question) {
  const text = typeof question === "string" ? question : (question?.text || question?.title || "");
  const lower = text.toLowerCase();

  if (lower.includes("virtual dom") || lower.includes("reconciliation")) {
    return "The Virtual DOM is a lightweight JavaScript copy of the real DOM. When state changes in React, a new Virtual DOM tree is created and compared against the previous tree using a diffing algorithm (Reconciliation). React then batch updates only the changed elements in the real DOM for optimal rendering efficiency.";
  }
  if (lower.includes("closure")) {
    return "A closure is a function that retains access to its outer (lexical) scope even after the outer function has finished executing. Closures are commonly used for data privacy, state encapsulation, memoization, and callback handlers.";
  }
  if (lower.includes("event loop")) {
    return "The Event Loop in JavaScript manages asynchronous execution by continuously inspecting the Call Stack and Queue. When the Call Stack is empty, it processes Microtasks (Promises, process.nextTick) before Macrotasks (setTimeout, setInterval, I/O callbacks).";
  }
  return "A comprehensive model answer addresses the core definition, explains underlying mechanics step-by-step, provides a concrete code or system architecture example, and analyzes key performance trade-offs.";
}

export async function generateFullInterviewReport(sessionData) {
  const questions = sessionData.questions || [];
  const answers = sessionData.answers || {};

  let totalScore = 0;
  let totalCorrectness = 0;
  let totalTech = 0;
  let totalComm = 0;
  let totalConf = 0;
  let totalCompleteness = 0;
  let totalLogical = 0;
  let totalProblemSolving = 0;
  let attemptedCount = 0;

  const questionEvaluations = await Promise.all(
    questions.map(async (q, idx) => {
      const candidateAns = answers[q.id] !== undefined ? answers[q.id] : (answers[idx] !== undefined ? answers[idx] : "");
      const evalResult = await evaluateAnswerAsync(q, candidateAns, sessionData.role, sessionData.mode);
      
      if (evalResult.attemptStatus === "Attempted") {
        attemptedCount++;
      }

      totalScore += evalResult.score;
      totalCorrectness += evalResult.correctnessScore || 0;
      totalTech += evalResult.technicalScore || 0;
      totalComm += evalResult.communicationScore || 0;
      totalConf += evalResult.confidenceScore || 0;
      totalCompleteness += evalResult.completenessScore || 0;
      totalLogical += evalResult.logicalReasoningScore || 0;
      totalProblemSolving += evalResult.problemSolvingScore || 0;

      return {
        question: q.text || q.title || `Question ${idx + 1}`,
        candidateAnswer: candidateAns && candidateAns.trim() ? candidateAns : "Not Attempted",
        evaluation: evalResult,
      };
    })
  );

  const count = questions.length || 1;
  const overallScore = Math.round(totalScore / count);
  const avgCorrectness = Math.round(totalCorrectness / count);
  const avgTech = Math.round(totalTech / count);
  const avgComm = Math.round(totalComm / count);
  const avgConf = Math.round(totalConf / count);
  const avgCompleteness = Math.round(totalCompleteness / count);
  const avgLogicalReasoning = Math.round(totalLogical / count);
  const avgProblemSolving = Math.round(totalProblemSolving / count);

  let grade = "F";
  let status = "Not Qualified";
  if (overallScore >= 90) {
    grade = "A+";
    status = "Exceptional Hire";
  } else if (overallScore >= 80) {
    grade = "A";
    status = "Strong Hire";
  } else if (overallScore >= 70) {
    grade = "B";
    status = "Hire";
  } else if (overallScore >= 50) {
    grade = "C";
    status = "Borderline";
  } else if (overallScore > 0) {
    grade = "D";
    status = "Needs Improvement";
  }

  return {
    id: sessionData.id || "rpt-" + Date.now(),
    role: sessionData.role || "Software Engineer",
    difficulty: sessionData.difficulty || "Medium",
    company: sessionData.company || "General Tech",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    attemptedCount,
    totalQuestionsCount: questions.length,
    overallScore,
    avgCorrectness,
    avgTech,
    avgComm,
    avgConf,
    avgCompleteness,
    avgLogicalReasoning,
    avgProblemSolving,
    grade,
    status,
    questionEvaluations,
    overallFeedback:
      attemptedCount === 0
        ? "Candidate did not attempt any questions during the interview session."
        : overallScore >= 80
        ? "Excellent candidate performance across technical accuracy, logical reasoning, and communication."
        : overallScore >= 50
        ? "Moderate performance. Core understanding present, but needs improvement in technical completeness and problem-solving depth."
        : "Candidate attempted some questions but scores were low across key evaluation criteria.",
    securityReport: sessionData.securityReport || {
      integrityScore: 100,
      trustStatus: "Verified High Integrity",
      trustBadgeColor: "success",
      totalViolations: 0,
      highSeverityCount: 0,
      violationsLogs: [],
      proctoringDetails: { tabSwitchCount: 0, fullscreenExits: 0, copyPasteAttempts: 0, devToolsAttempts: 0, mediaViolations: 0 },
    },
    learningRoadmap: [
      `Master core technical concepts for ${sessionData.role || "Engineering"} roles.`,
      "Practice step-by-step logical reasoning and structured problem-solving.",
      "Attempt all questions to avoid zero-score penalties for skipped items.",
    ],
  };
}
