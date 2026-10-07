const Lead =
  require("../models/Lead");

const LeadActivity =
  require("../models/LeadActivity");

// ==============================
// CONSTANTS
// ==============================

const contactActivityTypes = [
  "phone_call",
  "whatsapp",
  "email",
  "sms",
  "meeting",
  "social_media",
  "other",
];

// ==============================
// VERIFY OWNED LEAD
// ==============================

const getOwnedLead = async (
  leadId,
  userId
) => {
  const lead =
    await Lead.findOne({
      _id: leadId,
      createdBy: userId,
    });

  if (!lead) {
    const error =
      new Error(
        "Lead not found"
      );

    error.statusCode = 404;

    throw error;
  }

  return lead;
};

// ==============================
// VERIFY OWNED ACTIVITY
// ==============================

const getOwnedActivity =
  async (
    activityId,
    userId
  ) => {
    const activity =
      await LeadActivity.findOne({
        _id: activityId,
        createdBy: userId,
      });

    if (!activity) {
      const error =
        new Error(
          "Lead activity not found"
        );

      error.statusCode = 404;

      throw error;
    }

    return activity;
  };

// ==============================
// POPULATE LEAD
// ==============================

const populateActivity =
  async (activity) => {
    await activity.populate(
      "lead",
      [
        "name",
        "companyName",
        "jobTitle",
        "email",
        "phone",
        "whatsapp",
        "preferredContactMethod",
        "status",
        "priority",
        "estimatedValue",
        "currency",
        "lastContactedAt",
        "nextFollowUpAt",
        "followUpCount",
      ].join(" ")
    );

    return activity;
  };

// ==============================
// RECALCULATE LEAD CONTACT SUMMARY
// ==============================

const recalculateLeadSummary =
  async (
    leadId,
    userId
  ) => {
    const lead =
      await Lead.findOne({
        _id: leadId,
        createdBy: userId,
      });

    if (!lead) {
      return null;
    }

    const [
      latestContact,
      nextPendingFollowUp,
      completedFollowUpCount,
    ] =
      await Promise.all([
        LeadActivity.findOne({
          createdBy: userId,
          lead: leadId,
          type: {
            $in:
              contactActivityTypes,
          },
        })
          .sort({
            contactedAt: -1,
          })
          .select(
            "contactedAt"
          ),

        LeadActivity.findOne({
          createdBy: userId,
          lead: leadId,
          followUpRequired:
            true,
          followUpStatus:
            "pending",
          nextFollowUpAt: {
            $ne: null,
          },
        })
          .sort({
            nextFollowUpAt: 1,
          })
          .select(
            "nextFollowUpAt"
          ),

        LeadActivity.countDocuments({
          createdBy: userId,
          lead: leadId,
          followUpStatus:
            "completed",
        }),
      ]);

    lead.lastContactedAt =
      latestContact?.contactedAt ||
      null;

    lead.nextFollowUpAt =
      nextPendingFollowUp
        ?.nextFollowUpAt ||
      null;

    lead.followUpCount =
      completedFollowUpCount;

    await lead.save();

    return lead;
  };

// ==============================
// APPLY PIPELINE STATUS
// ==============================

const applyLeadStatusFromActivity =
  (
    lead,
    activityData
  ) => {
    const {
      outcome,
      leadStatusAfter,
      followUpRequired,
      type,
    } = activityData;

    if (outcome === "won") {
      lead.status = "won";
      lead.wonAt =
        new Date();
      lead.lostAt = null;
      lead.lostReason = "";

      return;
    }

    if (outcome === "lost") {
      lead.status = "lost";
      lead.lostAt =
        new Date();
      lead.wonAt = null;

      return;
    }

    if (leadStatusAfter) {
      lead.status =
        leadStatusAfter;

      if (
        leadStatusAfter ===
        "won"
      ) {
        lead.wonAt =
          new Date();
        lead.lostAt = null;
        lead.lostReason =
          "";
      }

      if (
        leadStatusAfter ===
        "lost"
      ) {
        lead.lostAt =
          new Date();
        lead.wonAt = null;
      }

      return;
    }

    if (followUpRequired) {
      lead.status =
        "follow_up";

      return;
    }

    if (
      lead.status === "new" &&
      contactActivityTypes.includes(
        type
      )
    ) {
      lead.status =
        "contacted";
    }
  };

// ==============================
// NORMALIZE FOLLOW-UP FIELDS
// ==============================

const normalizeFollowUpData =
  (body) => {
    const followUpRequired =
      Boolean(
        body.followUpRequired
      );

    if (
      followUpRequired &&
      !body.nextFollowUpAt
    ) {
      const error =
        new Error(
          "Next follow-up date is required when follow-up is enabled"
        );

      error.statusCode = 400;

      throw error;
    }

    if (!followUpRequired) {
      return {
        followUpRequired:
          false,

        nextFollowUpAt:
          null,

        followUpNote:
          body.followUpNote ||
          "",

        followUpStatus:
          "not_required",

        followUpCompletedAt:
          null,
      };
    }

    return {
      followUpRequired:
        true,

      nextFollowUpAt:
        body.nextFollowUpAt,

      followUpNote:
        body.followUpNote ||
        "",

      followUpStatus:
        "pending",

      followUpCompletedAt:
        null,
    };
  };

// ==============================
// CREATE LEAD ACTIVITY
// ==============================

const createLeadActivity =
  async (
    req,
    res,
    next
  ) => {
    try {
      const lead =
        await getOwnedLead(
          req.params.leadId,
          req.user._id
        );

      const followUpData =
        normalizeFollowUpData(
          req.body
        );

      const activity =
        await LeadActivity.create(
          {
            createdBy:
              req.user._id,

            lead:
              lead._id,

            type:
              req.body.type,

            direction:
              req.body
                .direction,

            subject:
              req.body.subject,

            summary:
              req.body.summary,

            notes:
              req.body.notes,

            outcome:
              req.body.outcome,

            contactedAt:
              req.body
                .contactedAt ||
              new Date(),

            durationMinutes:
              req.body
                .durationMinutes,

            ...followUpData,

            leadStatusAfter:
              req.body
                .leadStatusAfter,
          }
        );

      applyLeadStatusFromActivity(
        lead,
        {
          outcome:
            activity.outcome,

          leadStatusAfter:
            activity
              .leadStatusAfter,

          followUpRequired:
            activity
              .followUpRequired,

          type:
            activity.type,
        }
      );

      await lead.save();

      await recalculateLeadSummary(
        lead._id,
        req.user._id
      );

      await populateActivity(
        activity
      );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Lead activity recorded successfully",

          activity,
        });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// GET ACTIVITIES FOR ONE LEAD
// ==============================

const getLeadActivities =
  async (
    req,
    res,
    next
  ) => {
    try {
      await getOwnedLead(
        req.params.leadId,
        req.user._id
      );

      const filter = {
        createdBy:
          req.user._id,

        lead:
          req.params.leadId,
      };

      if (
        req.query.type &&
        req.query.type !==
          "all"
      ) {
        filter.type =
          req.query.type;
      }

      if (
        req.query.outcome &&
        req.query.outcome !==
          "all"
      ) {
        filter.outcome =
          req.query.outcome;
      }

      if (
        req.query
          .followUpStatus &&
        req.query
          .followUpStatus !==
          "all"
      ) {
        filter.followUpStatus =
          req.query
            .followUpStatus;
      }

      const page =
        Math.max(
          Number.parseInt(
            req.query.page,
            10
          ) || 1,
          1
        );

      const requestedLimit =
        Number.parseInt(
          req.query.limit,
          10
        ) || 25;

      const limit =
        Math.min(
          Math.max(
            requestedLimit,
            1
          ),
          100
        );

      const skip =
        (page - 1) *
        limit;

      const [
        activities,
        total,
        pendingFollowUps,
        completedFollowUps,
      ] =
        await Promise.all([
          LeadActivity.find(
            filter
          )
            .sort({
              contactedAt: -1,
              createdAt: -1,
            })
            .skip(skip)
            .limit(limit),

          LeadActivity.countDocuments(
            filter
          ),

          LeadActivity.countDocuments(
            {
              createdBy:
                req.user._id,

              lead:
                req.params
                  .leadId,

              followUpStatus:
                "pending",
            }
          ),

          LeadActivity.countDocuments(
            {
              createdBy:
                req.user._id,

              lead:
                req.params
                  .leadId,

              followUpStatus:
                "completed",
            }
          ),
        ]);

      return res
        .status(200)
        .json({
          success: true,

          count:
            activities.length,

          total,

          page,

          pages:
            Math.max(
              Math.ceil(
                total /
                  limit
              ),
              1
            ),

          stats: {
            total,
            pendingFollowUps,
            completedFollowUps,
          },

          activities,
        });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// GET SINGLE ACTIVITY
// ==============================

const getLeadActivityById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const activity =
        await getOwnedActivity(
          req.params
            .activityId,
          req.user._id
        );

      await populateActivity(
        activity
      );

      return res
        .status(200)
        .json({
          success: true,
          activity,
        });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// UPDATE ACTIVITY
// ==============================

const updateLeadActivity =
  async (
    req,
    res,
    next
  ) => {
    try {
      const activity =
        await getOwnedActivity(
          req.params
            .activityId,
          req.user._id
        );

      const lead =
        await getOwnedLead(
          activity.lead,
          req.user._id
        );

      const allowedFields = [
        "type",
        "direction",
        "subject",
        "summary",
        "notes",
        "outcome",
        "contactedAt",
        "durationMinutes",
        "followUpNote",
        "leadStatusAfter",
      ];

      allowedFields.forEach(
        (field) => {
          if (
            req.body[field] !==
            undefined
          ) {
            activity[field] =
              req.body[field];
          }
        }
      );

      if (
        req.body
          .followUpRequired !==
          undefined ||
        req.body
          .nextFollowUpAt !==
          undefined
      ) {
        const followUpData =
          normalizeFollowUpData({
            followUpRequired:
              req.body
                .followUpRequired !==
              undefined
                ? req.body
                    .followUpRequired
                : activity
                    .followUpRequired,

            nextFollowUpAt:
              req.body
                .nextFollowUpAt !==
              undefined
                ? req.body
                    .nextFollowUpAt
                : activity
                    .nextFollowUpAt,

            followUpNote:
              req.body
                .followUpNote !==
              undefined
                ? req.body
                    .followUpNote
                : activity
                    .followUpNote,
          });

        activity.followUpRequired =
          followUpData
            .followUpRequired;

        activity.nextFollowUpAt =
          followUpData
            .nextFollowUpAt;

        activity.followUpNote =
          followUpData
            .followUpNote;

        activity.followUpStatus =
          followUpData
            .followUpStatus;

        activity.followUpCompletedAt =
          followUpData
            .followUpCompletedAt;
      }

      applyLeadStatusFromActivity(
        lead,
        {
          outcome:
            activity.outcome,

          leadStatusAfter:
            activity
              .leadStatusAfter,

          followUpRequired:
            activity
              .followUpRequired,

          type:
            activity.type,
        }
      );

      await Promise.all([
        activity.save(),
        lead.save(),
      ]);

      await recalculateLeadSummary(
        lead._id,
        req.user._id
      );

      await populateActivity(
        activity
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Lead activity updated successfully",

          activity,
        });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// COMPLETE FOLLOW-UP
// ==============================

const completeFollowUp =
  async (
    req,
    res,
    next
  ) => {
    try {
      const activity =
        await getOwnedActivity(
          req.params
            .activityId,
          req.user._id
        );

      if (
        !activity
          .followUpRequired
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "This activity does not require a follow-up",
          });
      }

      if (
        activity
          .followUpStatus ===
        "completed"
      ) {
        return res
          .status(200)
          .json({
            success: true,

            message:
              "Follow-up is already completed",

            activity,
          });
      }

      if (
        activity
          .followUpStatus ===
        "cancelled"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A cancelled follow-up cannot be completed",
          });
      }

      activity.followUpStatus =
        "completed";

      activity.followUpCompletedAt =
        new Date();

      await activity.save();

      await recalculateLeadSummary(
        activity.lead,
        req.user._id
      );

      await populateActivity(
        activity
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Follow-up completed successfully",

          activity,
        });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// CANCEL FOLLOW-UP
// ==============================

const cancelFollowUp =
  async (
    req,
    res,
    next
  ) => {
    try {
      const activity =
        await getOwnedActivity(
          req.params
            .activityId,
          req.user._id
        );

      if (
        !activity
          .followUpRequired
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "This activity does not require a follow-up",
          });
      }

      if (
        activity
          .followUpStatus ===
        "completed"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A completed follow-up cannot be cancelled",
          });
      }

      activity.followUpStatus =
        "cancelled";

      activity.followUpCompletedAt =
        null;

      await activity.save();

      await recalculateLeadSummary(
        activity.lead,
        req.user._id
      );

      await populateActivity(
        activity
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Follow-up cancelled successfully",

          activity,
        });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// GET FOLLOW-UP WORKSPACE
// ==============================

const getFollowUps =
  async (
    req,
    res,
    next
  ) => {
    try {
      const now =
        new Date();

      const startOfToday =
        new Date(now);

      startOfToday.setHours(
        0,
        0,
        0,
        0
      );

      const endOfToday =
        new Date(now);

      endOfToday.setHours(
        23,
        59,
        59,
        999
      );

      const filter = {
        createdBy:
          req.user._id,

        followUpRequired:
          true,

        followUpStatus:
          "pending",

        nextFollowUpAt: {
          $ne: null,
        },
      };

      const view =
        req.query.view ||
        "all";

      if (view === "overdue") {
        filter.nextFollowUpAt =
          {
            $lt:
              startOfToday,
          };
      }

      if (view === "today") {
        filter.nextFollowUpAt =
          {
            $gte:
              startOfToday,

            $lte:
              endOfToday,
          };
      }

      if (view === "upcoming") {
        filter.nextFollowUpAt =
          {
            $gt:
              endOfToday,
          };
      }

      const page =
        Math.max(
          Number.parseInt(
            req.query.page,
            10
          ) || 1,
          1
        );

      const requestedLimit =
        Number.parseInt(
          req.query.limit,
          10
        ) || 25;

      const limit =
        Math.min(
          Math.max(
            requestedLimit,
            1
          ),
          100
        );

      const skip =
        (page - 1) *
        limit;

      const [
        followUps,
        total,
        allPending,
        overdue,
        dueToday,
        upcoming,
      ] =
        await Promise.all([
          LeadActivity.find(
            filter
          )
            .populate(
              "lead",
              [
                "name",
                "companyName",
                "phone",
                "email",
                "whatsapp",
                "preferredContactMethod",
                "status",
                "priority",
                "estimatedValue",
                "currency",
              ].join(
                " "
              )
            )
            .sort({
              nextFollowUpAt: 1,
            })
            .skip(skip)
            .limit(limit),

          LeadActivity.countDocuments(
            filter
          ),

          LeadActivity.countDocuments(
            {
              createdBy:
                req.user._id,

              followUpRequired:
                true,

              followUpStatus:
                "pending",

              nextFollowUpAt: {
                $ne: null,
              },
            }
          ),

          LeadActivity.countDocuments(
            {
              createdBy:
                req.user._id,

              followUpRequired:
                true,

              followUpStatus:
                "pending",

              nextFollowUpAt: {
                $lt:
                  startOfToday,
              },
            }
          ),

          LeadActivity.countDocuments(
            {
              createdBy:
                req.user._id,

              followUpRequired:
                true,

              followUpStatus:
                "pending",

              nextFollowUpAt: {
                $gte:
                  startOfToday,

                $lte:
                  endOfToday,
              },
            }
          ),

          LeadActivity.countDocuments(
            {
              createdBy:
                req.user._id,

              followUpRequired:
                true,

              followUpStatus:
                "pending",

              nextFollowUpAt: {
                $gt:
                  endOfToday,
              },
            }
          ),
        ]);

      return res
        .status(200)
        .json({
          success: true,

          count:
            followUps.length,

          total,

          page,

          pages:
            Math.max(
              Math.ceil(
                total /
                  limit
              ),
              1
            ),

          view,

          stats: {
            pending:
              allPending,

            overdue,

            dueToday,

            upcoming,
          },

          followUps,
        });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// DELETE ACTIVITY
// ==============================

const deleteLeadActivity =
  async (
    req,
    res,
    next
  ) => {
    try {
      const activity =
        await getOwnedActivity(
          req.params
            .activityId,
          req.user._id
        );

      const leadId =
        activity.lead;

      await activity.deleteOne();

      await recalculateLeadSummary(
        leadId,
        req.user._id
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Lead activity deleted successfully",
        });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// EXPORTS
// ==============================

module.exports = {
  createLeadActivity,
  getLeadActivities,
  getLeadActivityById,
  updateLeadActivity,
  completeFollowUp,
  cancelFollowUp,
  getFollowUps,
  deleteLeadActivity,
};