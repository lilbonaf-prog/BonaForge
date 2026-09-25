const Business = require("../models/Business");

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

    await business.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Business deleted successfully",
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