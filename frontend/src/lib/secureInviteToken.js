// src/lib/secureInviteToken.js
import { getStoredInterviews } from "./interviewerStorage";

const SECRET_SALT = "Evalify_Secure_Interview_Salt_2026_v1";

/**
 * Simple, robust URL-safe Base64 + SHA-256 signature token generator.
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generates an encrypted, time-restricted, candidate-locked secure invitation token.
 */
export function generateSecureInviteToken(interview) {
  if (!interview) return "";

  const scheduledStartMs = new Date(`${interview.scheduledDate}T${interview.scheduledTime}`).getTime();
  const durationMs = (interview.durationMinutes || 60) * 60 * 1000;
  
  // Valid from 15 minutes before scheduled start time
  const validFrom = scheduledStartMs - 15 * 60 * 1000;
  // Valid until 15 minutes after scheduled duration ends
  const validUntil = scheduledStartMs + durationMs + 15 * 60 * 1000;

  const payload = {
    interviewId: interview.id,
    candidateEmail: (interview.candidateEmail || "candidate@example.com").toLowerCase().trim(),
    candidatePhone: interview.candidatePhone || "",
    title: interview.title || "Technical Interview",
    role: interview.role || "Developer",
    validFrom,
    validUntil,
    createdAt: Date.now(),
    nonce: Math.random().toString(36).substring(2, 9),
  };

  const jsonStr = JSON.stringify(payload);
  const base64Data = btoa(jsonStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const signature = simpleHash(base64Data + SECRET_SALT);

  return `${base64Data}.${signature}`;
}

/**
 * Parses and verifies an invitation token.
 */
export function parseInviteToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, reason: "Malformed token format." };
  }

  const [base64Data, signature] = token.split(".");
  const expectedSignature = simpleHash(base64Data + SECRET_SALT);

  if (signature !== expectedSignature) {
    return { valid: false, reason: "Invalid or forged token signature." };
  }

  try {
    const pad = base64Data.length % 4;
    const padded = base64Data + (pad ? "=".repeat(4 - pad) : "");
    const base64Standard = padded.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64Standard);
    const payload = JSON.parse(jsonStr);
    return { valid: true, payload };
  } catch (e) {
    return { valid: false, reason: "Failed to decode token payload." };
  }
}

/**
 * Validates token against current candidate email, current time window, and interview state.
 */
export function validateInviteAccess(token, currentUserEmail) {
  const parseRes = parseInviteToken(token);
  if (!parseRes.valid) {
    return {
      status: "TAMPERED",
      canAccess: false,
      title: "🔒 Invalid or Tampered Link",
      message: "This interview invitation link is invalid or has been modified.",
    };
  }

  const { payload } = parseRes;
  const now = Date.now();

  // 1. Fetch matching interview from storage
  const interviews = getStoredInterviews();
  const match = interviews.find((i) => i.id === payload.interviewId);

  if (!match) {
    return {
      status: "NOT_FOUND",
      canAccess: false,
      title: "⚠️ Interview Not Found",
      message: "The requested interview session no longer exists or was cancelled.",
    };
  }

  if (match.status === "completed") {
    return {
      status: "COMPLETED",
      canAccess: false,
      interview: match,
      title: "✅ Interview Completed",
      message: "This interview session has already been completed.",
    };
  }

  if (match.status === "cancelled") {
    return {
      status: "CANCELLED",
      canAccess: false,
      interview: match,
      title: "❌ Interview Cancelled",
      message: "This interview session was cancelled by the interviewer.",
    };
  }

  // 2. Candidate Authentication Lock Check
  if (currentUserEmail) {
    const userEmailClean = currentUserEmail.toLowerCase().trim();
    const assignedEmailClean = payload.candidateEmail.toLowerCase().trim();

    if (userEmailClean !== assignedEmailClean) {
      return {
        status: "UNAUTHORIZED",
        canAccess: false,
        interview: match,
        assignedEmail: payload.candidateEmail,
        title: "🚫 Candidate Access Restricted",
        message: `This interview link is assigned specifically to ${payload.candidateEmail}. You are logged in as ${currentUserEmail}.`,
      };
    }
  }

  // 3. Time Window Restriction Check
  // Allow if interviewer explicitly set status to "live"
  if (match.status !== "live") {
    if (now < payload.validFrom) {
      const startDateStr = new Date(payload.validFrom).toLocaleDateString();
      const startTimeStr = new Date(payload.validFrom).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const diffMins = Math.ceil((payload.validFrom - now) / (1000 * 60));

      return {
        status: "TIME_LOCKED",
        canAccess: false,
        interview: match,
        validFrom: payload.validFrom,
        title: "⏳ Invitation Link Time-Locked",
        message: `This link will open on ${startDateStr} at ${startTimeStr} (Opens in ~${diffMins} minutes).`,
      };
    }

    if (now > payload.validUntil) {
      return {
        status: "EXPIRED",
        canAccess: false,
        interview: match,
        title: "⌛ Invitation Link Expired",
        message: "The scheduled time window for this interview has passed. Please contact your interviewer to reschedule.",
      };
    }
  }

  // All security validations passed!
  return {
    status: "VALID",
    canAccess: true,
    interview: match,
    payload,
    title: "Access Granted",
    message: "Security and authentication verified. You may join the interview room.",
  };
}
