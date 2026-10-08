const mongoose =
  require("mongoose");

const quotationLineItemSchema =
  new mongoose.Schema(
    {
      description: {
        type: String,
        required: [
          true,
          "Line item description is required",
        ],
        trim: true,
      },

      quantity: {
        type: Number,
        default: 1,
        min: [
          0,
          "Quantity cannot be negative",
        ],
      },

      unitPrice: {
        type: Number,
        default: 0,
        min: [
          0,
          "Unit price cannot be negative",
        ],
      },

      amount: {
        type: Number,
        default: 0,
        min: [
          0,
          "Line amount cannot be negative",
        ],
      },
    },
    {
      _id: true,
    }
  );

const quotationSchema =
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

      proposal: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Proposal",
        default: null,
        index: true,
      },

      quotationNumber: {
        type: String,
        required: true,
        trim: true,
      },

      title: {
        type: String,
        required: [
          true,
          "Quotation title is required",
        ],
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "draft",
          "sent",
          "accepted",
          "rejected",
          "expired",
        ],
        default: "draft",
        index: true,
      },

      currency: {
        type: String,
        default: "GHS",
        trim: true,
        uppercase: true,
      },

      lineItems: {
        type: [
          quotationLineItemSchema,
        ],
        default: [],
      },

      subtotal: {
        type: Number,
        default: 0,
        min: 0,
      },

      discount: {
        type: Number,
        default: 0,
        min: [
          0,
          "Discount cannot be negative",
        ],
      },

      tax: {
        type: Number,
        default: 0,
        min: [
          0,
          "Tax cannot be negative",
        ],
      },

      total: {
        type: Number,
        default: 0,
        min: 0,
      },

      paymentTerms: {
        type: String,
        default: "",
        trim: true,
      },

      notes: {
        type: String,
        default: "",
        trim: true,
      },

      validUntil: {
        type: Date,
        default: null,
      },

      sentAt: {
        type: Date,
        default: null,
      },

      acceptedAt: {
        type: Date,
        default: null,
      },

      rejectedAt: {
        type: Date,
        default: null,
      },

      expiredAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

// ==============================
// CALCULATE TOTALS
// ==============================

quotationSchema.pre(
  "validate",
  function calculateTotals() {
    const items =
      Array.isArray(
        this.lineItems
      )
        ? this.lineItems
        : [];

    let subtotal = 0;

    items.forEach((item) => {
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

      const amount =
        quantity *
        unitPrice;

      item.quantity =
        quantity;

      item.unitPrice =
        unitPrice;

      item.amount =
        amount;

      subtotal +=
        amount;
    });

    const discount =
      Math.max(
        Number(
          this.discount
        ) || 0,
        0
      );

    const tax =
      Math.max(
        Number(
          this.tax
        ) || 0,
        0
      );

    this.subtotal =
      subtotal;

    this.discount =
      discount;

    this.tax =
      tax;

    this.total =
      Math.max(
        subtotal -
          discount +
          tax,
        0
      );
  }
);

// ==============================
// INDEXES
// ==============================

quotationSchema.index(
  {
    createdBy: 1,
    quotationNumber: 1,
  },
  {
    unique: true,
  }
);

quotationSchema.index({
  createdBy: 1,
  status: 1,
  createdAt: -1,
});

quotationSchema.index({
  createdBy: 1,
  lead: 1,
  createdAt: -1,
});

quotationSchema.index({
  createdBy: 1,
  business: 1,
  createdAt: -1,
});

quotationSchema.index({
  createdBy: 1,
  proposal: 1,
  createdAt: -1,
});

module.exports =
  mongoose.model(
    "Quotation",
    quotationSchema
  );