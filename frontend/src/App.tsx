import type { ReactNode } from "react";
import { Component, ErrorInfo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Arena from "./pages/Arena";
import HomePage from "./pages/DashBoard";
import LeaderboardPage from "./pages/Leaderboard";
import WaitingRoom from "./pages/Waitingroom";
import { useAuth } from "@/context/AuthContext";
import BattleRoom from "./pages/Lobby";
import BattleHistory from "./pages/History";
import Results from "./pages/Results";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./auth/SignInPage";
import SignUpPage from "./auth/SignUpPage";
import SSOCallback from "./auth/SSOCallBack";
import { AuthProvider } from "./context/AuthContext";
import { Loader2, AlertTriangle } from "lucide-react";


class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <AlertTriangle className="h-12 w-12 text-rose-500" />
            <p className="text-lg font-semibold text-foreground">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }
  if (!user) return <Navigate to="/landing" replace />;
  return <>{children}</>;
};

const SignedOutOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/sign-in/*" element={<SignedOutOnlyRoute><SignInPage /></SignedOutOnlyRoute>} />
          <Route path="/sign-up/*" element={<SignedOutOnlyRoute><SignUpPage /></SignedOutOnlyRoute>} />
          <Route path="/sso-callback" element={<SSOCallback />} />
          <Route path="/landing" element={<SignedOutOnlyRoute><LandingPage /></SignedOutOnlyRoute>} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/battle-room" element={<ProtectedRoute><BattleRoom /></ProtectedRoute>} />
          <Route path="/waiting/:battleId" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
          <Route path="/arena/:battleId" element={<ProtectedRoute><Arena /></ProtectedRoute>} />
          <Route path="/results/:battleId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><BattleHistory /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}
