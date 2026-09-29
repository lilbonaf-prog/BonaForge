const Business = require("../models/Business");
const BusinessResearch = require("../models/BusinessResearch");

const businessPopulateFields =
  "name industry website phone email status researchCompleted";

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getOwnedBusiness = async (businessId, userId) => {
  const business = await Business.findOne({
    _id: businessId,
    createdBy: userId,
  });

  if (!business) {
    const error = new Error("Business not found");
    error.statusCode = 404;
    throw error;
  }

  return business;
};

// ==============================
// GET ALL RESEARCH
// ==============================

const getResearchList = async (req, res) => {
  const {
    status = "all",
    search = "",
    page = 1,
    limit = 20,
  } = req.query;

  const pageNumber = Math.max(
    Number.parseInt(page, 10) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(Number.parseInt(limit, 10) || 20, 1),
    100
  );

  const query = {
    createdBy: req.user._id,
  };

  if (
    status !== "all" &&
    ["draft", "in_progress", "completed"].includes(status)
  ) {
    query.status = status;
  }

  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    const safeSearch = escapeRegex(normalizedSearch);
    const regex = new RegExp(safeSearch, "i");

    const matchingBusinesses = await Business.find({
      createdBy: req.user._id,
      $or: [
        { name: regex },
        { industry: regex },
        { email: regex },
        { phone: regex },
        { website: regex },
      ],
    }).select("_id");

    const matchingBusinessIds = matchingBusinesses.map(
      (business) => business._id
    );

    query.$or = [
      {
        business: {
          $in: matchingBusinessIds,
        },
      },
      { companyOverview: regex },
      { targetAudience: regex },
      { marketPositioning: regex },
      { digitalPresenceSummary: regex },
      { recommendedApproach: regex },
      { notes: regex },
      { productsServices: regex },
      { strengths: regex },
      { weaknesses: regex },
      { opportunities: regex },
      { keyFindings: regex },
    ];
  }

  const skip = (pageNumber - 1) * limitNumber;

  const [
    research,
    total,
    totalResearch,
    draftCount,
    inProgressCount,
    completedCount,
  ] = await Promise.all([
    BusinessResearch.find(query)
      .populate("business", businessPopulateFields)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNumber),

    BusinessResearch.countDocuments(query),

    BusinessResearch.countDocuments({
      createdBy: req.user._id,
    }),

    BusinessResearch.countDocuments({
      createdBy: req.user._id,
      status: "draft",
    }),

    BusinessResearch.countDocuments({
      createdBy: req.user._id,
      status: "in_progress",
    }),

    BusinessResearch.countDocuments({
      createdBy: req.user._id,
      status: "completed",
    }),
  ]);

  res.status(200).json({
    success: true,
    count: research.length,
    total,
    page: pageNumber,
    pages: Math.max(
      Math.ceil(total / limitNumber),
      1
    ),
    stats: {
      total: totalResearch,
      draft: draftCount,
      inProgress: inProgressCount,
      completed: completedCount,
    },
    research,
  });
};

// ==============================
// GET RESEARCH BY BUSINESS
// ==============================

const getResearchByBusiness = async (req, res) => {
  const business = await getOwnedBusiness(
    req.params.businessId,
    req.user._id
  );

  const research = await BusinessResearch.findOne({
    business: business._id,
    createdBy: req.user._id,
  }).populate("business", businessPopulateFields);

  res.status(200).json({
    success: true,
    research,
  });
};

// ==============================
// START RESEARCH
// ==============================

const startResearch = async (req, res) => {
  const business = await getOwnedBusiness(
    req.params.businessId,
    req.user._id
  );

  const existingResearch = await BusinessResearch.findOne({
    business: business._id,
    createdBy: req.user._id,
  });

  if (existingResearch) {
    await existingResearch.populate(
      "business",
      businessPopulateFields
    );

    return res.status(200).json({
      success: true,
      message: "Research already exists",
      research: existingResearch,
    });
  }

  const research = await BusinessResearch.create({
    createdBy: req.user._id,
    business: business._id,
    status: "in_progress",
    startedAt: new Date(),
  });

  business.researchCompleted = false;

  // Starting research must not undo an existing
  // Business -> Lead conversion.
  if (business.status !== "converted") {
    business.status = "researching";
  }

  await business.save();

  await research.populate(
    "business",
    businessPopulateFields
  );

  res.status(201).json({
    success: true,
    message: "Research started successfully",
    research,
  });
};

// ==============================
// UPDATE RESEARCH
// ==============================

const updateResearch = async (req, res) => {
  const research = await BusinessResearch.findOne({
    _id: req.params.researchId,
    createdBy: req.user._id,
  });

  if (!research) {
    return res.status(404).json({
      success: false,
      message: "Research not found",
    });
  }

  const allowedFields = [
    "companyOverview",
    "productsServices",
    "targetAudience",
    "marketPositioning",
    "strengths",
    "weaknesses",
    "opportunities",
    "competitors",
    "digitalPresenceSummary",
    "socialProfiles",
    "keyFindings",
    "recommendedApproach",
    "sources",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        field
      )
    ) {
      research[field] = req.body[field];
    }
  });

  await research.save();

  await research.populate(
    "business",
    businessPopulateFields
  );

  res.status(200).json({
    success: true,
    message: "Research updated successfully",
    research,
  });
};

// ==============================
// COMPLETE RESEARCH
// ==============================

const completeResearch = async (req, res) => {
  const research = await BusinessResearch.findOne({
    _id: req.params.researchId,
    createdBy: req.user._id,
  });

  if (!research) {
    return res.status(404).json({
      success: false,
      message: "Research not found",
    });
  }

  const business = await getOwnedBusiness(
    research.business,
    req.user._id
  );

  research.status = "completed";
  research.completedAt = new Date();

  if (!research.startedAt) {
    research.startedAt = new Date();
  }

  await research.save();

  business.researchCompleted = true;

  // Preserve converted Businesses in the sales lifecycle.
  if (business.status !== "converted") {
    business.status = "researched";
  }

  await business.save();

  await research.populate(
    "business",
    businessPopulateFields
  );

  res.status(200).json({
    success: true,
    message: "Research completed successfully",
    research,
  });
};

// ==============================
// REOPEN RESEARCH
// ==============================

const reopenResearch = async (req, res) => {
  const research = await BusinessResearch.findOne({
    _id: req.params.researchId,
    createdBy: req.user._id,
  });

  if (!research) {
    return res.status(404).json({
      success: false,
      message: "Research not found",
    });
  }

  const business = await getOwnedBusiness(
    research.business,
    req.user._id
  );

  research.status = "in_progress";
  research.completedAt = null;

  if (!research.startedAt) {
    research.startedAt = new Date();
  }

  await research.save();

  business.researchCompleted = false;

  // Reopening research must not undo Lead conversion.
  if (business.status !== "converted") {
    business.status = "researching";
  }

  await business.save();

  await research.populate(
    "business",
    businessPopulateFields
  );

  res.status(200).json({
    success: true,
    message: "Research reopened successfully",
    research,
  });
};

module.exports = {
  getResearchList,
  getResearchByBusiness,
  startResearch,
  updateResearch,
  completeResearch,
  reopenResearch,
};