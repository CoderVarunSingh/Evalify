import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  BotIcon,
  BarChart3Icon,
  Code2Icon,
  FileTextIcon,
  Building2Icon,
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  UserCheckIcon,
  LogOutIcon,
  Trash2Icon,
  ShieldIcon,
  ChevronDownIcon,
  CheckCircle2Icon,
  FlameIcon,
} from "lucide-react";
import { UserButton, useUser, useAuth } from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import axiosInstance from "../lib/axios";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, setThemeName } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  
  // Read role from session state or Clerk metadata
  const initialRole = sessionStorage.getItem("user_role") || "interviewee";
  const [role, setRole] = useState(initialRole);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const dropdownRef = useRef(null);

  const isSessionAuth = sessionStorage.getItem("authenticated") === "true";
  const isLoggedIn = isSignedIn || isSessionAuth;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchUserRole() {
      if (!isLoaded || !isSignedIn || !user) return;
      try {
        const token = await getToken();
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const { data } = await axiosInstance.get("/users/me");
        if (data.user?.role) {
          setRole(data.user.role);
          sessionStorage.setItem("user_role", data.user.role);
        }
      } catch (err) {
        console.warn("Navbar: Could not fetch role from server", err.message);
      }
    }

    fetchUserRole();
  }, [isLoaded, isSignedIn, user, getToken]);

  const handleSignOut = () => {
    sessionStorage.clear();
    setDropdownOpen(false);
    navigate("/");
  };

  const handleDeleteAccount = () => {
    sessionStorage.clear();
    localStorage.clear();
    setConfirmDeleteOpen(false);
    setDropdownOpen(false);
    alert("Account data erased.");
    navigate("/");
  };

  const dashboardPath = role === "interviewer" ? "/interviewer-dashboard" : role === "admin" ? "/admin" : "/dashboard";

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Dynamic Navigation Links Tailored Per Role
  const getNavLinks = () => {
    if (role === "interviewer") {
      return [
        { to: "/interviewer-dashboard", icon: <LayoutDashboardIcon className="size-4" />, label: "Interviewer Portal" },
      ];
    }
    if (role === "admin") {
      return [
        { to: "/admin", icon: <ShieldCheckIcon className="size-4" />, label: "Admin Portal" },
      ];
    }
    return [
      { to: "/dashboard", icon: <LayoutDashboardIcon className="size-4" />, label: "Dashboard" },
      { to: "/interviewee-portal", icon: <UserCheckIcon className="size-4" />, label: "My Interviews" },
      { to: "/ai-interview", icon: <BotIcon className="size-4" />, label: "AI Interview" },
      { to: "/analytics", icon: <BarChart3Icon className="size-4" />, label: "Analytics" },
      { to: "/resume-analyzer", icon: <FileTextIcon className="size-4" />, label: "Resume" },
      { to: "/company-prep", icon: <Building2Icon className="size-4" />, label: "Companies" },
    ];
  };

  const navLinks = getNavLinks();

  const getPermissions = () => {
    switch (role) {
      case "interviewer":
        return [
          "Create & Host Live Coding Rooms",
          "Schedule Technical Interviews",
          "Evaluate Candidate Submissions",
        ];
      case "admin":
        return [
          "Manage Problem Sets & Content",
          "Manage User Roles & Access",
          "Access System Analytics & Logs",
        ];
      default:
        return [
          "Practice Coding Problems",
          "Attempt AI Mock Interviews",
          "Access Resume & Company Prep",
        ];
    }
  };

  const roleBadgeStyle =
    role === "interviewer"
      ? "bg-secondary/15 text-secondary border-secondary/30"
      : role === "admin"
      ? "bg-accent/15 text-accent border-accent/30"
      : "bg-primary/15 text-primary border-primary/30";

  return (
    <nav className="bg-base-100/90 backdrop-blur-md border-b border-base-300 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to={dashboardPath}
          className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200 shrink-0"
        >
          <div className="size-9 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
            <SparklesIcon className="size-5 text-white" />
          </div>
          <span className="font-black text-lg bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider hidden sm:block">
            Evalify
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-sm font-medium
                ${isActive(link.to)
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Active Role Indicator Pill */}
          {isLoggedIn && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${roleBadgeStyle}`}>
              {role === "interviewer" ? (
                <UserCheckIcon className="size-3.5" />
              ) : role === "admin" ? (
                <ShieldCheckIcon className="size-3.5" />
              ) : (
                <UserIcon className="size-3.5" />
              )}
              <span>{role}</span>
            </div>
          )}

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={theme}
              onChange={(e) => setThemeName(e.target.value)}
              className="select select-xs bg-base-200 border border-base-300 text-base-content font-bold text-[11px] rounded-lg focus:outline-none cursor-pointer"
              title="Select UI Theme"
            >
              <option value="dim">🌙 Dim Slate</option>
              <option value="dracula">🧛 Dracula</option>
              <option value="black">🖤 OLED Black</option>
              <option value="night">🌃 Night Navy</option>
              <option value="corporate">☀️ Light</option>
            </select>
          </div>

          {/* User Profile / Floating Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : isSessionAuth ? (
              <div>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full bg-base-200 border border-base-300 hover:bg-base-300 transition-all"
                  title="Profile & Settings"
                >
                  <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    <UserIcon className="size-4" />
                  </div>
                  <ChevronDownIcon className="size-3.5 text-base-content/60 mr-1" />
                </button>

                {/* Floating Dropdown Popover */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-base-100 rounded-2xl shadow-2xl border border-base-300 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Header */}
                    <div className="px-4 pb-3 border-b border-base-200">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
                          <UserIcon className="size-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm truncate">
                            {user?.fullName || user?.firstName || `${role.toUpperCase()} User`}
                          </p>
                          <p className="text-xs text-base-content/60 truncate">
                            {user?.primaryEmailAddress?.emailAddress || `${role}@evalify.dev`}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${roleBadgeStyle}`}>
                          Role: {role}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Permissions Section */}
                    <div className="px-2 py-2 border-b border-base-200">
                      <button
                        onClick={() => setShowPermissions(!showPermissions)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-base-content/80 hover:bg-base-200 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldIcon className="size-3.5 text-primary" /> Role Permissions
                        </span>
                        <ChevronDownIcon className={`size-3.5 transition-transform ${showPermissions ? "rotate-180" : ""}`} />
                      </button>

                      {showPermissions && (
                        <div className="mt-1 px-3 py-2 bg-base-200/60 rounded-xl space-y-1.5 text-xs text-base-content/80 animate-in fade-in">
                          {getPermissions().map((perm, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2Icon className="size-3.5 text-success shrink-0 mt-0.5" />
                              <span>{perm}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-2 pt-2 space-y-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setConfirmDeleteOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-error hover:bg-error/10 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <Trash2Icon className="size-3.5" /> Delete Account Data
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-base-content/80 hover:bg-base-200 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <LogOutIcon className="size-3.5 text-primary" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/" className="btn btn-primary btn-sm">
                Select Role
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-base-200 text-base-content/70"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-base-100 border-t border-base-300 px-4 py-3 space-y-2">
          {isLoggedIn && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-base-200 rounded-lg text-xs font-bold uppercase text-primary mb-2">
              <span>Active Role:</span>
              <span className="badge badge-primary badge-sm">{role}</span>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive(link.to)
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200 text-base-content/70"
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}

          {isSessionAuth && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-error hover:bg-base-200 transition-all"
            >
              <LogOutIcon className="w-4 h-4" /> Sign Out
            </button>
          )}
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-base-100 max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-error/30 text-center">
            <div className="size-12 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2Icon className="size-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Delete Account Data?</h3>
            <p className="text-xs text-base-content/70 mb-6">
              This will erase your active session data and profile record.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                className="btn btn-outline flex-1 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-error flex-1 rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
