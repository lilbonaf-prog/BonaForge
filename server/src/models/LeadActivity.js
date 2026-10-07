const mongoose =
  require("mongoose");

const leadActivitySchema =
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
      // LEAD CONNECTION
      // ==============================

      lead: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Lead",
        required: true,
        index: true,
      },

      // ==============================
      // CONTACT METHOD
      // ==============================

      type: {
        type: String,
        enum: [
          "phone_call",
          "whatsapp",
          "email",
          "sms",
          "meeting",
          "social_media",
          "note",
          "other",
        ],
        required: true,
        default: "phone_call",
        index: true,
      },

      direction: {
        type: String,
        enum: [
          "outbound",
          "inbound",
          "internal",
        ],
        default: "outbound",
      },

      // ==============================
      // CONTACT DETAILS
      // ==============================

      subject: {
        type: String,
        trim: true,
        maxlength: [
          200,
          "Activity subject cannot exceed 200 characters",
        ],
        default: "",
      },

      summary: {
        type: String,
        trim: true,
        maxlength: [
          1000,
          "Activity summary cannot exceed 1000 characters",
        ],
        default: "",
      },

      notes: {
        type: String,
        trim: true,
        maxlength: [
          4000,
          "Activity notes cannot exceed 4000 characters",
        ],
        default: "",
      },

      // ==============================
      // OUTCOME
      // ==============================

      outcome: {
        type: String,
        enum: [
          "connected",
          "no_answer",
          "left_message",
          "replied",
          "interested",
          "not_interested",
          "follow_up_required",
          "meeting_scheduled",
          "proposal_requested",
          "quotation_requested",
          "won",
          "lost",
          "other",
        ],
        default: "other",
        index: true,
      },

      // ==============================
      // ACTIVITY TIMING
      // ==============================

      contactedAt: {
        type: Date,
        default: Date.now,
        index: true,
      },

      durationMinutes: {
        type: Number,
        min: [
          0,
          "Duration cannot be negative",
        ],
        max: [
          1440,
          "Duration cannot exceed 1440 minutes",
        ],
        default: 0,
      },

      // ==============================
      // FOLLOW-UP
      // ==============================

      followUpRequired: {
        type: Boolean,
        default: false,
        index: true,
      },

      nextFollowUpAt: {
        type: Date,
        default: null,
        index: true,
      },

      followUpNote: {
        type: String,
        trim: true,
        maxlength: [
          1000,
          "Follow-up note cannot exceed 1000 characters",
        ],
        default: "",
      },

      followUpStatus: {
        type: String,
        enum: [
          "not_required",
          "pending",
          "completed",
          "cancelled",
        ],
        default: "not_required",
        index: true,
      },

      followUpCompletedAt: {
        type: Date,
        default: null,
      },

      // ==============================
      // PIPELINE CONTEXT
      // ==============================

      leadStatusAfter: {
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
        default: undefined,
      },
    },
    {
      timestamps: true,
    }
  );

// ==============================
// INDEXES
// ==============================

leadActivitySchema.index({
  createdBy: 1,
  lead: 1,
  contactedAt: -1,
});

leadActivitySchema.index({
  createdBy: 1,
  nextFollowUpAt: 1,
});

leadActivitySchema.index({
  createdBy: 1,
  followUpStatus: 1,
  nextFollowUpAt: 1,
});

leadActivitySchema.index({
  createdBy: 1,
  lead: 1,
  followUpStatus: 1,
  nextFollowUpAt: 1,
});

leadActivitySchema.index({
  createdBy: 1,
  type: 1,
  contactedAt: -1,
});

// ==============================
// MODEL
// ==============================

const LeadActivity =
  mongoose.model(
    "LeadActivity",
    leadActivitySchema
  );

module.exports =
  LeadActivity;