import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./features/auth/AuthRoute";

import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import DashboardPage from "./pages/DashboardPage";
import AccountPage from "./pages/AccountPage";

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
          element={
            <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            <RegisterPage />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage />
          }
        />
      </Route>

      {/* ============================== */}
      {/* TOKEN AUTH ROUTES */}
      {/* ============================== */}
      {/* These remain accessible even */}
      {/* when a user is authenticated. */}
      {/* ============================== */}

      <Route
        element={
          <AuthLayout />
        }
      >
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
      {/* PROTECTED APPLICATION */}
      {/* ============================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <DashboardPage />
          }
        />

        <Route
          path="/account"
          element={
            <AccountPage />
          }
        />
      </Route>

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