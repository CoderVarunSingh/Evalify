import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const HomePage = lazy(() => import("./pages/HomePage"));
const RoleSelectionPage = lazy(() => import("./pages/RoleSelectionPage"));
const RoleLoginPage = lazy(() => import("./pages/RoleLoginPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const InterviewerDashboardPage = lazy(() => import("./pages/InterviewerDashboardPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const ProblemsPage = lazy(() => import("./pages/ProblemsPage"));
const SessionPage = lazy(() => import("./pages/SessionPage"));
const AIInterviewHubPage = lazy(() => import("./pages/AIInterviewHubPage"));
const AIInterviewSessionPage = lazy(() => import("./pages/AIInterviewSessionPage"));
const AIReportPage = lazy(() => import("./pages/AIReportPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const CodingAnalyticsPage = lazy(() => import("./pages/CodingAnalyticsPage"));
const ResumeAnalyzerPage = lazy(() => import("./pages/ResumeAnalyzerPage"));
const CompanyPrepPage = lazy(() => import("./pages/CompanyPrepPage"));
const PracticeDashboardPage = lazy(() => import("./pages/PracticeDashboardPage"));
const IntervieweePortalPage = lazy(() => import("./pages/IntervieweePortalPage"));

import ProtectedRoute from "./components/ProtectedRoute";
import { Loader2Icon } from "lucide-react";

function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <Loader2Icon className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-medium tracking-wide text-slate-400 animate-pulse">
        Loading Evalify...
      </p>
    </div>
  );
}

function App() {
  return (
    <>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Role Selection Page */}
        <Route path="/select-role" element={<RoleSelectionPage />} />

        {/* Separate Login Routes for Each Role (with /* for Clerk sub-routes like /factor-one, /verify) */}
        <Route path="/login/interviewee/*" element={<RoleLoginPage defaultRole="interviewee" />} />
        <Route path="/login/interviewer/*" element={<RoleLoginPage defaultRole="interviewer" />} />
        <Route path="/login/admin/*" element={<RoleLoginPage defaultRole="admin" />} />
        <Route path="/login/:role/*" element={<RoleLoginPage />} />

        {/* Clerk Auth Routes */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Role-Specific Protected Dashboards */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviewee-portal"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <IntervieweePortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate-portal"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <IntervieweePortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-interviews"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <IntervieweePortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <PracticeDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice-dashboard"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <PracticeDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviewer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <InterviewerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviewer"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <InterviewerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviewer-portal"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <InterviewerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Candidate-Specific Protected Feature Routes */}
        <Route
          path="/problems"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <ProblemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/problem/:id"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <ProblemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session/:id"
          element={
            <ProtectedRoute allowedRoles={["interviewee", "interviewer"]}>
              <SessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-interview"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <AIInterviewHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-interview/session"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <AIInterviewSessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-interview/report/:id"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <AIReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding-analytics"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <CodingAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-analyzer"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <ResumeAnalyzerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-prep"
          element={
            <ProtectedRoute allowedRoles={["interviewee"]}>
              <CompanyPrepPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Suspense>
      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
