const Business = require("../models/Business");
const BusinessResearch = require("../models/BusinessResearch");
const Lead = require("../models/Lead");

// ==============================
// CREATE BUSINESS
// ==============================

const createBusiness = async (
  req,
  res,
  next
) => {
  try {
    const business =
      await Business.create({
        ...req.body,
        createdBy:
          req.user._id,
      });

    res.status(201).json({
      success: true,
      message:
        "Business created successfully",
      business,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// GET ALL BUSINESSES
// ==============================

const getBusinesses = async (
  req,
  res,
  next
) => {
  try {
    const businesses =
      await Business.find({
        createdBy:
          req.user._id,
      }).sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count:
        businesses.length,
      businesses,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// GET SINGLE BUSINESS
// ==============================

const getBusinessById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const business =
        await Business.findOne({
          _id: req.params.id,
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

      res.status(200).json({
        success: true,
        business,
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// UPDATE BUSINESS
// ==============================

const updateBusiness = async (
  req,
  res,
  next
) => {
  try {
    const business =
      await Business.findOne({
        _id: req.params.id,
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

    const allowedFields = [
      "name",
      "industry",
      "description",
      "phone",
      "email",
      "website",
      "location",
      "socialLinks",
      "source",
      "sourceDetails",
      "status",
      "notes",
      "researchCompleted",
      "websiteAuditCompleted",
      "convertedToLead",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          business[field] =
            req.body[field];
        }
      }
    );

    await business.save();

    res.status(200).json({
      success: true,
      message:
        "Business updated successfully",
      business,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// DELETE BUSINESS
// ==============================

const deleteBusiness = async (
  req,
  res,
  next
) => {
  try {
    const business =
      await Business.findOne({
        _id: req.params.id,
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

    // ==============================
    // PROTECT LINKED LEADS
    // ==============================

    const linkedLead =
      await Lead.findOne({
        createdBy:
          req.user._id,
        business:
          business._id,
      }).select(
        "_id name companyName"
      );

    if (linkedLead) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "This business cannot be deleted because it is linked to a lead. Delete or unlink the lead first.",
          leadId:
            linkedLead._id,
        });
    }

    // ==============================
    // REMOVE CHILD RESEARCH
    // ==============================

    await BusinessResearch.deleteMany({
      createdBy:
        req.user._id,
      business:
        business._id,
    });

    // ==============================
    // DELETE BUSINESS
    // ==============================

    await business.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Business and linked research deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
};