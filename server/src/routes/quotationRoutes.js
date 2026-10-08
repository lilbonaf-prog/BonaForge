const express =
  require("express");

const {
  getQuotations,
  getQuotationById,
  getQuotationsByLead,
  getQuotationsByProposal,
  createQuotation,
  updateQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  expireQuotation,
  reopenQuotation,
  deleteQuotation,
} = require(
  "../controllers/quotationController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

router.use(protect);

// ==============================
// COLLECTION
// ==============================

router.get(
  "/",
  getQuotations
);

// ==============================
// LEAD
// ==============================

router.get(
  "/lead/:leadId",
  getQuotationsByLead
);

router.post(
  "/lead/:leadId",
  createQuotation
);

// ==============================
// PROPOSAL
// ==============================

router.get(
  "/proposal/:proposalId",
  getQuotationsByProposal
);

// ==============================
// WORKFLOW ACTIONS
// ==============================

router.post(
  "/:quotationId/send",
  sendQuotation
);

router.post(
  "/:quotationId/accept",
  acceptQuotation
);

router.post(
  "/:quotationId/reject",
  rejectQuotation
);

router.post(
  "/:quotationId/expire",
  expireQuotation
);

router.post(
  "/:quotationId/reopen",
  reopenQuotation
);

// ==============================
// SINGLE QUOTATION
// ==============================

router.get(
  "/:quotationId",
  getQuotationById
);

router.patch(
  "/:quotationId",
  updateQuotation
);

router.delete(
  "/:quotationId",
  deleteQuotation
);

module.exports =
  router;