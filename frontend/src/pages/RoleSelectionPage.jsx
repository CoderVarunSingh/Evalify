import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserCheckIcon, ShieldCheckIcon, Code2Icon, SparklesIcon, ArrowRightIcon, ZapIcon, CheckIcon, SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSelectRole = (role) => {
    sessionStorage.setItem("signup_role", role);
    navigate(`/login/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col justify-between p-6">
      {/* Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-200">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
            <SparklesIcon className="size-6 text-white" />
          </div>
          <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
            Evalify
          </span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200 text-base-content/80 hover:text-base-content transition-all shadow-sm"
          title="Toggle Light / Dark Mode"
        >
          {theme === "dark" ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8">
        <div className="text-center mb-12">
          <div className="badge badge-primary badge-lg mb-3">
            <ZapIcon className="size-4 mr-1" /> Role-First Authentication
          </div>
          <h1 className="text-4xl sm:text-6xl font-black mb-4">
            Select Your <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Portal Role</span>
          </h1>
          <p className="text-lg text-base-content/70 max-w-lg mx-auto">
            Choose your role to access your dedicated login flow, custom workspace, and role-based features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Interviewee Card */}
          <div 
            onClick={() => handleSelectRole("interviewee")}
            className="card bg-base-100 border-2 border-primary/30 hover:border-primary cursor-pointer transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl group"
          >
            <div className="card-body items-center text-center p-8">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Code2Icon className="size-8 text-primary group-hover:text-white" />
              </div>
              <h2 className="card-title text-2xl font-bold mb-1">Interviewee</h2>
              <div className="badge badge-primary badge-sm mb-4">Candidate Portal</div>
              <p className="text-sm text-base-content/70 mb-6 min-h-[60px]">
                Practice algorithm problems, attempt AI mock interviews, and pair program with interviewers.
              </p>

              <div className="w-full space-y-2 text-xs text-left mb-6 bg-base-200/50 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 text-success" />
                  <span>Problem Solving & Submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 text-success" />
                  <span>AI Mock Technical Interviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 text-success" />
                  <span>Resume & Company Prep</span>
                </div>
              </div>

              <button className="btn btn-primary w-full gap-2 mt-auto">
                Login as Interviewee
                <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Interviewer Card */}
          <div 
            onClick={() => handleSelectRole("interviewer")}
            className="card bg-base-100 border-2 border-secondary/30 hover:border-secondary cursor-pointer transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl group"
          >
            <div className="card-body items-center text-center p-8">
              <div className="size-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                <UserCheckIcon className="size-8 text-secondary group-hover:text-white" />
              </div>
              <h2 className="card-title text-2xl font-bold mb-1">Interviewer</h2>
              <div className="badge badge-secondary badge-sm mb-4">Host Portal</div>
              <p className="text-sm text-base-content/70 mb-6 min-h-[60px]">
                Schedule candidate assessments, host live video coding rooms, and evaluate submissions.
              </p>

              <div className="w-full space-y-2 text-xs text-left mb-6 bg-base-200/50 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 text-success" />
                  <span>Live Video & Code Rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 text-success" />
                  <span>Candidate Scheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 text-success" />
                  <span>Technical Evaluation Notes</span>
                </div>
              </div>

              <button className="btn btn-secondary w-full gap-2 mt-auto">
                Login as Interviewer
                <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Admin Card */}
          <div 
            onClick={() => handleSelectRole("admin")}
            className="card bg-base-100 border-2 border-accent/30 hover:border-accent cursor-pointer transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl group"
          >
            <div className="card-body items-center text-center p-8">
              <div className="size-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                <ShieldCheckIcon className="size-8 text-accent group-hover:text-white" />
              </div>
              <h2 className="card-title text-2xl font-bold mb-1">Administrator</h2>
              <div className="badge badge-accent badge-sm mb-4">Admin Portal</div>
              <p className="text-sm text-base-content/70 mb-6 min-h-[60px]">
                Manage platform problem sets, system configurations, user accounts, and analytics.
              </p>

              <div className="w-full space-y-2 text-xs text-left mb-6 bg-base-200/50 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 text-success" />
                  <span>Problem Set & Test Case Mgmt</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 text-success" />
                  <span>User Access & Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 text-success" />
                  <span>Platform System Metrics</span>
                </div>
              </div>

              <button className="btn btn-accent w-full gap-2 mt-auto">
                Login as Administrator
                <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-base-content/50 py-4">
        © {new Date().getFullYear()} Evalify. All rights reserved.
      </footer>
    </div>
  );
}
