import React, { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { LoaderIcon } from "lucide-react";
import axiosInstance from "../lib/axios";

/**
 * AuthCallbackPage
 *
 * Strict Clerk Authentication Callback:
 * - Only proceeds if Clerk successfully authenticated the user (isSignedIn === true).
 * - If authentication failed or user is not logged in via Clerk, redirects to Home Page.
 * - Syncs role with backend MongoDB and redirects to authorized dashboard.
 */
export default function AuthCallbackPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (hasRun.current) return;

    // SECURITY CHECK: If user is not signed in via Clerk, deny access immediately
    if (!isSignedIn || !user) {
      sessionStorage.removeItem("authenticated");
      sessionStorage.removeItem("user_role");
      navigate("/", { replace: true });
      return;
    }

    hasRun.current = true;

    async function handleAuth() {
      let assignedRole = sessionStorage.getItem("signup_role") || "interviewee";

      try {
        const token = await getToken();
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        try {
          // Check if user already exists in DB
          const { data } = await axiosInstance.get("/users/me");
          assignedRole = data.user.role;
        } catch (fetchErr) {
          // New user signup — register in DB with chosen role
          const { data } = await axiosInstance.post("/users/register", {
            role: assignedRole,
            name: user.fullName || user.firstName || "User",
            email: user.primaryEmailAddress?.emailAddress || "",
            imageUrl: user.imageUrl || "",
          });
          assignedRole = data.user.role;
        }
      } catch (err) {
        console.warn("AuthCallback: MongoDB sync error:", err.message);
      }

      // Mark authenticated only after Clerk verification succeeds
      sessionStorage.setItem("authenticated", "true");
      sessionStorage.setItem("user_role", assignedRole);
      sessionStorage.removeItem("signup_role");

      // Redirect to authorized role dashboard
      if (assignedRole === "interviewer") {
        navigate("/interviewer-dashboard", { replace: true });
      } else if (assignedRole === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }

    handleAuth();
  }, [isLoaded, isSignedIn, user, getToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoaderIcon className="size-12 animate-spin text-primary" />
        <p className="text-base-content/70 text-sm font-medium">Verifying Clerk credentials & workspace…</p>
      </div>
    </div>
  );
}
