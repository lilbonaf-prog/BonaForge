const express = require("express");

const {
  getPayments,
  getPaymentById,
  getInvoicePayments,
  createPayment,
  updatePayment,
  reversePayment,
} = require("../controllers/paymentController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  getPayments
);

router.get(
  "/invoice/:invoiceId",
  getInvoicePayments
);

router.post(
  "/invoice/:invoiceId",
  createPayment
);

router.post(
  "/:paymentId/reverse",
  reversePayment
);

router.get(
  "/:paymentId",
  getPaymentById
);

router.patch(
  "/:paymentId",
  updatePayment
);

module.exports = router;