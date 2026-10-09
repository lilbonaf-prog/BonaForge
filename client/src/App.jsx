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

import BusinessesPage from "./pages/BusinessesPage";
import BusinessDetailsPage from "./pages/BusinessDetailsPage";

import LeadsPage from "./pages/LeadsPage";
import LeadDetailsPage from "./pages/LeadDetailsPage";
import FollowUpsPage from "./pages/FollowUpsPage";

import ProposalsPage from "./pages/ProposalsPage";
import ProposalDetailsPage from "./pages/ProposalDetailsPage";

import QuotationsPage from "./pages/QuotationsPage";
import QuotationDetailsPage from "./pages/QuotationDetailsPage";

import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";

import InvoicesPage from "./pages/InvoicesPage";
import InvoiceDetailsPage from "./pages/InvoiceDetailsPage";

import PaymentsPage from "./pages/PaymentsPage";
import PaymentDetailsPage from "./pages/PaymentDetailsPage";

import AnalyticsPage from "./pages/AnalyticsPage";

import ResearchPage from "./pages/ResearchPage";
import ResearchDetailsPage from "./pages/ResearchDetailsPage";

import WebsiteAuditPage from "./pages/WebsiteAuditPage";
import WebsiteAuditDetailsPage from "./pages/WebsiteAuditDetailsPage";

import OpportunityAnalysisPage from "./pages/OpportunityAnalysisPage";
import OpportunityAnalysisDetailsPage from "./pages/OpportunityAnalysisDetailsPage";

function App() {
  return (
    <Routes>
      {/* ROOT */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      {/* PUBLIC AUTH ROUTES */}

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

      {/* TOKEN AUTH ROUTES */}

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

      {/* PROTECTED APPLICATION */}

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
          path="/businesses"
          element={
            <BusinessesPage />
          }
        />

        <Route
          path="/businesses/:businessId"
          element={
            <BusinessDetailsPage />
          }
        />

        <Route
          path="/leads"
          element={
            <LeadsPage />
          }
        />

        <Route
          path="/leads/:leadId"
          element={
            <LeadDetailsPage />
          }
        />

        <Route
          path="/follow-ups"
          element={
            <FollowUpsPage />
          }
        />

        <Route
          path="/proposals"
          element={
            <ProposalsPage />
          }
        />

        <Route
          path="/proposals/:proposalId"
          element={
            <ProposalDetailsPage />
          }
        />

        <Route
          path="/quotations"
          element={
            <QuotationsPage />
          }
        />

        <Route
          path="/quotations/:quotationId"
          element={
            <QuotationDetailsPage />
          }
        />

        <Route
          path="/projects"
          element={
            <ProjectsPage />
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <ProjectDetailsPage />
          }
        />

        <Route
          path="/invoices"
          element={
            <InvoicesPage />
          }
        />

        <Route
          path="/invoices/:invoiceId"
          element={
            <InvoiceDetailsPage />
          }
        />

        <Route
          path="/payments"
          element={
            <PaymentsPage />
          }
        />

        <Route
          path="/payments/:paymentId"
          element={
            <PaymentDetailsPage />
          }
        />

        <Route
          path="/analytics"
          element={
            <AnalyticsPage />
          }
        />

        <Route
          path="/research"
          element={
            <ResearchPage />
          }
        />

        <Route
          path="/research/:businessId"
          element={
            <ResearchDetailsPage />
          }
        />

        <Route
          path="/website-audits"
          element={
            <WebsiteAuditPage />
          }
        />

        <Route
          path="/website-audits/:businessId"
          element={
            <WebsiteAuditDetailsPage />
          }
        />

        <Route
          path="/opportunities"
          element={
            <OpportunityAnalysisPage />
          }
        />

        <Route
          path="/opportunities/:businessId"
          element={
            <OpportunityAnalysisDetailsPage />
          }
        />

        <Route
          path="/account"
          element={
            <AccountPage />
          }
        />
      </Route>

      {/* NOT FOUND */}

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