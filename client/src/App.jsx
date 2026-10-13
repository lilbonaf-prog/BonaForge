import {
  lazy,
  Suspense,
} from "react";

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

const LoginPage = lazy(
  () =>
    import(
      "./pages/LoginPage"
    )
);

const RegisterPage = lazy(
  () =>
    import(
      "./pages/RegisterPage"
    )
);

const ForgotPasswordPage =
  lazy(
    () =>
      import(
        "./pages/ForgotPasswordPage"
      )
  );

const ResetPasswordPage =
  lazy(
    () =>
      import(
        "./pages/ResetPasswordPage"
      )
  );

const VerifyEmailPage =
  lazy(
    () =>
      import(
        "./pages/VerifyEmailPage"
      )
  );

const DashboardPage = lazy(
  () =>
    import(
      "./pages/DashboardPage"
    )
);

const AccountPage = lazy(
  () =>
    import(
      "./pages/AccountPage"
    )
);

const BusinessesPage = lazy(
  () =>
    import(
      "./pages/BusinessesPage"
    )
);

const BusinessDetailsPage =
  lazy(
    () =>
      import(
        "./pages/BusinessDetailsPage"
      )
  );

const LeadsPage = lazy(
  () =>
    import(
      "./pages/LeadsPage"
    )
);

const LeadDetailsPage = lazy(
  () =>
    import(
      "./pages/LeadDetailsPage"
    )
);

const FollowUpsPage = lazy(
  () =>
    import(
      "./pages/FollowUpsPage"
    )
);

const ProposalsPage = lazy(
  () =>
    import(
      "./pages/ProposalsPage"
    )
);

const ProposalDetailsPage =
  lazy(
    () =>
      import(
        "./pages/ProposalDetailsPage"
      )
  );

const QuotationsPage = lazy(
  () =>
    import(
      "./pages/QuotationsPage"
    )
);

const QuotationDetailsPage =
  lazy(
    () =>
      import(
        "./pages/QuotationDetailsPage"
      )
  );

const ProjectsPage = lazy(
  () =>
    import(
      "./pages/ProjectsPage"
    )
);

const ProjectDetailsPage =
  lazy(
    () =>
      import(
        "./pages/ProjectDetailsPage"
      )
  );

const InvoicesPage = lazy(
  () =>
    import(
      "./pages/InvoicesPage"
    )
);

const InvoiceDetailsPage =
  lazy(
    () =>
      import(
        "./pages/InvoiceDetailsPage"
      )
  );

const PaymentsPage = lazy(
  () =>
    import(
      "./pages/PaymentsPage"
    )
);

const PaymentDetailsPage =
  lazy(
    () =>
      import(
        "./pages/PaymentDetailsPage"
      )
  );

const AnalyticsPage = lazy(
  () =>
    import(
      "./pages/AnalyticsPage"
    )
);

const ResearchPage = lazy(
  () =>
    import(
      "./pages/ResearchPage"
    )
);

const ResearchDetailsPage =
  lazy(
    () =>
      import(
        "./pages/ResearchDetailsPage"
      )
  );

const WebsiteAuditPage =
  lazy(
    () =>
      import(
        "./pages/WebsiteAuditPage"
      )
  );

const WebsiteAuditDetailsPage =
  lazy(
    () =>
      import(
        "./pages/WebsiteAuditDetailsPage"
      )
  );

const OpportunityAnalysisPage =
  lazy(
    () =>
      import(
        "./pages/OpportunityAnalysisPage"
      )
  );

const OpportunityAnalysisDetailsPage =
  lazy(
    () =>
      import(
        "./pages/OpportunityAnalysisDetailsPage"
      )
  );

const RouteLoader = () => (
  <div className="flex min-h-[420px] w-full items-center justify-center">
    <div className="text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-indigo-300" />

      <p className="mt-4 text-sm font-medium text-white/35">
        Loading workspace...
      </p>
    </div>
  </div>
);

const LazyRoute = ({
  children,
}) => (
  <Suspense
    fallback={
      <RouteLoader />
    }
  >
    {children}
  </Suspense>
);

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
            <LazyRoute>
              <LoginPage />
            </LazyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <LazyRoute>
              <RegisterPage />
            </LazyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <LazyRoute>
              <ForgotPasswordPage />
            </LazyRoute>
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
            <LazyRoute>
              <ResetPasswordPage />
            </LazyRoute>
          }
        />

        <Route
          path="/verify-email/:token"
          element={
            <LazyRoute>
              <VerifyEmailPage />
            </LazyRoute>
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
            <LazyRoute>
              <DashboardPage />
            </LazyRoute>
          }
        />

        <Route
          path="/businesses"
          element={
            <LazyRoute>
              <BusinessesPage />
            </LazyRoute>
          }
        />

        <Route
          path="/businesses/:businessId"
          element={
            <LazyRoute>
              <BusinessDetailsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/leads"
          element={
            <LazyRoute>
              <LeadsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/leads/:leadId"
          element={
            <LazyRoute>
              <LeadDetailsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/follow-ups"
          element={
            <LazyRoute>
              <FollowUpsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/proposals"
          element={
            <LazyRoute>
              <ProposalsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/proposals/:proposalId"
          element={
            <LazyRoute>
              <ProposalDetailsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/quotations"
          element={
            <LazyRoute>
              <QuotationsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/quotations/:quotationId"
          element={
            <LazyRoute>
              <QuotationDetailsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <LazyRoute>
              <ProjectsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <LazyRoute>
              <ProjectDetailsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <LazyRoute>
              <InvoicesPage />
            </LazyRoute>
          }
        />

        <Route
          path="/invoices/:invoiceId"
          element={
            <LazyRoute>
              <InvoiceDetailsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <LazyRoute>
              <PaymentsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/payments/:paymentId"
          element={
            <LazyRoute>
              <PaymentDetailsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <LazyRoute>
              <AnalyticsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/research"
          element={
            <LazyRoute>
              <ResearchPage />
            </LazyRoute>
          }
        />

        <Route
          path="/research/:businessId"
          element={
            <LazyRoute>
              <ResearchDetailsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/website-audits"
          element={
            <LazyRoute>
              <WebsiteAuditPage />
            </LazyRoute>
          }
        />

        <Route
          path="/website-audits/:businessId"
          element={
            <LazyRoute>
              <WebsiteAuditDetailsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/opportunities"
          element={
            <LazyRoute>
              <OpportunityAnalysisPage />
            </LazyRoute>
          }
        />

        <Route
          path="/opportunities/:businessId"
          element={
            <LazyRoute>
              <OpportunityAnalysisDetailsPage />
            </LazyRoute>
          }
        />

        <Route
          path="/account"
          element={
            <LazyRoute>
              <AccountPage />
            </LazyRoute>
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