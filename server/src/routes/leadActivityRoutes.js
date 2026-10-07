const express = require("express");

const {
  createLeadActivity,
  getLeadActivities,
  getLeadActivityById,
  updateLeadActivity,
  completeFollowUp,
  cancelFollowUp,
  getFollowUps,
  deleteLeadActivity,
} = require("../controllers/leadActivityController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==============================
// PROTECT ALL ACTIVITY ROUTES
// ==============================

router.use(protect);

// ==============================
// FOLLOW-UP WORKSPACE
// ==============================

router.get(
  "/follow-ups",
  getFollowUps
);

// ==============================
// LEAD ACTIVITY COLLECTION
// ==============================

router
  .route("/lead/:leadId")
  .post(createLeadActivity)
  .get(getLeadActivities);

// ==============================
// FOLLOW-UP ACTIONS
// ==============================

router.post(
  "/:activityId/complete-follow-up",
  completeFollowUp
);

router.post(
  "/:activityId/cancel-follow-up",
  cancelFollowUp
);

// ==============================
// SINGLE ACTIVITY
// ==============================

router
  .route("/:activityId")
  .get(getLeadActivityById)
  .patch(updateLeadActivity)
  .delete(deleteLeadActivity);

module.exports = router;