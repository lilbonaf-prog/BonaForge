const mongoose = require("mongoose");
const crypto = require("crypto");

const scopeItemSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 200,
      },

      description: {
        type: String,
        trim: true,
        default: "",
        maxlength: 2000,
      },

      deliverables: {
        type: [String],
        default: [],
      },
    },
    {
      _id: true,
    }
  );

const proposalSchema =
  new mongoose.Schema(
    {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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

      proposalNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        maxlength: 40,
      },

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
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

      summary: {
        type: String,
        trim: true,
        default: "",
        maxlength: 2500,
      },

      clientProblem: {
        type: String,
        trim: true,
        default: "",
        maxlength: 3000,
      },

      proposedSolution: {
        type: String,
        trim: true,
        default: "",
        maxlength: 5000,
      },

      objectives: {
        type: [String],
        default: [],
      },

      scopeOfWork: {
        type: [scopeItemSchema],
        default: [],
      },

      timeline: {
        estimatedDuration: {
          type: String,
          trim: true,
          default: "",
          maxlength: 200,
        },

        startDate: {
          type: Date,
          default: null,
        },

        endDate: {
          type: Date,
          default: null,
        },
      },

      pricingOverview: {
        currency: {
          type: String,
          trim: true,
          uppercase: true,
          default: "GHS",
          maxlength: 10,
        },

        estimatedAmount: {
          type: Number,
          min: 0,
          default: 0,
        },

        note: {
          type: String,
          trim: true,
          default: "",
          maxlength: 1000,
        },
      },

      termsAndConditions: {
        type: String,
        trim: true,
        default: "",
        maxlength: 5000,
      },

      // Private administrator notes.
      // Never expose this field through public
      // proposal sharing endpoints.
      notes: {
        type: String,
        trim: true,
        default: "",
        maxlength: 4000,
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

      // ==============================
      // SECURE CLIENT SHARING
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
// PRIVATE ADMIN INDEXES
// ==============================

proposalSchema.index(
  {
    createdBy: 1,
    proposalNumber: 1,
  },
  {
    unique: true,
  }
);

proposalSchema.index({
  createdBy: 1,
  status: 1,
  createdAt: -1,
});

proposalSchema.index({
  createdBy: 1,
  lead: 1,
  createdAt: -1,
});

proposalSchema.index({
  createdBy: 1,
  business: 1,
  createdAt: -1,
});

// ==============================
// PUBLIC SHARE TOKEN INDEX
// ==============================

proposalSchema.index(
  {
    "shareAccess.tokenHash": 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

// ==============================
// CREATE SECURE SHARE TOKEN
// ==============================

proposalSchema.methods.createShareToken =
  function (
    expiresInDays = 30
  ) {
    const rawToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const now = new Date();

    const safeDays =
      Number.isFinite(
        Number(expiresInDays)
      ) &&
      Number(expiresInDays) > 0
        ? Number(expiresInDays)
        : 30;

    this.shareAccess = {
      enabled: true,
      tokenHash,
      createdAt: now,
      expiresAt: new Date(
        now.getTime() +
          safeDays *
            24 *
            60 *
            60 *
            1000
      ),
      revokedAt: null,
    };

    return rawToken;
  };

// ==============================
// REVOKE SHARE TOKEN
// ==============================

proposalSchema.methods.revokeShareToken =
  function () {
    this.shareAccess = {
      enabled: false,
      tokenHash: undefined,
      createdAt:
        this.shareAccess?.createdAt ||
        null,
      expiresAt:
        this.shareAccess?.expiresAt ||
        null,
      revokedAt: new Date(),
    };
  };

module.exports =
  mongoose.model(
    "Proposal",
    proposalSchema
  );