const Business = require("../models/Business");

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
    // REAL BUSINESS COUNT
    // ==============================

    const businessCount =
      await Business.countDocuments({
        createdBy: req.user._id,
      });

    // ==============================
    // DASHBOARD RESPONSE
    // ==============================

    res.status(200).json({
      success: true,

      message:
        "Dashboard overview loaded successfully",

      overview: {
        businesses:
          businessCount,

        // These will become real counts
        // when their modules are built.
        leads: 0,
        activeProjects: 0,
        proposals: 0,
        invoices: 0,
        revenue: 0,
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