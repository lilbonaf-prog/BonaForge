const Business = require("../models/Business");
const WebsiteAudit = require("../models/WebsiteAudit");

const businessPopulateFields =
  "name industry website phone email status websiteAuditCompleted";

const NO_WEBSITE_SUMMARY =
  "This business does not currently have a website.";

const NO_WEBSITE_NEXT_STEP =
  "Discuss website requirements, business goals, content needs and budget with the prospect.";

const NO_WEBSITE_OPPORTUNITY = {
  title: "Create a professional website",
  service: "Website Development",
  priority: "high",
  impact: "high",
  description:
    "The business currently has no website, creating a clear opportunity for website development and digital presence services.",
};

// ==============================
// OWNERSHIP HELPER
// ==============================

const getOwnedBusiness = async (
  businessId,
  userId
) => {
  const business =
    await Business.findOne({
      _id: businessId,
      createdBy: userId,
    });

  if (!business) {
    const error = new Error(
      "Business not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return business;
};

// ==============================
// GET ALL WEBSITE AUDITS
// ==============================

const getWebsiteAuditList =
  async (req, res) => {
    const {
      status = "all",
      search = "",
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber =
      Math.max(
        Number.parseInt(
          page,
          10
        ) || 1,
        1
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number.parseInt(
            limit,
            10
          ) || 20,
          1
        ),
        100
      );

    const query = {
      createdBy:
        req.user._id,
    };

    if (
      status !== "all" &&
      [
        "draft",
        "in_progress",
        "completed",
        "not_applicable",
      ].includes(status)
    ) {
      query.status = status;
    }

    const normalizedSearch =
      search.trim();

    if (normalizedSearch) {
      const escaped =
        normalizedSearch.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      const regex =
        new RegExp(
          escaped,
          "i"
        );

      const matchingBusinesses =
        await Business.find({
          createdBy:
            req.user._id,

          $or: [
            {
              name: regex,
            },
            {
              industry: regex,
            },
            {
              email: regex,
            },
            {
              phone: regex,
            },
            {
              website: regex,
            },
          ],
        }).select("_id");

      const businessIds =
        matchingBusinesses.map(
          (business) =>
            business._id
        );

      query.$or = [
        {
          business: {
            $in: businessIds,
          },
        },
        {
          websiteUrl: regex,
        },
        {
          summary: regex,
        },
        {
          nextStep: regex,
        },
        {
          notes: regex,
        },
        {
          recommendedServices:
            regex,
        },
      ];
    }

    const skip =
      (pageNumber - 1) *
      limitNumber;

    const [
      audits,
      total,
      totalAudits,
      draftCount,
      inProgressCount,
      completedCount,
      notApplicableCount,
    ] = await Promise.all([
      WebsiteAudit.find(
        query
      )
        .populate(
          "business",
          businessPopulateFields
        )
        .sort({
          updatedAt: -1,
        })
        .skip(skip)
        .limit(
          limitNumber
        ),

      WebsiteAudit.countDocuments(
        query
      ),

      WebsiteAudit.countDocuments({
        createdBy:
          req.user._id,
      }),

      WebsiteAudit.countDocuments({
        createdBy:
          req.user._id,
        status: "draft",
      }),

      WebsiteAudit.countDocuments({
        createdBy:
          req.user._id,
        status:
          "in_progress",
      }),

      WebsiteAudit.countDocuments({
        createdBy:
          req.user._id,
        status:
          "completed",
      }),

      WebsiteAudit.countDocuments({
        createdBy:
          req.user._id,
        status:
          "not_applicable",
      }),
    ]);

    res.status(200).json({
      success: true,
      count:
        audits.length,
      total,
      page: pageNumber,
      pages: Math.max(
        Math.ceil(
          total /
            limitNumber
        ),
        1
      ),

      stats: {
        total:
          totalAudits,
        draft:
          draftCount,
        inProgress:
          inProgressCount,
        completed:
          completedCount,
        notApplicable:
          notApplicableCount,
      },

      audits,
    });
  };

// ==============================
// GET AUDIT BY BUSINESS
// ==============================

const getAuditByBusiness =
  async (req, res) => {
    const business =
      await getOwnedBusiness(
        req.params.businessId,
        req.user._id
      );

    const audit =
      await WebsiteAudit.findOne({
        business:
          business._id,
        createdBy:
          req.user._id,
      }).populate(
        "business",
        businessPopulateFields
      );

    res.status(200).json({
      success: true,
      audit,
    });
  };

// ==============================
// START WEBSITE AUDIT
// ==============================

const startAudit =
  async (req, res) => {
    const business =
      await getOwnedBusiness(
        req.params.businessId,
        req.user._id
      );

    const websiteUrl =
      business.website?.trim() ||
      "";

    const hasWebsite =
      Boolean(websiteUrl);

    const existingAudit =
      await WebsiteAudit.findOne({
        business:
          business._id,
        createdBy:
          req.user._id,
      });

    // ==============================
    // EXISTING AUDIT
    // ==============================

    if (existingAudit) {
      // ==============================
      // WEBSITE ADDED LATER
      // ==============================

      if (
        existingAudit.status ===
          "not_applicable" &&
        hasWebsite
      ) {
        existingAudit.status =
          "in_progress";

        existingAudit.websiteAvailable =
          true;

        existingAudit.websiteUrl =
          websiteUrl;

        existingAudit.startedAt =
          new Date();

        existingAudit.completedAt =
          null;

        if (
          existingAudit.summary ===
          NO_WEBSITE_SUMMARY
        ) {
          existingAudit.summary =
            "";
        }

        if (
          existingAudit.nextStep ===
          NO_WEBSITE_NEXT_STEP
        ) {
          existingAudit.nextStep =
            "";
        }

        existingAudit.opportunities =
          existingAudit.opportunities.filter(
            (opportunity) =>
              !(
                opportunity.title ===
                  NO_WEBSITE_OPPORTUNITY.title &&
                opportunity.service ===
                  NO_WEBSITE_OPPORTUNITY.service
              )
          );

        if (
          existingAudit
            .recommendedServices
            .length === 1 &&
          existingAudit
            .recommendedServices[0] ===
            "Website Development"
        ) {
          existingAudit.recommendedServices =
            [];
        }

        await existingAudit.save();

        business.websiteAuditCompleted =
          false;

        await business.save();

        await existingAudit.populate(
          "business",
          businessPopulateFields
        );

        return res
          .status(200)
          .json({
            success: true,
            message:
              "Website detected. Website audit is now in progress",
            audit:
              existingAudit,
          });
      }

      // ==============================
      // WEBSITE REMOVED LATER
      // ==============================

      if (
        !hasWebsite &&
        existingAudit.status !==
          "not_applicable"
      ) {
        existingAudit.status =
          "not_applicable";

        existingAudit.websiteAvailable =
          false;

        existingAudit.websiteUrl =
          "";

        existingAudit.completedAt =
          new Date();

        existingAudit.summary =
          NO_WEBSITE_SUMMARY;

        existingAudit.nextStep =
          NO_WEBSITE_NEXT_STEP;

        const alreadyHasNoWebsiteOpportunity =
          existingAudit.opportunities.some(
            (opportunity) =>
              opportunity.title ===
                NO_WEBSITE_OPPORTUNITY.title &&
              opportunity.service ===
                NO_WEBSITE_OPPORTUNITY.service
          );

        if (
          !alreadyHasNoWebsiteOpportunity
        ) {
          existingAudit.opportunities.push(
            NO_WEBSITE_OPPORTUNITY
          );
        }

        const alreadyRecommendsWebsiteDevelopment =
          existingAudit.recommendedServices.includes(
            "Website Development"
          );

        if (
          !alreadyRecommendsWebsiteDevelopment
        ) {
          existingAudit.recommendedServices.push(
            "Website Development"
          );
        }

        await existingAudit.save();

        business.websiteAuditCompleted =
          true;

        await business.save();

        await existingAudit.populate(
          "business",
          businessPopulateFields
        );

        return res
          .status(200)
          .json({
            success: true,
            message:
              "Website removed. Website audit marked not applicable",
            audit:
              existingAudit,
          });
      }

      // ==============================
      // KEEP WEBSITE URL SYNCHRONIZED
      // ==============================

      if (
        hasWebsite &&
        (
          existingAudit.websiteUrl !==
            websiteUrl ||
          existingAudit.websiteAvailable !==
            true
        )
      ) {
        existingAudit.websiteUrl =
          websiteUrl;

        existingAudit.websiteAvailable =
          true;

        await existingAudit.save();
      }

      await existingAudit.populate(
        "business",
        businessPopulateFields
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Website audit already exists",
          audit:
            existingAudit,
        });
    }

    // ==============================
    // CREATE NEW AUDIT
    // ==============================

    const audit =
      await WebsiteAudit.create(
        {
          createdBy:
            req.user._id,

          business:
            business._id,

          status:
            hasWebsite
              ? "in_progress"
              : "not_applicable",

          websiteAvailable:
            hasWebsite,

          websiteUrl,

          auditMode:
            "manual",

          startedAt:
            new Date(),

          completedAt:
            hasWebsite
              ? null
              : new Date(),

          summary:
            hasWebsite
              ? ""
              : NO_WEBSITE_SUMMARY,

          opportunities:
            hasWebsite
              ? []
              : [
                  NO_WEBSITE_OPPORTUNITY,
                ],

          recommendedServices:
            hasWebsite
              ? []
              : [
                  "Website Development",
                ],

          nextStep:
            hasWebsite
              ? ""
              : NO_WEBSITE_NEXT_STEP,
        }
      );

    business.websiteAuditCompleted =
      !hasWebsite;

    await business.save();

    await audit.populate(
      "business",
      businessPopulateFields
    );

    res.status(201).json({
      success: true,
      message: hasWebsite
        ? "Website audit started successfully"
        : "Website audit marked not applicable because the business has no website",
      audit,
    });
  };

// ==============================
// UPDATE WEBSITE AUDIT
// ==============================

const updateAudit =
  async (req, res) => {
    const audit =
      await WebsiteAudit.findOne({
        _id:
          req.params.auditId,
        createdBy:
          req.user._id,
      });

    if (!audit) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Website audit not found",
        });
    }

    const allowedFields = [
      "websiteUrl",
      "auditMode",
      "overallScore",
      "scores",
      "technicalChecks",
      "summary",
      "strengths",
      "issues",
      "opportunities",
      "recommendedServices",
      "nextStep",
      "notes",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          Object.prototype.hasOwnProperty.call(
            req.body,
            field
          )
        ) {
          audit[field] =
            req.body[field];
        }
      }
    );

    await audit.save();

    await audit.populate(
      "business",
      businessPopulateFields
    );

    res.status(200).json({
      success: true,
      message:
        "Website audit updated successfully",
      audit,
    });
  };

// ==============================
// COMPLETE WEBSITE AUDIT
// ==============================

const completeAudit =
  async (req, res) => {
    const audit =
      await WebsiteAudit.findOne({
        _id:
          req.params.auditId,
        createdBy:
          req.user._id,
      });

    if (!audit) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Website audit not found",
        });
    }

    if (
      audit.status ===
      "not_applicable"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "This website audit is not applicable because the business has no website",
        });
    }

    const business =
      await getOwnedBusiness(
        audit.business,
        req.user._id
      );

    audit.status =
      "completed";

    audit.completedAt =
      new Date();

    if (!audit.startedAt) {
      audit.startedAt =
        new Date();
    }

    await audit.save();

    business.websiteAuditCompleted =
      true;

    await business.save();

    await audit.populate(
      "business",
      businessPopulateFields
    );

    res.status(200).json({
      success: true,
      message:
        "Website audit completed successfully",
      audit,
    });
  };

// ==============================
// REOPEN WEBSITE AUDIT
// ==============================

const reopenAudit =
  async (req, res) => {
    const audit =
      await WebsiteAudit.findOne({
        _id:
          req.params.auditId,
        createdBy:
          req.user._id,
      });

    if (!audit) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Website audit not found",
        });
    }

    if (
      audit.status ===
      "not_applicable"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "A not-applicable audit cannot be reopened while the business has no website",
        });
    }

    const business =
      await getOwnedBusiness(
        audit.business,
        req.user._id
      );

    audit.status =
      "in_progress";

    audit.completedAt =
      null;

    if (!audit.startedAt) {
      audit.startedAt =
        new Date();
    }

    await audit.save();

    business.websiteAuditCompleted =
      false;

    await business.save();

    await audit.populate(
      "business",
      businessPopulateFields
    );

    res.status(200).json({
      success: true,
      message:
        "Website audit reopened successfully",
      audit,
    });
  };

module.exports = {
  getWebsiteAuditList,
  getAuditByBusiness,
  startAudit,
  updateAudit,
  completeAudit,
  reopenAudit,
};