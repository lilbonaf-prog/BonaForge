const mongoose = require("mongoose");

const businessSchema =
  new mongoose.Schema(
    {
      // ==============================
      // OWNERSHIP
      // ==============================

      createdBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      // ==============================
      // BASIC INFORMATION
      // ==============================

      name: {
        type: String,
        required: [
          true,
          "Business name is required",
        ],
        trim: true,
        minlength: [
          2,
          "Business name must be at least 2 characters",
        ],
        maxlength: [
          120,
          "Business name cannot exceed 120 characters",
        ],
      },

      industry: {
        type: String,
        trim: true,
        maxlength: [
          100,
          "Industry cannot exceed 100 characters",
        ],
        default: "",
      },

      description: {
        type: String,
        trim: true,
        maxlength: [
          1500,
          "Description cannot exceed 1500 characters",
        ],
        default: "",
      },

      // ==============================
      // CONTACT INFORMATION
      // ==============================

      phone: {
        type: String,
        trim: true,
        maxlength: [
          30,
          "Phone number cannot exceed 30 characters",
        ],
        default: "",
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [
          150,
          "Email cannot exceed 150 characters",
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
            "Enter a valid business email address",
        },
      },

      website: {
        type: String,
        trim: true,
        maxlength: [
          300,
          "Website cannot exceed 300 characters",
        ],
        default: "",
      },

      // ==============================
      // LOCATION
      // ==============================

      location: {
        address: {
          type: String,
          trim: true,
          maxlength: 250,
          default: "",
        },

        city: {
          type: String,
          trim: true,
          maxlength: 100,
          default: "",
        },

        region: {
          type: String,
          trim: true,
          maxlength: 100,
          default: "",
        },

        country: {
          type: String,
          trim: true,
          maxlength: 100,
          default: "Ghana",
        },
      },

      // ==============================
      // SOCIAL PRESENCE
      // ==============================

      socialLinks: {
        facebook: {
          type: String,
          trim: true,
          default: "",
        },

        instagram: {
          type: String,
          trim: true,
          default: "",
        },

        linkedin: {
          type: String,
          trim: true,
          default: "",
        },

        tiktok: {
          type: String,
          trim: true,
          default: "",
        },

        x: {
          type: String,
          trim: true,
          default: "",
        },
      },

      // ==============================
      // BUSINESS SOURCE
      // ==============================

      source: {
        type: String,
        enum: [
          "manual",
          "google",
          "social_media",
          "referral",
          "directory",
          "other",
        ],
        default: "manual",
      },

      sourceDetails: {
        type: String,
        trim: true,
        maxlength: 300,
        default: "",
      },

      // ==============================
      // WORKFLOW STATUS
      // ==============================

      status: {
        type: String,
        enum: [
          "saved",
          "researching",
          "researched",
          "qualified",
          "not_suitable",
          "converted",
        ],
        default: "saved",
        index: true,
      },

      // ==============================
      // NOTES
      // ==============================

      notes: {
        type: String,
        trim: true,
        maxlength: [
          3000,
          "Notes cannot exceed 3000 characters",
        ],
        default: "",
      },

      // ==============================
      // FUTURE RESEARCH/AUDIT SUPPORT
      // ==============================

      researchCompleted: {
        type: Boolean,
        default: false,
      },

      websiteAuditCompleted: {
        type: Boolean,
        default: false,
      },

      opportunityAnalysisCompleted: {
        type: Boolean,
        default: false,
      },

      convertedToLead: {
        type: Boolean,
        default: false,
      },
    },

    {
      timestamps: true,
    }
  );

// ==============================
// INDEXES
// ==============================

businessSchema.index({
  createdBy: 1,
  createdAt: -1,
});

businessSchema.index({
  createdBy: 1,
  status: 1,
});

businessSchema.index({
  createdBy: 1,
  name: 1,
});

// ==============================
// MODEL
// ==============================

const Business =
  mongoose.model(
    "Business",
    businessSchema
  );

module.exports = Business;