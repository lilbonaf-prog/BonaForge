const mongoose = require(
  "mongoose"
);

// ==============================
// MILESTONE SCHEMA
// ==============================

const milestoneSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: [
          true,
          "Milestone title is required",
        ],
        trim: true,
        maxlength: [
          160,
          "Milestone title cannot exceed 160 characters",
        ],
      },

      description: {
        type: String,
        trim: true,
        maxlength: [
          1500,
          "Milestone description cannot exceed 1500 characters",
        ],
        default: "",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "in_progress",
          "completed",
        ],
        default: "pending",
      },

      dueDate: {
        type: Date,
        default: null,
      },

      completedAt: {
        type: Date,
        default: null,
      },
    },
    {
      _id: true,
    }
  );

// ==============================
// PROJECT SCHEMA
// ==============================

const projectSchema =
  new mongoose.Schema(
    {
      // ==============================
      // OWNERSHIP
      // ==============================

      createdBy: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      // ==============================
      // SALES CONNECTIONS
      // ==============================

      lead: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "Lead",
        required: true,
        index: true,
      },

      business: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "Business",
        default: null,
        index: true,
      },

      proposal: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "Proposal",
        default: null,
        index: true,
      },

      quotation: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "Quotation",
        default: null,
        index: true,
      },

      // ==============================
      // PROJECT IDENTITY
      // ==============================

      projectNumber: {
        type: String,
        required: [
          true,
          "Project number is required",
        ],
        trim: true,
      },

      name: {
        type: String,
        required: [
          true,
          "Project name is required",
        ],
        trim: true,
        minlength: [
          2,
          "Project name must be at least 2 characters",
        ],
        maxlength: [
          180,
          "Project name cannot exceed 180 characters",
        ],
      },

      summary: {
        type: String,
        trim: true,
        maxlength: [
          2000,
          "Project summary cannot exceed 2000 characters",
        ],
        default: "",
      },

      // ==============================
      // PROJECT STATUS
      // ==============================

      status: {
        type: String,
        enum: [
          "planned",
          "in_progress",
          "on_hold",
          "completed",
          "cancelled",
        ],
        default: "planned",
        index: true,
      },

      progress: {
        type: Number,
        min: [
          0,
          "Project progress cannot be below 0",
        ],
        max: [
          100,
          "Project progress cannot exceed 100",
        ],
        default: 0,
      },

      // ==============================
      // PROJECT WORK
      // ==============================

      services: {
        type: [
          {
            type: String,
            trim: true,
            maxlength: 160,
          },
        ],
        default: [],
      },

      scope: {
        type: String,
        trim: true,
        maxlength: [
          6000,
          "Project scope cannot exceed 6000 characters",
        ],
        default: "",
      },

      deliverables: {
        type: [
          {
            type: String,
            trim: true,
            maxlength: 500,
          },
        ],
        default: [],
      },

      milestones: {
        type: [milestoneSchema],
        default: [],
      },

      // ==============================
      // COMMERCIAL VALUE
      // ==============================

      projectValue: {
        type: Number,
        min: [
          0,
          "Project value cannot be negative",
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
      // PROJECT DATES
      // ==============================

      startDate: {
        type: Date,
        default: null,
      },

      deadline: {
        type: Date,
        default: null,
        index: true,
      },

      completedAt: {
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

      // ==============================
      // NOTES
      // ==============================

      notes: {
        type: String,
        trim: true,
        maxlength: [
          6000,
          "Project notes cannot exceed 6000 characters",
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

projectSchema.index(
  {
    createdBy: 1,
    projectNumber: 1,
  },
  {
    unique: true,
  }
);

// One sales opportunity becomes one project.
projectSchema.index(
  {
    createdBy: 1,
    lead: 1,
  },
  {
    unique: true,
  }
);

projectSchema.index({
  createdBy: 1,
  status: 1,
  createdAt: -1,
});

projectSchema.index({
  createdBy: 1,
  business: 1,
  createdAt: -1,
});

projectSchema.index({
  createdBy: 1,
  deadline: 1,
});

projectSchema.index({
  createdBy: 1,
  quotation: 1,
});

projectSchema.index({
  createdBy: 1,
  proposal: 1,
});

// ==============================
// MODEL
// ==============================

const Project = mongoose.model(
  "Project",
  projectSchema
);

module.exports = Project;