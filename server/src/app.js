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

const analyticsRoutes = require(
  "./routes/analyticsRoutes"
);

const publicShareRoutes = require(
  "./routes/publicShareRoutes"
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

const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  ...(
    process.env.CORS_ORIGINS ||
    ""
  ).split(","),
]
  .map((origin) =>
    origin?.trim()
  )
  .filter(Boolean);

const allowedOrigins =
  configuredOrigins.length > 0
    ? configuredOrigins
    : [
        "http://localhost:5173",
      ];

const corsOptions = {
  origin: (
    origin,
    callback
  ) => {
    if (!origin) {
      return callback(
        null,
        true
      );
    }

    if (
      allowedOrigins.includes(
        origin
      )
    ) {
      return callback(
        null,
        true
      );
    }

    const error =
      new Error(
        "Origin not allowed by CORS"
      );

    error.statusCode = 403;

    return callback(
      error
    );
  },

  credentials: true,
};

app.use(
  cors(corsOptions)
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
// PUBLIC READ-ONLY ROUTES
// ==============================

app.use(
  "/api/share",
  publicShareRoutes
);

// ==============================
// PRIVATE ADMIN API ROUTES
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

app.use(
  "/api/analytics",
  analyticsRoutes
);

// ==============================
// ERROR HANDLING
// ==============================

app.use(notFound);
app.use(errorHandler);

module.exports = app;