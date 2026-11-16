import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { LoaderIcon } from "lucide-react";
import axiosInstance from "../lib/axios";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();

  const [checking, setChecking] = useState(true);
  const [serverRole, setServerRole] = useState(null);

  useEffect(() => {
    async function fetchRole() {
      if (!isLoaded) return;

      if (isSignedIn && user) {
        try {
          const token = await getToken();
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const { data } = await axiosInstance.get("/users/me");
          setServerRole(data.user?.role || null);
        } catch (err) {
          console.warn("ProtectedRoute: Server role check fallback:", err.message);
        }
      }
      setChecking(false);
    }

    fetchRole();
  }, [isLoaded, isSignedIn, user, getToken]);

  // Determine user role (Server DB -> Clerk Metadata -> Session Storage -> Default)
  const effectiveRole =
    serverRole ||
    user?.publicMetadata?.role ||
    user?.unsafeMetadata?.role ||
    sessionStorage.getItem("user_role") ||
    "interviewee";

  // Update sessionStorage with the resolved effective role
  useEffect(() => {
    if (effectiveRole && (isSignedIn || sessionStorage.getItem("authenticated") === "true")) {
      sessionStorage.setItem("user_role", effectiveRole);
    }
  }, [effectiveRole, isSignedIn]);

  if (!isLoaded || checking) {
    return (
      <div className="min-h-screen bg-base-300 flex items-center justify-center">
        <LoaderIcon className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  // Determine authentication status (Clerk or Session Auth)
  const isAuthenticated = isSignedIn || sessionStorage.getItem("authenticated") === "true";

  if (!isAuthenticated) {
    const defaultLoginPath = allowedRoles?.length > 0 ? `/login/${allowedRoles[0]}` : "/sign-in";
    return <Navigate to={defaultLoginPath} replace />;
  }

  // Role authorization check – if the user's effective role is not permitted, redirect to role login
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("user_role");
    return <Navigate to={`/login/${allowedRoles[0]}`} replace />;
  }

  return children;
}
