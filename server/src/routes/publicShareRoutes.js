const express = require(
  "express"
);

const {
  getPublicProposalByToken,
} = require(
  "../controllers/proposalShareController"
);

const {
  getPublicQuotationByToken,
} = require(
  "../controllers/quotationShareController"
);

const {
  getPublicInvoiceByToken,
} = require(
  "../controllers/invoiceShareController"
);

const router =
  express.Router();

// ==============================
// PUBLIC READ-ONLY SHARES
// ==============================

// No authentication middleware here.
// Access is controlled by secure,
// random share tokens.

router.get(
  "/proposal/:token",
  getPublicProposalByToken
);

router.get(
  "/quotation/:token",
  getPublicQuotationByToken
);

router.get(
  "/invoice/:token",
  getPublicInvoiceByToken
);

module.exports = router;