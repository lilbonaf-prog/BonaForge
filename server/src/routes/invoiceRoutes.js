const express = require(
  "express"
);

const {
  getInvoices,
  getInvoiceById,
  getProjectInvoices,
  getLeadInvoices,
  createInvoice,
  updateInvoice,
  sendInvoice,
  markInvoiceOverdue,
  cancelInvoice,
  reopenInvoice,
  deleteInvoice,
} = require(
  "../controllers/invoiceController"
);

const {
  createInvoiceShareLink,
  revokeInvoiceShareLink,
} = require(
  "../controllers/invoiceShareController"
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
// COLLECTION ROUTES
// ==============================

router.get(
  "/",
  getInvoices
);

// ==============================
// PROJECT ROUTES
// ==============================

router.get(
  "/project/:projectId",
  getProjectInvoices
);

router.post(
  "/project/:projectId",
  createInvoice
);

// ==============================
// LEAD ROUTES
// ==============================

router.get(
  "/lead/:leadId",
  getLeadInvoices
);

// ==============================
// WORKFLOW ROUTES
// ==============================

router.post(
  "/:invoiceId/send",
  sendInvoice
);

router.post(
  "/:invoiceId/overdue",
  markInvoiceOverdue
);

router.post(
  "/:invoiceId/cancel",
  cancelInvoice
);

router.post(
  "/:invoiceId/reopen",
  reopenInvoice
);

// ==============================
// CLIENT SHARE LINK
// ADMIN ONLY
// ==============================

router.post(
  "/:invoiceId/share",
  createInvoiceShareLink
);

router.delete(
  "/:invoiceId/share",
  revokeInvoiceShareLink
);

// ==============================
// SINGLE INVOICE ROUTES
// ==============================

router.get(
  "/:invoiceId",
  getInvoiceById
);

router.patch(
  "/:invoiceId",
  updateInvoice
);

router.delete(
  "/:invoiceId",
  deleteInvoice
);

module.exports =
  router;