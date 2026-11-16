import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isKeyValid = Boolean(PUBLISHABLE_KEY);
  if (!isKeyValid) {
    console.error('Clerk publishable key missing. Check .env');
  }


class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    // Generic error fallback for any rendering errors
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 text-error">Something went wrong.</h2>
            <p className="text-base-content/70">Please try refreshing the page or contact support.</p>
          </div>
        </div>
      );
    }

    // No errors – render children
    return this.props.children;
  }
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            fallbackRedirectUrl="/auth/callback"
          >
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </ClerkProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
