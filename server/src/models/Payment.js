const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      default: null,
      index: true,
    },

    paymentNumber: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 10,
      default: "GHS",
    },

    method: {
      type: String,
      enum: [
        "bank_transfer",
        "cash",
        "mobile_money",
        "card",
        "cheque",
        "other",
      ],
      default: "bank_transfer",
      index: true,
    },

    transactionReference: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "completed",
        "reversed",
      ],
      default: "completed",
      index: true,
    },

    paidAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    reversedAt: {
      type: Date,
      default: null,
    },

    reversalReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index(
  {
    createdBy: 1,
    paymentNumber: 1,
  },
  {
    unique: true,
  }
);

paymentSchema.index({
  createdBy: 1,
  invoice: 1,
  paidAt: -1,
});

paymentSchema.index({
  createdBy: 1,
  project: 1,
  paidAt: -1,
});

paymentSchema.index({
  createdBy: 1,
  lead: 1,
  paidAt: -1,
});

paymentSchema.index({
  createdBy: 1,
  business: 1,
  paidAt: -1,
});

paymentSchema.index({
  createdBy: 1,
  status: 1,
  paidAt: -1,
});

const Payment = mongoose.model(
  "Payment",
  paymentSchema
);

module.exports = Payment;