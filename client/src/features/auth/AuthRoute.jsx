import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "./AuthContext";

// ==============================
// PROTECTED ROUTE
// ==============================

export const ProtectedRoute = ({
  children,
}) => {
  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--brand-primary)]" />

          <p className="text-sm text-[var(--text-muted)]">
            Loading BonaForge...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return children;
};

// ==============================
// PUBLIC-ONLY ROUTE
// ==============================

export const PublicOnlyRoute = ({
  children,
}) => {
  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--brand-primary)]" />

          <p className="text-sm text-[var(--text-muted)]">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};