import React from "react";
import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { Link } from "react-router-dom";
import { SparklesIcon, SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function SignUpPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col items-center justify-center p-4 relative">
      {/* Theme Toggle Top Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2.5 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200 text-base-content/80 hover:text-base-content transition-all shadow-sm"
        title="Toggle Light / Dark Mode"
      >
        {theme === "dark" ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
      </button>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mb-6 hover:scale-105 transition-transform duration-200">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
          <SparklesIcon className="size-6 text-white" />
        </div>
        <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
          Evalify
        </span>
      </Link>

      <div className="w-full max-w-md bg-base-100 p-8 rounded-2xl shadow-2xl border border-base-300 flex flex-col items-center">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/auth/callback"
          forceRedirectUrl="/auth/callback"
          appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
        />
      </div>
    </div>
  );
}
