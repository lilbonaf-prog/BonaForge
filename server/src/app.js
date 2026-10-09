const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const businessRoutes = require("./routes/businessRoutes");
const leadRoutes = require("./routes/leadRoutes");
const researchRoutes = require("./routes/researchRoutes");
const websiteAuditRoutes = require("./routes/websiteAuditRoutes");

const opportunityAnalysisRoutes = require(
  "./routes/opportunityAnalysisRoutes"
);

const leadActivityRoutes = require(
  "./routes/leadActivityRoutes"
);

const proposalRoutes = require(
  "./routes/proposalRoutes"
);

const quotationRoutes = require(
  "./routes/quotationRoutes"
);

const projectRoutes = require(
  "./routes/projectRoutes"
);

const invoiceRoutes = require(
  "./routes/invoiceRoutes"
);

const paymentRoutes = require(
  "./routes/paymentRoutes"
);

const notFound = require(
  "./middleware/notFound"
);

const errorHandler = require(
  "./middleware/errorHandler"
);

const app = express();

// ==============================
// CORE MIDDLEWARE
// ==============================

app.use(express.json());

// ==============================
// SECURITY HEADERS
// ==============================

app.use(helmet());

// ==============================
// CORS
// ==============================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ==============================
// RATE LIMITING
// ==============================

const apiLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 100,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,
  });

app.use(apiLimiter);

// ==============================
// ROOT ROUTE
// ==============================

app.get("/", (req, res) => {
  res.json({
    success: true,

    message:
      "BonaForge API is running successfully",
  });
});

// ==============================
// API ROUTES
// ==============================

app.use(
  "/api/health",
  healthRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/businesses",
  businessRoutes
);

app.use(
  "/api/leads",
  leadRoutes
);

app.use(
  "/api/research",
  researchRoutes
);

app.use(
  "/api/website-audits",
  websiteAuditRoutes
);

app.use(
  "/api/opportunity-analysis",
  opportunityAnalysisRoutes
);

app.use(
  "/api/lead-activities",
  leadActivityRoutes
);

app.use(
  "/api/proposals",
  proposalRoutes
);

app.use(
  "/api/quotations",
  quotationRoutes
);

app.use(
  "/api/projects",
  projectRoutes
);

app.use(
  "/api/invoices",
  invoiceRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

// ==============================
// ERROR HANDLING
// ==============================

// Must come after all valid routes
app.use(notFound);

// Must always be final middleware
app.use(errorHandler);

module.exports = app;