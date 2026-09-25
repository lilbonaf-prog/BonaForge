const Lead = require("../models/Lead");
const Business = require("../models/Business");

// ==============================
// VERIFY BUSINESS OWNERSHIP
// ==============================

const verifyOwnedBusiness = async (
  businessId,
  userId
) => {
  if (!businessId) {
    return null;
  }

  const business =
    await Business.findOne({
      _id: businessId,
      createdBy: userId,
    });

  if (!business) {
    const error =
      new Error(
        "Business not found"
      );

    error.statusCode = 404;

    throw error;
  }

  return business;
};

// ==============================
// RESTORE BUSINESS AFTER
// LINKED LEAD IS DELETED
// ==============================

const restoreBusinessAfterLeadDeletion =
  async (
    businessId,
    userId
  ) => {
    if (!businessId) {
      return;
    }

    // Safety check in case legacy duplicate
    // leads ever exist in the database.
    const anotherLead =
      await Lead.exists({
        createdBy: userId,
        business: businessId,
      });

    if (anotherLead) {
      return;
    }

    const business =
      await Business.findOne({
        _id: businessId,
        createdBy: userId,
      });

    if (!business) {
      return;
    }

    business.convertedToLead =
      false;

    // Only restore the status when the
    // business is currently marked converted.
    // Do not overwrite another legitimate
    // business status.
    if (
      business.status ===
      "converted"
    ) {
      business.status =
        business.researchCompleted
          ? "researched"
          : "saved";
    }

    await business.save();
  };

// ==============================
// CREATE LEAD
// ==============================

const createLead = async (
  req,
  res,
  next
) => {
  try {
    if (req.body.business) {
      await verifyOwnedBusiness(
        req.body.business,
        req.user._id
      );
    }

    const lead =
      await Lead.create({
        createdBy:
          req.user._id,

        business:
          req.body.business ||
          null,

        name:
          req.body.name,

        companyName:
          req.body.companyName,

        jobTitle:
          req.body.jobTitle,

        email:
          req.body.email,

        phone:
          req.body.phone,

        whatsapp:
          req.body.whatsapp,

        preferredContactMethod:
          req.body
            .preferredContactMethod,

        status:
          req.body.status,

        priority:
          req.body.priority,

        estimatedValue:
          req.body.estimatedValue,

        currency:
          req.body.currency,

        lastContactedAt:
          req.body.lastContactedAt,

        nextFollowUpAt:
          req.body.nextFollowUpAt,

        servicesInterestedIn:
          req.body
            .servicesInterestedIn,

        opportunitySummary:
          req.body
            .opportunitySummary,

        source:
          req.body.source,

        sourceDetails:
          req.body.sourceDetails,

        notes:
          req.body.notes,
      });

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Lead created successfully",

        lead,
      });
  } catch (error) {
    next(error);
  }
};

// ==============================
// GET ALL LEADS
// ==============================

const getLeads = async (
  req,
  res,
  next
) => {
  try {
    const filter = {
      createdBy:
        req.user._id,
    };

    if (
      req.query.status &&
      req.query.status !==
        "all"
    ) {
      filter.status =
        req.query.status;
    }

    if (
      req.query.priority &&
      req.query.priority !==
        "all"
    ) {
      filter.priority =
        req.query.priority;
    }

    const search =
      req.query.search
        ?.trim();

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          companyName: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },

        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },

        {
          whatsapp: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const page = Math.max(
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
      ) || 20;

    const limit = Math.min(
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
      leads,
      total,
    ] =
      await Promise.all([
        Lead.find(filter)
          .populate(
            "business",
            "name industry website status"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit),

        Lead.countDocuments(
          filter
        ),
      ]);

    return res
      .status(200)
      .json({
        success: true,

        count:
          leads.length,

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

        leads,
      });
  } catch (error) {
    next(error);
  }
};

// ==============================
// GET SINGLE LEAD
// ==============================

const getLeadById = async (
  req,
  res,
  next
) => {
  try {
    const lead =
      await Lead.findOne({
        _id: req.params.id,
        createdBy:
          req.user._id,
      }).populate(
        "business",
        "name industry description phone email website location status"
      );

    if (!lead) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Lead not found",
        });
    }

    return res
      .status(200)
      .json({
        success: true,
        lead,
      });
  } catch (error) {
    next(error);
  }
};

// ==============================
// UPDATE LEAD
// ==============================

const updateLead = async (
  req,
  res,
  next
) => {
  try {
    const lead =
      await Lead.findOne({
        _id: req.params.id,
        createdBy:
          req.user._id,
      });

    if (!lead) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Lead not found",
        });
    }

    if (
      req.body.business !==
      undefined
    ) {
      if (
        req.body.business
      ) {
        await verifyOwnedBusiness(
          req.body.business,
          req.user._id
        );

        lead.business =
          req.body.business;
      } else {
        lead.business =
          null;
      }
    }

    const allowedFields = [
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
      "servicesInterestedIn",
      "opportunitySummary",
      "wonAt",
      "lostAt",
      "lostReason",
      "source",
      "sourceDetails",
      "notes",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          lead[field] =
            req.body[field];
        }
      }
    );

    await lead.save();

    await lead.populate(
      "business",
      "name industry website status"
    );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Lead updated successfully",

        lead,
      });
  } catch (error) {
    next(error);
  }
};

// ==============================
// DELETE LEAD
// ==============================

const deleteLead = async (
  req,
  res,
  next
) => {
  try {
    const lead =
      await Lead.findOne({
        _id: req.params.id,
        createdBy:
          req.user._id,
      });

    if (!lead) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Lead not found",
        });
    }

    // Save the linked Business ID before
    // deleting the Lead.
    const linkedBusinessId =
      lead.business;

    await lead.deleteOne();

    // If this Lead came from or was linked
    // to a Business, restore that Business
    // so it can be converted again later.
    if (linkedBusinessId) {
      await restoreBusinessAfterLeadDeletion(
        linkedBusinessId,
        req.user._id
      );
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Lead deleted successfully",
      });
  } catch (error) {
    next(error);
  }
};

// ==============================
// CONVERT BUSINESS TO LEAD
// ==============================

const convertBusinessToLead =
  async (
    req,
    res,
    next
  ) => {
    try {
      const business =
        await Business.findOne({
          _id:
            req.params
              .businessId,

          createdBy:
            req.user._id,
        });

      if (!business) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Business not found",
          });
      }

      const existingLead =
        await Lead.findOne({
          createdBy:
            req.user._id,

          business:
            business._id,
        });

      if (existingLead) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "This business has already been converted to a lead",
          });
      }

      const lead =
        await Lead.create({
          createdBy:
            req.user._id,

          business:
            business._id,

          name:
            req.body.name ||
            business.name,

          companyName:
            business.name,

          jobTitle:
            req.body
              .jobTitle ||
            "",

          email:
            req.body.email ??
            business.email ??
            "",

          phone:
            req.body.phone ??
            business.phone ??
            "",

          whatsapp:
            req.body
              .whatsapp ||
            "",

          preferredContactMethod:
            req.body
              .preferredContactMethod ||
            "whatsapp",

          status:
            "new",

          priority:
            req.body
              .priority ||
            "medium",

          estimatedValue:
            req.body
              .estimatedValue ??
            0,

          currency:
            req.body
              .currency ||
            "GHS",

          servicesInterestedIn:
            req.body
              .servicesInterestedIn ||
            [],

          opportunitySummary:
            req.body
              .opportunitySummary ||
            "",

          source:
            "business_conversion",

          sourceDetails:
            `Converted from business: ${business.name}`,

          notes:
            req.body.notes ||
            "",
        });

      business.convertedToLead =
        true;

      business.status =
        "converted";

      await business.save();

      await lead.populate(
        "business",
        "name industry website status"
      );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Business converted to lead successfully",

          lead,
        });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertBusinessToLead,
};