import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// Ensure a modal root exists in index.html or fallback to body
const modalRoot = document.getElementById("modal-root") || document.body;

/**
 * Simple role selection modal used at app start.
 * Persists the chosen role in localStorage under "selected_role".
 * Offers Interviewee, Interviewer, and Administrator roles.
 */
export default function RoleSelectionModal({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  // Show modal only if no role stored
  useEffect(() => {
    const stored = localStorage.getItem("selected_role");
    if (!stored) {
      setIsOpen(true);
    } else {
      onSelect(stored);
    }
  }, [onSelect]);

  const handleSelect = (role) => {
    localStorage.setItem("selected_role", role);
    setIsOpen(false);
    onSelect(role);
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Select Role</h2>
        <p style={styles.text}>Choose your role for the session.</p>
        <button style={styles.button} onClick={() => handleSelect("interviewee")}>Interviewee</button>
        <button style={styles.button} onClick={() => handleSelect("interviewer")}>Interviewer</button>
        <button style={styles.button} onClick={() => handleSelect("admin")}>Administrator</button>
      </div>
    </div>,
    modalRoot
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "340px",
    width: "90%",
    textAlign: "center",
    color: "#222",
    boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
    animation: "fadeIn 0.3s ease-out",
  },
  title: { margin: "0 0 0.5rem", fontFamily: "'Inter', sans-serif" },
  text: { marginBottom: "1.5rem", fontFamily: "'Inter', sans-serif" },
  button: {
    padding: "0.6rem 1.2rem",
    fontSize: "1rem",
    fontWeight: "600",
    background: "#ff6f91",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    margin: "0.4rem",
    transition: "transform 0.2s",
  },
};

export const fadeInKeyframes = `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
