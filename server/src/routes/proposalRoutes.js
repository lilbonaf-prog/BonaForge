const express = require(
  "express"
);

const {
  getProposals,
  getProposalById,
  getProposalsByLead,
  createProposal,
  updateProposal,
  sendProposal,
  acceptProposal,
  rejectProposal,
  expireProposal,
  reopenProposal,
  deleteProposal,
} = require(
  "../controllers/proposalController"
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
// LIST
// ==============================

router.get(
  "/",
  getProposals
);

// ==============================
// LEAD PROPOSALS
// ==============================

router.get(
  "/lead/:leadId",
  getProposalsByLead
);

router.post(
  "/lead/:leadId",
  createProposal
);

// ==============================
// STATUS ACTIONS
// ==============================

router.post(
  "/:proposalId/send",
  sendProposal
);

router.post(
  "/:proposalId/accept",
  acceptProposal
);

router.post(
  "/:proposalId/reject",
  rejectProposal
);

router.post(
  "/:proposalId/expire",
  expireProposal
);

router.post(
  "/:proposalId/reopen",
  reopenProposal
);

// ==============================
// SINGLE PROPOSAL
// ==============================

router.get(
  "/:proposalId",
  getProposalById
);

router.patch(
  "/:proposalId",
  updateProposal
);

router.delete(
  "/:proposalId",
  deleteProposal
);

module.exports = router;