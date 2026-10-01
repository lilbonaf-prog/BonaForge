const mongoose = require("mongoose");

// ==============================
// DETECTED OPPORTUNITY
// ==============================

const detectedOpportunitySchema =
  new mongoose.Schema(
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
          "website",
          "seo",
          "branding",
          "social_media",
          "content",
          "automation",
          "crm",
          "lead_generation",
          "ecommerce",
          "analytics",
          "design",
          "development",
          "marketing",
          "other",
        ],
        default: "other",
      },

      source: {
        type: String,
        enum: [
          "research",
          "website_audit",
          "manual",
          "combined",
        ],
        default: "manual",
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

      confidence: {
        type: String,
        enum: [
          "low",
          "medium",
          "high",
        ],
        default: "medium",
      },

      problem: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      evidence: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      businessImpact: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      recommendedAction: {
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
// SERVICE RECOMMENDATION
// ==============================

const serviceRecommendationSchema =
  new mongoose.Schema(
    {
      service: {
        type: String,
        trim: true,
        required: true,
        maxlength: 150,
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

      reason: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      expectedOutcome: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      source: {
        type: String,
        enum: [
          "research",
          "website_audit",
          "manual",
          "combined",
        ],
        default: "manual",
      },

      selectedForLead: {
        type: Boolean,
        default: false,
      },
    },
    {
      _id: true,
    }
  );

// ==============================
// OPPORTUNITY ANALYSIS
// ==============================

const opportunityAnalysisSchema =
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
      // BUSINESS CONNECTION
      // ==============================

      business: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Business",
        required: true,
        index: true,
      },

      // ==============================
      // SOURCE RECORDS
      // ==============================

      research: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "BusinessResearch",
        default: null,
      },

      websiteAudit: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "WebsiteAudit",
        default: null,
      },

      // ==============================
      // WORKFLOW
      // ==============================

      status: {
        type: String,
        enum: [
          "draft",
          "in_progress",
          "completed",
        ],
        default: "draft",
        index: true,
      },

      // ==============================
      // ANALYSIS
      // ==============================

      primaryNeed: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      qualificationSummary: {
        type: String,
        trim: true,
        maxlength: 3000,
        default: "",
      },

      detectedOpportunities: {
        type: [
          detectedOpportunitySchema,
        ],
        default: [],
      },

      serviceRecommendations: {
        type: [
          serviceRecommendationSchema,
        ],
        default: [],
      },

      salesAngle: {
        type: String,
        trim: true,
        maxlength: 3000,
        default: "",
      },

      valueProposition: {
        type: String,
        trim: true,
        maxlength: 3000,
        default: "",
      },

      nextBestAction: {
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

// ==============================
// INDEXES
// ==============================

// One opportunity analysis per Business per user.
opportunityAnalysisSchema.index(
  {
    createdBy: 1,
    business: 1,
  },
  {
    unique: true,
  }
);

opportunityAnalysisSchema.index({
  createdBy: 1,
  status: 1,
  updatedAt: -1,
});

// ==============================
// MODEL
// ==============================

module.exports = mongoose.model(
  "OpportunityAnalysis",
  opportunityAnalysisSchema
);