const Business = require("../models/Business");
const Lead = require("../models/Lead");

// ==============================
// GET DASHBOARD OVERVIEW
// ==============================

const getDashboardOverview = async (
  req,
  res,
  next
) => {
  try {
    // ==============================
    // REAL DATABASE COUNTS
    // ==============================

    const [
      businessCount,
      leadCount,
    ] = await Promise.all([
      Business.countDocuments({
        createdBy: req.user._id,
      }),

      Lead.countDocuments({
        createdBy: req.user._id,
      }),
    ]);

    // ==============================
    // FUTURE MODULE PLACEHOLDERS
    // ==============================
    //
    // These values stay at 0 until their
    // actual modules and database models
    // are built.
    //
    // We do NOT import models that do not
    // exist yet because that would crash
    // the server.
    // ==============================

    const activeProjectCount = 0;
    const proposalCount = 0;
    const invoiceCount = 0;
    const revenueTotal = 0;

    // ==============================
    // DASHBOARD RESPONSE
    // ==============================

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Dashboard overview loaded successfully",

        overview: {
          businesses:
            businessCount,

          leads:
            leadCount,

          activeProjects:
            activeProjectCount,

          proposals:
            proposalCount,

          invoices:
            invoiceCount,

          revenue:
            revenueTotal,
        },

        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
};