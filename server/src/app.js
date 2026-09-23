const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const healthRoutes = require("./routes/healthRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");

const app = express();

// -------------------------
// Core middleware
// -------------------------

app.use(express.json());

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use(apiLimiter);

// -------------------------
// Routes
// -------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BonaForge API is running successfully",
  });
});

// Health check
app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);



// -------------------------
// Error handling
// -------------------------

// Must come after all valid routes
app.use(notFound);

// Must be the final middleware
app.use(errorHandler);

module.exports = app;