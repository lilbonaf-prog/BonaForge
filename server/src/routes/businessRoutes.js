const express = require("express");

const {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
} = require("../controllers/businessController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All business routes require authentication
router.use(protect);

// ==============================
// BUSINESS COLLECTION
// ==============================

router
  .route("/")
  .post(createBusiness)
  .get(getBusinesses);

// ==============================
// SINGLE BUSINESS
// ==============================

router
  .route("/:id")
  .get(getBusinessById)
  .patch(updateBusiness)
  .delete(deleteBusiness);

module.exports = router;