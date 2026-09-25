const express = require("express");

const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertBusinessToLead,
} = require("../controllers/leadController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==============================
// PROTECT ALL LEAD ROUTES
// ==============================

router.use(protect);

// ==============================
// LEAD COLLECTION ROUTES
// ==============================

router
  .route("/")
  .post(createLead)
  .get(getLeads);

// ==============================
// BUSINESS → LEAD CONVERSION
// ==============================

router.post(
  "/from-business/:businessId",
  convertBusinessToLead
);

// ==============================
// SINGLE LEAD ROUTES
// ==============================

router
  .route("/:id")
  .get(getLeadById)
  .patch(updateLead)
  .delete(deleteLead);

module.exports = router;