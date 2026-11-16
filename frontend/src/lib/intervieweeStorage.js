// src/lib/intervieweeStorage.js
import { getStoredInterviews, saveInterview } from "./interviewerStorage";

/**
 * Checks if an interview is currently joinable by the candidate.
 * Returns true if:
 * 1. Interview status is explicitly set to "live" by interviewer.
 * 2. Current time falls within scheduled date/time and duration window (+/- 15 mins padding).
 */
export function isInterviewJoinable(interview) {
  if (!interview) return false;
  if (interview.status === "completed" || interview.status === "cancelled") return false;
  if (interview.status === "live") return true;

  try {
    const scheduledDateTime = new Date(`${interview.scheduledDate}T${interview.scheduledTime}`);
    const now = new Date();
    
    // Allow joining 15 mins before scheduled time until duration finishes + 15 mins buffer
    const startTimeWindow = new Date(scheduledDateTime.getTime() - 15 * 60 * 1000);
    const endTimeWindow = new Date(scheduledDateTime.getTime() + (interview.durationMinutes + 15) * 60 * 1000);

    return now >= startTimeWindow && now <= endTimeWindow;
  } catch (e) {
    return false;
  }
}

/**
 * Calculates the exact time lock status and countdown string for a scheduled interview.
 */
export function getInterviewLockStatus(interview) {
  if (!interview) return { state: "EXPIRED", message: "Invalid Interview", label: "Expired", canJoin: false };
  
  if (interview.status === "completed") {
    return { state: "COMPLETED", message: "Interview Completed", label: "Completed", canJoin: false };
  }
  if (interview.status === "cancelled") {
    return { state: "CANCELLED", message: "Interview Cancelled", label: "Cancelled", canJoin: false };
  }
  if (interview.status === "live") {
    return { state: "UNLOCKED", message: "🔴 Live Now — Click to Join", label: "Live Room Open", canJoin: true };
  }

  try {
    const scheduledDateTime = new Date(`${interview.scheduledDate}T${interview.scheduledTime}`);
    const now = new Date();
    const durationMs = (interview.durationMinutes || 60) * 60 * 1000;
    const endDateTime = new Date(scheduledDateTime.getTime() + durationMs);

    if (now > endDateTime) {
      return { state: "EXPIRED", message: "Interview Time Window Passed", label: "Missed / Expired", canJoin: false };
    }

    const startWindow = new Date(scheduledDateTime.getTime() - 15 * 60 * 1000);

    if (now >= startWindow && now <= endDateTime) {
      return { state: "UNLOCKED", message: "Interview Window Active — Join Room", label: "Room Open", canJoin: true };
    }

    // Time is in the future — calculate countdown
    const diffMs = scheduledDateTime.getTime() - now.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);

    let countdownStr = "";
    if (days > 0) {
      countdownStr = `${days}d ${hours % 24}h ${minutes}m`;
    } else if (hours > 0) {
      countdownStr = `${hours}h ${minutes}m`;
    } else {
      countdownStr = `${minutes} mins`;
    }

    return {
      state: "LOCKED",
      message: `Time-Locked — Opens in ${countdownStr}`,
      countdownStr,
      scheduledText: `${interview.scheduledDate} at ${interview.scheduledTime}`,
      label: `Locked (${countdownStr})`,
      canJoin: false,
    };
  } catch (e) {
    return { state: "LOCKED", message: "Scheduled", label: "Locked", canJoin: false };
  }
}

/**
 * Gets candidate assigned interviews filtered by email or returns all if email matches candidate list.
 */
export function getCandidateAssignedInterviews(candidateEmail) {
  const allInterviews = getStoredInterviews();
  if (!candidateEmail) return allInterviews;
  
  const matches = allInterviews.filter(
    (item) => item.candidateEmail?.toLowerCase() === candidateEmail.toLowerCase()
  );
  
  return matches.length > 0 ? matches : allInterviews;
}
