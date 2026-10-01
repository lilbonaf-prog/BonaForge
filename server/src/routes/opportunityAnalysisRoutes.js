const express = require("express");

const {
  getOpportunityAnalysisList,
  getOpportunityAnalysisByBusiness,
  startOpportunityAnalysis,
  updateOpportunityAnalysis,
  completeOpportunityAnalysis,
  reopenOpportunityAnalysis,
} = require(
  "../controllers/opportunityAnalysisController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

// ==============================
// PROTECT ALL ROUTES
// ==============================

router.use(protect);

// ==============================
// OPPORTUNITY ANALYSIS ROUTES
// ==============================

router.get(
  "/",
  getOpportunityAnalysisList
);

router.get(
  "/business/:businessId",
  getOpportunityAnalysisByBusiness
);

router.post(
  "/business/:businessId/start",
  startOpportunityAnalysis
);

router.patch(
  "/:analysisId",
  updateOpportunityAnalysis
);

router.post(
  "/:analysisId/complete",
  completeOpportunityAnalysis
);

router.post(
  "/:analysisId/reopen",
  reopenOpportunityAnalysis
);

module.exports = router;