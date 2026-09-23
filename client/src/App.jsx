import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import AccountPage from "./pages/AccountPage";

import {
  logout,
} from "./services/authService";

import {
  useAuth,
} from "./features/auth/AuthContext";

import AuthLayout from "./layouts/AuthLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./features/auth/AuthRoute";

// ==============================
// TEMPORARY PROTECTED SCREEN
// ==============================
// This is only for testing authentication.
// The real BonaForge dashboard will be built
// in its own module later.

const ProtectedTestPage = () => {
  const navigate = useNavigate();
  const { clearSession } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearSession();

      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-6">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-8 text-center shadow-[var(--shadow-premium)]">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-accent)]">
          Protected workspace
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          BonaForge authentication works.
        </h1>

        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
          You reached a protected page because
          your authentication session is valid.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-7 h-11 rounded-xl border border-[var(--border-primary)] bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Test logout
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* ============================== */}
      {/* ROOT */}
      {/* ============================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      {/* ============================== */}
      {/* PUBLIC AUTH ROUTES */}
      {/* ============================== */}

      <Route
        element={
          <PublicOnlyRoute>
            <AuthLayout />
          </PublicOnlyRoute>
        }
      >
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage />
          }
        />
      </Route>

      {/* ============================== */}
      {/* TOKEN-BASED AUTH ROUTES */}
      {/* ============================== */}
      {/* These must remain accessible */}
      {/* even when a user is signed in. */}

      <Route element={<AuthLayout />}>
        <Route
          path="/reset-password/:token"
          element={
            <ResetPasswordPage />
          }
        />

        <Route
          path="/verify-email/:token"
          element={
            <VerifyEmailPage />
          }
        />
      </Route>

      {/* ============================== */}
      {/* PROTECTED ROUTES */}
      {/* ============================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProtectedTestPage />
          </ProtectedRoute>
        }
      />

      <Route
  path="/account"
  element={
    <ProtectedRoute>
      <AccountPage />
    </ProtectedRoute>
  }
/>

      {/* ============================== */}
      {/* NOT FOUND */}
      {/* ============================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;