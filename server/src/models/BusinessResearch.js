const mongoose = require("mongoose");

const socialProfileSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    url: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    handle: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

const competitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { _id: false }
);

const sourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    url: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    sourceType: {
      type: String,
      enum: [
        "website",
        "social_media",
        "search",
        "directory",
        "manual",
        "other",
      ],
      default: "manual",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

const businessResearchSchema = new mongoose.Schema(
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
      enum: ["draft", "in_progress", "completed"],
      default: "draft",
      index: true,
    },

    companyOverview: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    productsServices: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 200,
        },
      ],
      default: [],
    },

    targetAudience: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    marketPositioning: {
      type: String,
      trim: true,
      maxlength: 3000,
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

    weaknesses: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 500,
        },
      ],
      default: [],
    },

    opportunities: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 500,
        },
      ],
      default: [],
    },

    competitors: {
      type: [competitorSchema],
      default: [],
    },

    digitalPresenceSummary: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    socialProfiles: {
      type: [socialProfileSchema],
      default: [],
    },

    keyFindings: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 750,
        },
      ],
      default: [],
    },

    recommendedApproach: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    sources: {
      type: [sourceSchema],
      default: [],
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

businessResearchSchema.index(
  {
    createdBy: 1,
    business: 1,
  },
  {
    unique: true,
  }
);

businessResearchSchema.index({
  createdBy: 1,
  status: 1,
  updatedAt: -1,
});

module.exports = mongoose.model("BusinessResearch", businessResearchSchema);