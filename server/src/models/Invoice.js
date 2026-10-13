const mongoose = require("mongoose");
const crypto = require("crypto");

const invoiceItemSchema =
  new mongoose.Schema(
    {
      description: {
        type: String,
        required: [
          true,
          "Invoice item description is required",
        ],
        trim: true,
        maxlength: [
          500,
          "Invoice item description cannot exceed 500 characters",
        ],
      },

      quantity: {
        type: Number,
        min: [
          0,
          "Quantity cannot be negative",
        ],
        default: 1,
      },

      unitPrice: {
        type: Number,
        min: [
          0,
          "Unit price cannot be negative",
        ],
        default: 0,
      },

      amount: {
        type: Number,
        min: [
          0,
          "Amount cannot be negative",
        ],
        default: 0,
      },
    },
    {
      _id: true,
    }
  );

const invoiceSchema =
  new mongoose.Schema(
    {
      createdBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      project: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Project",
        required: true,
        index: true,
      },

      lead: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Lead",
        required: true,
        index: true,
      },

      business: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Business",
        default: null,
        index: true,
      },

      quotation: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Quotation",
        default: null,
        index: true,
      },

      invoiceNumber: {
        type: String,
        required: [
          true,
          "Invoice number is required",
        ],
        trim: true,
      },

      title: {
        type: String,
        required: [
          true,
          "Invoice title is required",
        ],
        trim: true,
        minlength: [
          2,
          "Invoice title must be at least 2 characters",
        ],
        maxlength: [
          180,
          "Invoice title cannot exceed 180 characters",
        ],
      },

      status: {
        type: String,
        enum: [
          "draft",
          "sent",
          "partially_paid",
          "paid",
          "overdue",
          "cancelled",
        ],
        default: "draft",
        index: true,
      },

      items: {
        type: [
          invoiceItemSchema,
        ],
        default: [],
      },

      subtotal: {
        type: Number,
        min: [
          0,
          "Subtotal cannot be negative",
        ],
        default: 0,
      },

      discount: {
        type: Number,
        min: [
          0,
          "Discount cannot be negative",
        ],
        default: 0,
      },

      tax: {
        type: Number,
        min: [
          0,
          "Tax cannot be negative",
        ],
        default: 0,
      },

      total: {
        type: Number,
        min: [
          0,
          "Total cannot be negative",
        ],
        default: 0,
      },

      amountPaid: {
        type: Number,
        min: [
          0,
          "Amount paid cannot be negative",
        ],
        default: 0,
      },

      balanceDue: {
        type: Number,
        min: [
          0,
          "Balance due cannot be negative",
        ],
        default: 0,
      },

      currency: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: 10,
        default: "GHS",
      },

      issueDate: {
        type: Date,
        default: Date.now,
        index: true,
      },

      dueDate: {
        type: Date,
        default: null,
        index: true,
      },

      sentAt: {
        type: Date,
        default: null,
      },

      paidAt: {
        type: Date,
        default: null,
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      cancellationReason: {
        type: String,
        trim: true,
        maxlength: [
          1000,
          "Cancellation reason cannot exceed 1000 characters",
        ],
        default: "",
      },

      paymentTerms: {
        type: String,
        trim: true,
        maxlength: [
          2000,
          "Payment terms cannot exceed 2000 characters",
        ],
        default: "",
      },

      // Private admin notes.
      // Never expose this through public sharing.
      notes: {
        type: String,
        trim: true,
        maxlength: [
          6000,
          "Invoice notes cannot exceed 6000 characters",
        ],
        default: "",
      },

      // ==============================
      // SECURE CLIENT SHARE ACCESS
      // ==============================

      shareAccess: {
        enabled: {
          type: Boolean,
          default: false,
        },

        tokenHash: {
          type: String,
          default: undefined,
          select: false,
        },

        createdAt: {
          type: Date,
          default: null,
        },

        expiresAt: {
          type: Date,
          default: null,
        },

        revokedAt: {
          type: Date,
          default: null,
        },
      },
    },
    {
      timestamps: true,
    }
  );

// ==============================
// CALCULATE TOTALS
// ==============================

invoiceSchema.pre(
  "validate",
  function () {
    this.items =
      Array.isArray(
        this.items
      )
        ? this.items
        : [];

    this.items.forEach(
      (item) => {
        const quantity =
          Math.max(
            Number(
              item.quantity
            ) || 0,
            0
          );

        const unitPrice =
          Math.max(
            Number(
              item.unitPrice
            ) || 0,
            0
          );

        item.quantity =
          quantity;

        item.unitPrice =
          unitPrice;

        item.amount =
          quantity *
          unitPrice;
      }
    );

    this.subtotal =
      this.items.reduce(
        (
          total,
          item
        ) =>
          total +
          (Number(
            item.amount
          ) || 0),
        0
      );

    this.discount =
      Math.max(
        Number(
          this.discount
        ) || 0,
        0
      );

    this.tax =
      Math.max(
        Number(
          this.tax
        ) || 0,
        0
      );

    this.total =
      Math.max(
        this.subtotal -
          this.discount +
          this.tax,
        0
      );

    this.amountPaid =
      Math.max(
        Number(
          this.amountPaid
        ) || 0,
        0
      );

    if (
      this.amountPaid >
      this.total
    ) {
      this.amountPaid =
        this.total;
    }

    this.balanceDue =
      Math.max(
        this.total -
          this.amountPaid,
        0
      );

    if (
      this.status ===
        "paid" &&
      this.balanceDue > 0
    ) {
      this.status =
        this.amountPaid > 0
          ? "partially_paid"
          : "sent";
    }

    if (
      this.balanceDue === 0 &&
      this.total > 0 &&
      this.amountPaid > 0 &&
      this.status !==
        "cancelled"
    ) {
      this.status =
        "paid";

      this.paidAt =
        this.paidAt ||
        new Date();
    }
  }
);

// ==============================
// CREATE SECURE SHARE TOKEN
// ==============================

invoiceSchema.methods.createShareToken =
  function (
    expiresInDays = 30
  ) {
    const rawToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const tokenHash =
      crypto
        .createHash(
          "sha256"
        )
        .update(
          rawToken
        )
        .digest("hex");

    const now =
      new Date();

    const requestedDays =
      Number(
        expiresInDays
      );

    const safeDays =
      Number.isFinite(
        requestedDays
      ) &&
      requestedDays > 0
        ? requestedDays
        : 30;

    this.shareAccess = {
      enabled: true,

      tokenHash,

      createdAt:
        now,

      expiresAt:
        new Date(
          now.getTime() +
            safeDays *
              24 *
              60 *
              60 *
              1000
        ),

      revokedAt:
        null,
    };

    return rawToken;
  };

// ==============================
// REVOKE SECURE SHARE TOKEN
// ==============================

invoiceSchema.methods.revokeShareToken =
  function () {
    this.shareAccess = {
      enabled: false,

      tokenHash:
        undefined,

      createdAt:
        this.shareAccess
          ?.createdAt ||
        null,

      expiresAt:
        this.shareAccess
          ?.expiresAt ||
        null,

      revokedAt:
        new Date(),
    };
  };

// ==============================
// INDEXES
// ==============================

invoiceSchema.index(
  {
    createdBy: 1,
    invoiceNumber: 1,
  },
  {
    unique: true,
  }
);

invoiceSchema.index({
  createdBy: 1,
  project: 1,
  createdAt: -1,
});

invoiceSchema.index({
  createdBy: 1,
  lead: 1,
  createdAt: -1,
});

invoiceSchema.index({
  createdBy: 1,
  business: 1,
  createdAt: -1,
});

invoiceSchema.index({
  createdBy: 1,
  status: 1,
  dueDate: 1,
});

invoiceSchema.index({
  createdBy: 1,
  createdAt: -1,
});

invoiceSchema.index(
  {
    "shareAccess.tokenHash":
      1,
  },
  {
    unique: true,
    sparse: true,
  }
);

const Invoice =
  mongoose.model(
    "Invoice",
    invoiceSchema
  );

module.exports = Invoice;