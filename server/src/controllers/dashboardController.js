const Business = require(
  "../models/Business"
);

const Lead = require(
  "../models/Lead"
);

const Project = require(
  "../models/Project"
);

const Proposal = require(
  "../models/Proposal"
);

const Invoice = require(
  "../models/Invoice"
);

const Payment = require(
  "../models/Payment"
);

// ==============================
// DASHBOARD CONSTANTS
// ==============================

const ACTIVE_PROJECT_STATUSES = [
  "planned",
  "in_progress",
  "on_hold",
];

// ==============================
// GET DASHBOARD OVERVIEW
// ==============================

const getDashboardOverview = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user._id;

    // ==============================
    // REAL DATABASE DATA
    // ==============================

    const [
      businessCount,
      leadCount,
      activeProjectCount,
      proposalCount,
      invoiceCount,
      revenueResult,
    ] = await Promise.all([
      Business.countDocuments({
        createdBy: userId,
      }),

      Lead.countDocuments({
        createdBy: userId,
      }),

      Project.countDocuments({
        createdBy: userId,

        status: {
          $in:
            ACTIVE_PROJECT_STATUSES,
        },
      }),

      Proposal.countDocuments({
        createdBy: userId,
      }),

      Invoice.countDocuments({
        createdBy: userId,
      }),

      Payment.aggregate([
        {
          $match: {
            createdBy:
              userId,

            status:
              "completed",
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },
          },
        },
      ]),
    ]);

    // ==============================
    // REVENUE
    // ==============================

    const revenueTotal =
      revenueResult.length > 0
        ? Number(
            revenueResult[0]
              .total
          ) || 0
        : 0;

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
          id:
            req.user._id,

          name:
            req.user.name,

          email:
            req.user.email,
        },
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
};