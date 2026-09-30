const mongoose = require("mongoose");

// ==============================
// AUDIT ISSUE
// ==============================

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 200,
    },

    category: {
      type: String,
      enum: [
        "performance",
        "mobile",
        "seo",
        "accessibility",
        "content",
        "security",
        "trust",
        "ux",
        "technical",
        "other",
      ],
      default: "other",
    },

    severity: {
      type: String,
      enum: [
        "critical",
        "high",
        "medium",
        "low",
        "info",
      ],
      default: "medium",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    evidence: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: "",
    },

    recommendation: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    _id: true,
  }
);

// ==============================
// SALES OPPORTUNITY
// ==============================

const opportunitySchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 200,
      },

      service: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
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
      },

      impact: {
        type: String,
        enum: [
          "low",
          "medium",
          "high",
        ],
        default: "medium",
      },

      description: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },
    },
    {
      _id: true,
    }
  );

// ==============================
// SCORE BREAKDOWN
// ==============================

const scoreBreakdownSchema =
  new mongoose.Schema(
    {
      performance: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      mobile: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      seo: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      accessibility: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      content: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      trust: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      ux: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
    },
    {
      _id: false,
    }
  );

// ==============================
// TECHNICAL CHECKS
// ==============================

const technicalChecksSchema =
  new mongoose.Schema(
    {
      sslEnabled: {
        type: Boolean,
        default: null,
      },

      mobileResponsive: {
        type: Boolean,
        default: null,
      },

      contactInformationVisible: {
        type: Boolean,
        default: null,
      },

      clearCallToAction: {
        type: Boolean,
        default: null,
      },

      socialLinksPresent: {
        type: Boolean,
        default: null,
      },

      analyticsDetected: {
        type: Boolean,
        default: null,
      },

      metadataPresent: {
        type: Boolean,
        default: null,
      },

      sitemapPresent: {
        type: Boolean,
        default: null,
      },

      robotsTxtPresent: {
        type: Boolean,
        default: null,
      },
    },
    {
      _id: false,
    }
  );

// ==============================
// WEBSITE AUDIT
// ==============================

const websiteAuditSchema =
  new mongoose.Schema(
    {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: [
          "draft",
          "in_progress",
          "completed",
          "not_applicable",
        ],
        default: "draft",
        index: true,
      },

      websiteAvailable: {
        type: Boolean,
        default: true,
      },

      websiteUrl: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      auditMode: {
        type: String,
        enum: [
          "manual",
          "automated",
          "hybrid",
        ],
        default: "manual",
      },

      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      scores: {
        type: scoreBreakdownSchema,
        default: () => ({}),
      },

      technicalChecks: {
        type: technicalChecksSchema,
        default: () => ({}),
      },

      summary: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: "",
      },

      strengths: {
        type: [
          {
            type: String,
            trim: true,
            maxlength: 500,
          },
        ],
        default: [],
      },

      issues: {
        type: [issueSchema],
        default: [],
      },

      opportunities: {
        type: [opportunitySchema],
        default: [],
      },

      recommendedServices: {
        type: [
          {
            type: String,
            trim: true,
            maxlength: 200,
          },
        ],
        default: [],
      },

      nextStep: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: "",
      },

      startedAt: {
        type: Date,
        default: null,
      },

      completedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

// One website audit record per Business per user.
websiteAuditSchema.index(
  {
    createdBy: 1,
    business: 1,
  },
  {
    unique: true,
  }
);

websiteAuditSchema.index({
  createdBy: 1,
  status: 1,
  updatedAt: -1,
});

module.exports = mongoose.model(
  "WebsiteAudit",
  websiteAuditSchema
);