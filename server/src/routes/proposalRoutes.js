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
  createProposalShareLink,
  revokeProposalShareLink,
} = require(
  "../controllers/proposalShareController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

// Everything in this router is
// private administrator access.
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
// CLIENT SHARE LINK
// ADMIN ONLY
// ==============================

router.post(
  "/:proposalId/share",
  createProposalShareLink
);

router.delete(
  "/:proposalId/share",
  revokeProposalShareLink
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