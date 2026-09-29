const express = require("express");

const {
  getResearchList,
  getResearchByBusiness,
  startResearch,
  updateResearch,
  completeResearch,
  reopenResearch,
} = require("../controllers/researchController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Research workspace
router.get("/", getResearchList);

// Research by Business
router.get("/business/:businessId", getResearchByBusiness);

router.post("/business/:businessId/start", startResearch);

// Research record actions
router.patch("/:researchId", updateResearch);

router.post("/:researchId/complete", completeResearch);

router.post("/:researchId/reopen", reopenResearch);

module.exports = router;