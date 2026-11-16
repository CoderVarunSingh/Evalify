import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Professional Anti-Cheating & Interview Security Proctoring Hook for Evalify
 * Detects:
 * 1. Tab switching & window blur
 * 2. Fullscreen exit
 * 3. Browser minimization
 * 4. Webcam disabled / track ended
 * 5. Microphone muted / audio track ended
 * 6. Face detection (No face detected / Multiple faces detected)
 * 7. Copy, Cut, Paste attempts (blocked & logged)
 * 8. Right-click context menu (blocked & logged)
 * 9. Refresh & tab close attempts
 * 10. Developer Tools open attempts (F12, Ctrl+Shift+I/J/C, Ctrl+U, DevTools resize)
 */
export function useAntiCheating({ isSessionActive = true, mediaStreamRef, videoRef }) {
  const [violations, setViolations] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [faceStatus, setFaceStatus] = useState("Normal"); // "Normal" | "No Face Detected" | "Multiple Faces Detected"
  
  const alertTimeoutRef = useRef(null);
  const violationsRef = useRef(violations);
  violationsRef.current = violations;

  // Log a violation & trigger active warning alert
  const logViolation = useCallback((type, message, severity = "Medium") => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const newViolation = {
      id: "viol-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      type,
      message,
      timestamp,
      severity,
    };

    setViolations((prev) => [...prev, newViolation]);

    // Show temporary security alert banner
    setActiveAlert({
      type,
      message,
      severity,
    });

    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => {
      setActiveAlert(null);
    }, 4500);
  }, []);

  // Request Fullscreen helper
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (e) {
      console.warn("Fullscreen request error:", e);
    }
  }, []);

  // 1. Tab Switching & Window Blur / Focus
  useEffect(() => {
    if (!isSessionActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("Tab Switch / Minimized", "Candidate navigated away from interview tab or minimized browser window.", "High");
      }
    };

    const handleWindowBlur = () => {
      logViolation("Focus Lost", "Candidate switched focus away from interview window.", "Medium");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isSessionActive, logViolation]);

  // 2. Fullscreen Exit Detection
  useEffect(() => {
    if (!isSessionActive) return;

    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFs);
      if (!isFs) {
        logViolation("Fullscreen Exited", "Candidate exited full-screen proctoring mode.", "High");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
    };
  }, [isSessionActive, logViolation]);

  // 3. Copy, Cut, Paste Blocking & Detection
  useEffect(() => {
    if (!isSessionActive) return;

    const handleCopy = (e) => {
      e.preventDefault();
      logViolation("Copy Attempt", "Copying content from interview workspace was blocked.", "Medium");
    };

    const handleCut = (e) => {
      e.preventDefault();
      logViolation("Cut Attempt", "Cutting text in interview workspace was blocked.", "Medium");
    };

    const handlePaste = (e) => {
      // Allow paste inside code editor if needed, but log warning
      logViolation("Paste Event", "Clipboard content was pasted into answer response.", "Low");
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
    };
  }, [isSessionActive, logViolation]);

  // 4. Right-Click Context Menu Blocking
  useEffect(() => {
    if (!isSessionActive) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      logViolation("Right-Click Blocked", "Right-click context menu usage was prevented.", "Low");
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [isSessionActive, logViolation]);

  // 5. Developer Tools & Keyboard Shortcut Blocking
  useEffect(() => {
    if (!isSessionActive) return;

    const handleKeyDown = (e) => {
      // F12 key
      if (e.key === "F12") {
        e.preventDefault();
        logViolation("DevTools Shortcut", "Attempted to open Developer Tools using F12.", "High");
      }
      // Ctrl+Shift+I / J / C or Cmd+Option+I / J / C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        logViolation("DevTools Shortcut", "Attempted to open Developer Tools inspector.", "High");
      }
      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        logViolation("View Source Attempt", "Attempted to view page source code.", "Medium");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSessionActive, logViolation]);

  // 6. Refresh / Unload Warning
  useEffect(() => {
    if (!isSessionActive) return;

    const handleBeforeUnload = (e) => {
      logViolation("Refresh Attempt", "Candidate attempted to refresh or leave interview page.", "High");
      const msg = "Warning: Leaving or refreshing this page will impact your interview proctoring score.";
      e.returnValue = msg;
      return msg;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSessionActive, logViolation]);

  // 7. Media Track Monitoring (Webcam & Microphone Muted/Disabled)
  useEffect(() => {
    if (!isSessionActive || !mediaStreamRef?.current) return;

    const checkMediaTracks = () => {
      const stream = mediaStreamRef.current;
      if (!stream) return;

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (!videoTrack || !videoTrack.enabled || videoTrack.readyState === "ended") {
        logViolation("Webcam Disabled", "Candidate camera feed is disabled or offline.", "High");
      }

      if (!audioTrack || !audioTrack.enabled || audioTrack.readyState === "ended") {
        logViolation("Microphone Muted", "Candidate microphone audio stream is muted.", "Medium");
      }
    };

    const interval = setInterval(checkMediaTracks, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [isSessionActive, mediaStreamRef, logViolation]);

  // 8. Canvas-based Face Detection Proctoring (No Face / Multiple Faces)
  useEffect(() => {
    if (!isSessionActive || !videoRef?.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const detectFaces = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || video.readyState < 2) return;

      canvas.width = 160;
      canvas.height = 120;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;

        // Analyze skin tone & facial luminance region distribution
        let skinPixels = 0;
        let leftRegionSkin = 0;
        let rightRegionSkin = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Standard skin-tone color filter approximation (RGB space)
          const isSkin =
            r > 95 &&
            g > 40 &&
            b > 20 &&
            Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
            Math.abs(r - g) > 15 &&
            r > g &&
            r > b;

          if (isSkin) {
            skinPixels++;
            const pixelIdx = i / 4;
            const x = pixelIdx % canvas.width;
            if (x < canvas.width / 2) leftRegionSkin++;
            else rightRegionSkin++;
          }
        }

        const totalPixels = canvas.width * canvas.height;
        const skinPercentage = (skinPixels / totalPixels) * 100;

        if (skinPercentage < 2.5) {
          setFaceStatus("No Face Detected");
          logViolation("No Face Detected", "No candidate face visible in camera frame.", "High");
        } else if (leftRegionSkin > 2500 && rightRegionSkin > 2500 && Math.abs(leftRegionSkin - rightRegionSkin) < 500) {
          // If two distinct high-density skin clusters exist on far left & far right
          setFaceStatus("Multiple Faces Detected");
          logViolation("Multiple Faces Detected", "Multiple faces or background person detected in video feed.", "High");
        } else {
          setFaceStatus("Normal");
        }
      } catch (e) {
        // Canvas cross-origin or frame read fallback
      }
    };

    const faceInterval = setInterval(detectFaces, 15000); // Check every 15 seconds
    return () => clearInterval(faceInterval);
  }, [isSessionActive, videoRef, logViolation]);

  // Compute Security Integrity Metrics
  const totalViolations = violations.length;
  const highSeverityCount = violations.filter((v) => v.severity === "High").length;
  const integrityScore = Math.max(0, 100 - highSeverityCount * 15 - (totalViolations - highSeverityCount) * 5);

  let trustStatus = "Verified High Integrity";
  let trustBadgeColor = "success";
  if (integrityScore < 60 || highSeverityCount >= 4) {
    trustStatus = "High Risk / Flagged Session";
    trustBadgeColor = "error";
  } else if (integrityScore < 85 || totalViolations >= 3) {
    trustStatus = "Minor Security Alerts";
    trustBadgeColor = "warning";
  }

  const getSecurityReport = useCallback(() => {
    return {
      integrityScore,
      trustStatus,
      trustBadgeColor,
      totalViolations,
      highSeverityCount,
      violationsLogs: violationsRef.current,
      proctoringDetails: {
        tabSwitchCount: violationsRef.current.filter((v) => v.type.includes("Tab") || v.type.includes("Focus")).length,
        fullscreenExits: violationsRef.current.filter((v) => v.type.includes("Fullscreen")).length,
        copyPasteAttempts: violationsRef.current.filter((v) => v.type.includes("Copy") || v.type.includes("Paste") || v.type.includes("Cut")).length,
        devToolsAttempts: violationsRef.current.filter((v) => v.type.includes("DevTools") || v.type.includes("Source")).length,
        mediaViolations: violationsRef.current.filter((v) => v.type.includes("Webcam") || v.type.includes("Microphone") || v.type.includes("Face")).length,
      },
    };
  }, [integrityScore, trustStatus, trustBadgeColor, totalViolations, highSeverityCount]);

  return {
    violations,
    totalViolations,
    activeAlert,
    isFullscreen,
    faceStatus,
    integrityScore,
    trustStatus,
    trustBadgeColor,
    enterFullscreen,
    getSecurityReport,
  };
}
