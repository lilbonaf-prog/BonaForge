const express = require("express");

const {
  getWebsiteAuditList,
  getAuditByBusiness,
  startAudit,
  updateAudit,
  completeAudit,
  reopenAudit,
} = require("../controllers/websiteAuditController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  getWebsiteAuditList
);

router.get(
  "/business/:businessId",
  getAuditByBusiness
);

router.post(
  "/business/:businessId/start",
  startAudit
);

router.patch(
  "/:auditId",
  updateAudit
);

router.post(
  "/:auditId/complete",
  completeAudit
);

router.post(
  "/:auditId/reopen",
  reopenAudit
);

module.exports = router;