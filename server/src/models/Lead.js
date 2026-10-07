const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    // ==============================
    // OWNERSHIP
    // ==============================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==============================
    // BUSINESS CONNECTION
    // ==============================

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      default: null,
      index: true,
    },

    // ==============================
    // LEAD IDENTITY
    // ==============================

    name: {
      type: String,
      required: [
        true,
        "Lead name is required",
      ],
      trim: true,
      minlength: [
        2,
        "Lead name must be at least 2 characters",
      ],
      maxlength: [
        120,
        "Lead name cannot exceed 120 characters",
      ],
    },

    companyName: {
      type: String,
      trim: true,
      maxlength: [
        120,
        "Company name cannot exceed 120 characters",
      ],
      default: "",
    },

    jobTitle: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Job title cannot exceed 100 characters",
      ],
      default: "",
    },

    // ==============================
    // CONTACT INFORMATION
    // ==============================

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [
        150,
        "Lead email cannot exceed 150 characters",
      ],
      default: "",
      validate: {
        validator(value) {
          if (!value) {
            return true;
          }

          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            value
          );
        },

        message:
          "Enter a valid lead email address",
      },
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [
        30,
        "Lead phone cannot exceed 30 characters",
      ],
      default: "",
    },

    whatsapp: {
      type: String,
      trim: true,
      maxlength: [
        30,
        "WhatsApp number cannot exceed 30 characters",
      ],
      default: "",
    },

    preferredContactMethod: {
      type: String,
      enum: [
        "phone",
        "email",
        "whatsapp",
        "other",
      ],
      default: "whatsapp",
    },

    // ==============================
    // SALES PIPELINE
    // ==============================

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "follow_up",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      default: "new",
      index: true,
    },

    priority: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "urgent",
      ],
      default: "medium",
      index: true,
    },

    estimatedValue: {
      type: Number,
      min: [
        0,
        "Estimated value cannot be negative",
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

    // ==============================
    // FOLLOW-UP SUMMARY
    // ==============================

    lastContactedAt: {
      type: Date,
      default: null,
    },

    nextFollowUpAt: {
      type: Date,
      default: null,
      index: true,
    },

    followUpCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ==============================
    // OPPORTUNITY
    // ==============================

    servicesInterestedIn: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 120,
        },
      ],
      default: [],
    },

    opportunitySummary: {
      type: String,
      trim: true,
      maxlength: [
        1500,
        "Opportunity summary cannot exceed 1500 characters",
      ],
      default: "",
    },

    // ==============================
    // OUTCOME
    // ==============================

    wonAt: {
      type: Date,
      default: null,
    },

    lostAt: {
      type: Date,
      default: null,
    },

    lostReason: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Lost reason cannot exceed 500 characters",
      ],
      default: "",
    },

    // ==============================
    // SOURCE
    // ==============================

    source: {
      type: String,
      enum: [
        "business_conversion",
        "manual",
        "referral",
        "social_media",
        "website",
        "email",
        "other",
      ],
      default: "manual",
    },

    sourceDetails: {
      type: String,
      trim: true,
      maxlength: [
        300,
        "Source details cannot exceed 300 characters",
      ],
      default: "",
    },

    // ==============================
    // NOTES
    // ==============================

    notes: {
      type: String,
      trim: true,
      maxlength: [
        4000,
        "Lead notes cannot exceed 4000 characters",
      ],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ==============================
// INDEXES
// ==============================

leadSchema.index({
  createdBy: 1,
  createdAt: -1,
});

leadSchema.index({
  createdBy: 1,
  status: 1,
});

leadSchema.index({
  createdBy: 1,
  priority: 1,
});

leadSchema.index({
  createdBy: 1,
  nextFollowUpAt: 1,
});

leadSchema.index(
  {
    createdBy: 1,
    business: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      business: {
        $type: "objectId",
      },
    },
  }
);

// ==============================
// DELETE LINKED ACTIVITY HISTORY
// ==============================
//
// The Lead controller deletes leads with:
//
//   await lead.deleteOne();
//
// This document middleware runs before that
// deletion and removes all contact/follow-up
// records belonging to the same user + lead.
//
// Requiring LeadActivity inside the middleware
// avoids unnecessary model dependency issues
// during application startup.
// ==============================

leadSchema.pre(
  "deleteOne",
  {
    document: true,
    query: false,
  },
  async function deleteLinkedActivities() {
    const LeadActivity =
      require("./LeadActivity");

    await LeadActivity.deleteMany({
      lead: this._id,
      createdBy: this.createdBy,
    });
  }
);

// ==============================
// MODEL
// ==============================

const Lead = mongoose.model(
  "Lead",
  leadSchema
);

module.exports = Lead;