const Business = require(
  "../models/Business"
);

const BusinessResearch = require(
  "../models/BusinessResearch"
);

const WebsiteAudit = require(
  "../models/WebsiteAudit"
);

const OpportunityAnalysis = require(
  "../models/OpportunityAnalysis"
);

const businessPopulateFields =
  "name industry website phone email status researchCompleted websiteAuditCompleted opportunityAnalysisCompleted convertedToLead";

// ==============================
// HELPERS
// ==============================

const escapeRegex = (
  value = ""
) =>
  value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

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

const limitText = (
  value,
  maxLength
) => {
  if (!value) {
    return "";
  }

  const text =
    String(value).trim();

  if (
    text.length <= maxLength
  ) {
    return text;
  }

  return text.slice(
    0,
    maxLength
  );
};

const inferCategory = (
  value = ""
) => {
  const text = String(value)
    .trim()
    .toLowerCase();

  if (
    text.includes("website")
  ) {
    return "website";
  }

  if (
    text.includes("seo") ||
    text.includes(
      "search engine"
    )
  ) {
    return "seo";
  }

  if (
    text.includes("brand")
  ) {
    return "branding";
  }

  if (
    text.includes("social")
  ) {
    return "social_media";
  }

  if (
    text.includes("content")
  ) {
    return "content";
  }

  if (
    text.includes("automation")
  ) {
    return "automation";
  }

  if (
    text.includes("crm")
  ) {
    return "crm";
  }

  if (
    text.includes("lead")
  ) {
    return "lead_generation";
  }

  if (
    text.includes("ecommerce") ||
    text.includes("e-commerce")
  ) {
    return "ecommerce";
  }

  if (
    text.includes("analytics")
  ) {
    return "analytics";
  }

  if (
    text.includes("design") ||
    text.includes("ux") ||
    text.includes("ui")
  ) {
    return "design";
  }

  if (
    text.includes("development") ||
    text.includes("technical") ||
    text.includes("performance") ||
    text.includes("security") ||
    text.includes(
      "accessibility"
    )
  ) {
    return "development";
  }

  if (
    text.includes("marketing")
  ) {
    return "marketing";
  }

  return "other";
};

const normalizeIssueCategory = (
  category = ""
) => {
  const map = {
    performance: "development",
    mobile: "development",
    seo: "seo",
    accessibility: "development",
    content: "content",
    security: "development",
    trust: "branding",
    ux: "design",
    technical: "development",
    other: "other",
  };

  return (
    map[category] ||
    "other"
  );
};

const normalizePriority = (
  value
) => {
  const allowed = [
    "low",
    "medium",
    "high",
    "urgent",
  ];

  return allowed.includes(value)
    ? value
    : "medium";
};

const normalizeImpact = (
  value
) => {
  const allowed = [
    "low",
    "medium",
    "high",
  ];

  return allowed.includes(value)
    ? value
    : "medium";
};

const priorityRank = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

const highestPriority = (
  first = "medium",
  second = "medium"
) => {
  const firstValue =
    normalizePriority(first);

  const secondValue =
    normalizePriority(second);

  return priorityRank[
    secondValue
  ] >
    priorityRank[firstValue]
    ? secondValue
    : firstValue;
};

const populateAnalysis =
  async (analysis) => {
    if (!analysis) {
      return analysis;
    }

    await analysis.populate(
      "business",
      businessPopulateFields
    );

    await analysis.populate({
      path: "research",
      select:
        "status opportunities keyFindings recommendedApproach completedAt updatedAt",
    });

    await analysis.populate({
      path: "websiteAudit",
      select:
        "status websiteAvailable websiteUrl overallScore issues opportunities recommendedServices nextStep completedAt updatedAt",
    });

    return analysis;
  };

// ==============================
// BUILD DETECTED OPPORTUNITIES
// ==============================

const buildDetectedOpportunities =
  (
    research,
    websiteAudit
  ) => {
    const opportunities = [];

    const addOpportunity = (
      item
    ) => {
      if (!item?.title) {
        return;
      }

      const normalizedTitle =
        item.title
          .trim()
          .toLowerCase();

      if (!normalizedTitle) {
        return;
      }

      const existing =
        opportunities.find(
          (opportunity) =>
            opportunity.title
              .trim()
              .toLowerCase() ===
            normalizedTitle
        );

      if (existing) {
        if (
          existing.source !==
          item.source
        ) {
          existing.source =
            "combined";
        }

        existing.priority =
          highestPriority(
            existing.priority,
            item.priority
          );

        if (
          item.impact === "high"
        ) {
          existing.impact =
            "high";
        }

        return;
      }

      opportunities.push({
        title: limitText(
          item.title,
          200
        ),

        category:
          item.category ||
          "other",

        source:
          item.source ||
          "manual",

        priority:
          normalizePriority(
            item.priority
          ),

        impact:
          normalizeImpact(
            item.impact
          ),

        confidence:
          item.confidence ||
          "medium",

        problem: limitText(
          item.problem,
          2000
        ),

        evidence: limitText(
          item.evidence,
          2000
        ),

        businessImpact:
          limitText(
            item.businessImpact,
            2000
          ),

        recommendedAction:
          limitText(
            item.recommendedAction,
            2000
          ),
      });
    };

    // ==============================
    // RESEARCH OPPORTUNITIES
    // ==============================

    if (
      Array.isArray(
        research?.opportunities
      )
    ) {
      research.opportunities.forEach(
        (opportunity) => {
          const text =
            String(
              opportunity || ""
            ).trim();

          if (!text) {
            return;
          }

          addOpportunity({
            title: text,
            category:
              inferCategory(text),
            source: "research",
            priority: "medium",
            impact: "medium",
            confidence: "medium",
            problem: text,
            evidence:
              "Identified during business research.",
          });
        }
      );
    }

    // ==============================
    // WEBSITE AUDIT OPPORTUNITIES
    // ==============================

    if (
      Array.isArray(
        websiteAudit
          ?.opportunities
      )
    ) {
      websiteAudit.opportunities.forEach(
        (opportunity) => {
          addOpportunity({
            title:
              opportunity.title,

            category:
              inferCategory(
                opportunity.service ||
                  opportunity.title
              ),

            source:
              "website_audit",

            priority:
              opportunity.priority,

            impact:
              opportunity.impact,

            confidence: "high",

            problem:
              opportunity.description,

            evidence:
              websiteAudit.summary ||
              "Identified during the website audit.",

            recommendedAction:
              opportunity.service
                ? `Consider ${opportunity.service}.`
                : "",
          });
        }
      );
    }

    // ==============================
    // WEBSITE AUDIT ISSUES
    // ==============================

    if (
      Array.isArray(
        websiteAudit?.issues
      )
    ) {
      websiteAudit.issues.forEach(
        (issue) => {
          addOpportunity({
            title:
              issue.title,

            category:
              normalizeIssueCategory(
                issue.category
              ),

            source:
              "website_audit",

            priority:
              issue.severity ===
                "critical"
                ? "urgent"
                : issue.severity ===
                    "high"
                  ? "high"
                  : issue.severity ===
                      "low" ||
                    issue.severity ===
                      "info"
                    ? "low"
                    : "medium",

            impact:
              issue.severity ===
                "critical" ||
              issue.severity ===
                "high"
                ? "high"
                : issue.severity ===
                    "medium"
                  ? "medium"
                  : "low",

            confidence: "high",

            problem:
              issue.description,

            evidence:
              issue.evidence,

            recommendedAction:
              issue.recommendation,
          });
        }
      );
    }

    return opportunities;
  };

// ==============================
// BUILD SERVICE RECOMMENDATIONS
// ==============================

const buildServiceRecommendations =
  (websiteAudit) => {
    const recommendations = [];

    const addService = ({
      service,
      priority = "medium",
      reason = "",
      expectedOutcome = "",
      source = "website_audit",
    }) => {
      const normalizedService =
        String(service || "")
          .trim();

      if (!normalizedService) {
        return;
      }

      const existing =
        recommendations.find(
          (item) =>
            item.service
              .trim()
              .toLowerCase() ===
            normalizedService.toLowerCase()
        );

      if (existing) {
        existing.priority =
          highestPriority(
            existing.priority,
            priority
          );

        if (
          existing.source !==
          source
        ) {
          existing.source =
            "combined";
        }

        return;
      }

      recommendations.push({
        service: limitText(
          normalizedService,
          150
        ),

        priority:
          normalizePriority(
            priority
          ),

        reason: limitText(
          reason,
          2000
        ),

        expectedOutcome:
          limitText(
            expectedOutcome,
            2000
          ),

        source,
        selectedForLead: false,
      });
    };

    if (
      Array.isArray(
        websiteAudit
          ?.recommendedServices
      )
    ) {
      websiteAudit.recommendedServices.forEach(
        (service) => {
          addService({
            service,
            priority: "high",
            reason:
              "Recommended during the website audit.",
          });
        }
      );
    }

    if (
      Array.isArray(
        websiteAudit
          ?.opportunities
      )
    ) {
      websiteAudit.opportunities.forEach(
        (opportunity) => {
          if (
            !opportunity.service
          ) {
            return;
          }

          addService({
            service:
              opportunity.service,

            priority:
              opportunity.priority,

            reason:
              opportunity.description,

            source:
              "website_audit",
          });
        }
      );
    }

    return recommendations;
  };

// ==============================
// GET ALL OPPORTUNITY ANALYSES
// ==============================

const getOpportunityAnalysisList =
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
      ].includes(status)
    ) {
      query.status = status;
    }

    const normalizedSearch =
      search.trim();

    if (normalizedSearch) {
      const regex =
        new RegExp(
          escapeRegex(
            normalizedSearch
          ),
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
          primaryNeed: regex,
        },
        {
          qualificationSummary:
            regex,
        },
        {
          salesAngle: regex,
        },
        {
          valueProposition:
            regex,
        },
        {
          nextBestAction: regex,
        },
        {
          notes: regex,
        },
        {
          "detectedOpportunities.title":
            regex,
        },
        {
          "detectedOpportunities.problem":
            regex,
        },
        {
          "serviceRecommendations.service":
            regex,
        },
      ];
    }

    const skip =
      (pageNumber - 1) *
      limitNumber;

    const [
      analyses,
      total,
      totalAnalyses,
      draftCount,
      inProgressCount,
      completedCount,
    ] = await Promise.all([
      OpportunityAnalysis.find(
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
        .limit(limitNumber),

      OpportunityAnalysis.countDocuments(
        query
      ),

      OpportunityAnalysis.countDocuments({
        createdBy:
          req.user._id,
      }),

      OpportunityAnalysis.countDocuments({
        createdBy:
          req.user._id,
        status: "draft",
      }),

      OpportunityAnalysis.countDocuments({
        createdBy:
          req.user._id,
        status:
          "in_progress",
      }),

      OpportunityAnalysis.countDocuments({
        createdBy:
          req.user._id,
        status:
          "completed",
      }),
    ]);

    res.status(200).json({
      success: true,
      count:
        analyses.length,
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
          totalAnalyses,
        draft:
          draftCount,
        inProgress:
          inProgressCount,
        completed:
          completedCount,
      },

      analyses,
    });
  };

// ==============================
// GET ANALYSIS BY BUSINESS
// ==============================

const getOpportunityAnalysisByBusiness =
  async (req, res) => {
    const business =
      await getOwnedBusiness(
        req.params.businessId,
        req.user._id
      );

    const analysis =
      await OpportunityAnalysis.findOne({
        business:
          business._id,
        createdBy:
          req.user._id,
      });

    await populateAnalysis(
      analysis
    );

    res.status(200).json({
      success: true,
      analysis,
    });
  };

// ==============================
// START ANALYSIS
// ==============================

const startOpportunityAnalysis =
  async (req, res) => {
    const business =
      await getOwnedBusiness(
        req.params.businessId,
        req.user._id
      );

    const [
      research,
      websiteAudit,
      existingAnalysis,
    ] = await Promise.all([
      BusinessResearch.findOne({
        business:
          business._id,
        createdBy:
          req.user._id,
      }),

      WebsiteAudit.findOne({
        business:
          business._id,
        createdBy:
          req.user._id,
      }),

      OpportunityAnalysis.findOne({
        business:
          business._id,
        createdBy:
          req.user._id,
      }),
    ]);

    // ==============================
    // EXISTING ANALYSIS
    // ==============================

    if (existingAnalysis) {
      let changed = false;

      const researchId =
        research?._id ||
        null;

      const websiteAuditId =
        websiteAudit?._id ||
        null;

      if (
        String(
          existingAnalysis
            .research || ""
        ) !==
        String(
          researchId || ""
        )
      ) {
        existingAnalysis.research =
          researchId;

        changed = true;
      }

      if (
        String(
          existingAnalysis
            .websiteAudit ||
            ""
        ) !==
        String(
          websiteAuditId ||
            ""
        )
      ) {
        existingAnalysis.websiteAudit =
          websiteAuditId;

        changed = true;
      }

      if (changed) {
        await existingAnalysis.save();
      }

      const shouldBeCompleted =
        existingAnalysis.status ===
        "completed";

      if (
        business.opportunityAnalysisCompleted !==
        shouldBeCompleted
      ) {
        business.opportunityAnalysisCompleted =
          shouldBeCompleted;

        await business.save();
      }

      await populateAnalysis(
        existingAnalysis
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Opportunity analysis already exists",
          analysis:
            existingAnalysis,
        });
    }

    // ==============================
    // BUILD INITIAL ANALYSIS
    // ==============================

    const detectedOpportunities =
      buildDetectedOpportunities(
        research,
        websiteAudit
      );

    const serviceRecommendations =
      buildServiceRecommendations(
        websiteAudit
      );

    const analysis =
      await OpportunityAnalysis.create({
        createdBy:
          req.user._id,

        business:
          business._id,

        research:
          research?._id ||
          null,

        websiteAudit:
          websiteAudit?._id ||
          null,

        status:
          "in_progress",

        detectedOpportunities,

        serviceRecommendations,

        salesAngle:
          limitText(
            research
              ?.recommendedApproach,
            3000
          ),

        nextBestAction:
          limitText(
            websiteAudit
              ?.nextStep,
            2000
          ),

        startedAt:
          new Date(),
      });

    business.opportunityAnalysisCompleted =
      false;

    await business.save();

    await populateAnalysis(
      analysis
    );

    res.status(201).json({
      success: true,
      message:
        "Opportunity analysis started successfully",
      analysis,
    });
  };

// ==============================
// UPDATE ANALYSIS
// ==============================

const updateOpportunityAnalysis =
  async (req, res) => {
    const analysis =
      await OpportunityAnalysis.findOne({
        _id:
          req.params.analysisId,
        createdBy:
          req.user._id,
      });

    if (!analysis) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Opportunity analysis not found",
        });
    }

    const allowedFields = [
      "primaryNeed",
      "qualificationSummary",
      "detectedOpportunities",
      "serviceRecommendations",
      "salesAngle",
      "valueProposition",
      "nextBestAction",
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
          analysis[field] =
            req.body[field];
        }
      }
    );

    await analysis.save();

    await populateAnalysis(
      analysis
    );

    res.status(200).json({
      success: true,
      message:
        "Opportunity analysis updated successfully",
      analysis,
    });
  };

// ==============================
// COMPLETE ANALYSIS
// ==============================

const completeOpportunityAnalysis =
  async (req, res) => {
    const analysis =
      await OpportunityAnalysis.findOne({
        _id:
          req.params.analysisId,
        createdBy:
          req.user._id,
      });

    if (!analysis) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Opportunity analysis not found",
        });
    }

    const business =
      await getOwnedBusiness(
        analysis.business,
        req.user._id
      );

    analysis.status =
      "completed";

    analysis.completedAt =
      new Date();

    if (
      !analysis.startedAt
    ) {
      analysis.startedAt =
        new Date();
    }

    await analysis.save();

    business.opportunityAnalysisCompleted =
      true;

    await business.save();

    await populateAnalysis(
      analysis
    );

    res.status(200).json({
      success: true,
      message:
        "Opportunity analysis completed successfully",
      analysis,
    });
  };

// ==============================
// REOPEN ANALYSIS
// ==============================

const reopenOpportunityAnalysis =
  async (req, res) => {
    const analysis =
      await OpportunityAnalysis.findOne({
        _id:
          req.params.analysisId,
        createdBy:
          req.user._id,
      });

    if (!analysis) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Opportunity analysis not found",
        });
    }

    const business =
      await getOwnedBusiness(
        analysis.business,
        req.user._id
      );

    analysis.status =
      "in_progress";

    analysis.completedAt =
      null;

    if (
      !analysis.startedAt
    ) {
      analysis.startedAt =
        new Date();
    }

    await analysis.save();

    business.opportunityAnalysisCompleted =
      false;

    await business.save();

    await populateAnalysis(
      analysis
    );

    res.status(200).json({
      success: true,
      message:
        "Opportunity analysis reopened successfully",
      analysis,
    });
  };

module.exports = {
  getOpportunityAnalysisList,
  getOpportunityAnalysisByBusiness,
  startOpportunityAnalysis,
  updateOpportunityAnalysis,
  completeOpportunityAnalysis,
  reopenOpportunityAnalysis,
};