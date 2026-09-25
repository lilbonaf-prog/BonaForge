const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const businessRoutes = require("./routes/businessRoutes");
const leadRoutes =
  require("./routes/leadRoutes");

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

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
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

// ==============================
// ERROR HANDLING
// ==============================

// Must come after all valid routes
app.use(notFound);

// Must always be final middleware
app.use(errorHandler);

module.exports = app;