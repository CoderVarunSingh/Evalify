import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Code2Icon,
  UserCheckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-hot-toast";

export default function RoleLoginPage({ defaultRole }) {
  const params = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  // Extract role from URL param or defaultRole prop
  const role = params.role || defaultRole || "interviewee";
  
  const [isSignUp, setIsSignUp] = useState(false);

  // Persist selected role for the auth callback (used by AuthCallbackPage)
  useEffect(() => {
    sessionStorage.setItem("signup_role", role);
  }, [role]);

  // Branding configuration per role
  const getRoleBranding = () => {
    switch (role) {
      case "interviewer":
        return {
          title: "Interviewer Portal",
          subtitle: "Sign in with Email & Password to manage candidate interviews.",
          icon: <UserCheckIcon className="size-6 text-secondary" />,
          badgeClass: "badge-secondary",
        };
      case "admin":
        return {
          title: "Administrator Portal",
          subtitle: "Sign in with Email & Password to manage problem sets & settings.",
          icon: <ShieldCheckIcon className="size-6 text-accent" />,
          badgeClass: "badge-accent",
        };
      default:
        return {
          title: "Interviewee Portal",
          subtitle: "Sign in with Email & Password to practice coding & AI interviews.",
          icon: <Code2Icon className="size-6 text-primary" />,
          badgeClass: "badge-primary",
        };
    }
  };

  const branding = getRoleBranding();

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2">
        <Link to="/select-role" className="flex items-center gap-2 text-sm font-semibold text-base-content/70 hover:text-primary transition-colors">
          <ArrowLeftIcon className="size-4" /> Back to Role Selection
        </Link>
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200 text-base-content/80 hover:text-base-content transition-all shadow-sm"
            title="Toggle Light / Dark Mode"
          >
            {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </button>
          <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <div className="size-8 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
              <SparklesIcon className="size-5 text-white" />
            </div>
            <span className="font-black text-lg bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
              Evalify
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md w-full mx-auto my-auto py-4 flex flex-col items-center">
        {/* Portal Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-base-100 rounded-full shadow-sm border border-base-300 text-xs font-bold uppercase tracking-wider mb-2">
            {branding.icon}
            <span>{branding.title}</span>
          </div>
          <p className="text-xs text-base-content/60 max-w-xs mx-auto">
            {branding.subtitle}
          </p>
        </div>

        {/* Password-Based Clerk Authentication Components */}
        <div className="w-full flex justify-center">
          {isSignUp ? (
            <SignUp
              routing="path"
              path={`/login/${role}`}
              signInUrl={`/login/${role}`}
              fallbackRedirectUrl="/auth/callback"
              forceRedirectUrl="/auth/callback"
              appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
              onSignUp={() => toast.success("Account created successfully!")}
              onError={(err) => {
                const msg = err?.errors?.[0]?.longMessage || err?.message || "Sign up error";
                toast.error(msg);
              }}
            />
          ) : (
            <SignIn
              routing="path"
              path={`/login/${role}`}
              signUpUrl={`/login/${role}`}
              fallbackRedirectUrl="/auth/callback"
              forceRedirectUrl="/auth/callback"
              appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
              onSignIn={() => toast.success("Signed in successfully!")}
              onError={(err) => {
                const msg = err?.errors?.[0]?.longMessage || err?.message || "Sign in error";
                toast.error(msg);
              }}
            />
          )}
        </div>

        {/* Switch Mode Toggle */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-semibold text-primary hover:underline bg-base-100/80 px-3 py-1.5 rounded-full border border-base-300 shadow-sm"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Register"}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-base-content/50 py-2">
        © {new Date().getFullYear()} Evalify • Password-Based Authentication
      </footer>
    </div>
  );
}
