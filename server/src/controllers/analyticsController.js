const Business = require(
  "../models/Business"
);

const Lead = require(
  "../models/Lead"
);

const Proposal = require(
  "../models/Proposal"
);

const Quotation = require(
  "../models/Quotation"
);

const Project = require(
  "../models/Project"
);

const Invoice = require(
  "../models/Invoice"
);

const Payment = require(
  "../models/Payment"
);

// ==============================
// CONSTANTS
// ==============================

const BUSINESS_STATUSES = [
  "saved",
  "researching",
  "researched",
  "qualified",
  "not_suitable",
  "converted",
];

const LEAD_STATUSES = [
  "new",
  "contacted",
  "follow_up",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

const PROPOSAL_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
];

const QUOTATION_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
];

const PROJECT_STATUSES = [
  "planned",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
];

const INVOICE_STATUSES = [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
];

const PAYMENT_METHODS = [
  "bank_transfer",
  "cash",
  "mobile_money",
  "card",
  "cheque",
  "other",
];

const OPEN_LEAD_STATUSES = [
  "new",
  "contacted",
  "follow_up",
  "qualified",
  "proposal",
  "negotiation",
];

const ACTIVE_PROJECT_STATUSES = [
  "planned",
  "in_progress",
  "on_hold",
];

const OUTSTANDING_INVOICE_STATUSES =
  [
    "sent",
    "partially_paid",
    "overdue",
  ];

// ==============================
// HELPERS
// ==============================

const safeNumber = (
  value
) => {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
};

const roundMoney = (
  value
) =>
  Number(
    safeNumber(value).toFixed(
      2
    )
  );

const percentage = (
  part,
  total
) => {
  const safePart =
    safeNumber(part);

  const safeTotal =
    safeNumber(total);

  if (safeTotal <= 0) {
    return 0;
  }

  return Number(
    (
      (safePart /
        safeTotal) *
      100
    ).toFixed(1)
  );
};

const sumCounts = (
  rows
) =>
  rows.reduce(
    (
      total,
      row
    ) =>
      total +
      safeNumber(
        row.count
      ),
    0
  );

const getStatusRow = (
  rows,
  status
) =>
  rows.find(
    (row) =>
      row.status ===
      status
  );

const normalizeStatusBreakdown = (
  rows,
  statuses
) =>
  statuses.map(
    (status) => {
      const row =
        getStatusRow(
          rows,
          status
        );

      return {
        status,

        count:
          safeNumber(
            row?.count
          ),

        value:
          roundMoney(
            row?.value
          ),

        balance:
          roundMoney(
            row?.balance
          ),
      };
    }
  );

const normalizePaymentMethods = (
  rows
) =>
  PAYMENT_METHODS.map(
    (method) => {
      const row =
        rows.find(
          (item) =>
            item.method ===
            method
        );

      return {
        method,

        count:
          safeNumber(
            row?.count
          ),

        amount:
          roundMoney(
            row?.amount
          ),
      };
    }
  );

const getTrendMonths = (
  value
) => {
  const parsed =
    Number.parseInt(
      value,
      10
    );

  if (
    !Number.isFinite(parsed)
  ) {
    return 12;
  }

  return Math.min(
    Math.max(parsed, 3),
    24
  );
};

const getTrendStartDate = (
  months
) => {
  const now =
    new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() -
        (months - 1),
      1,
      0,
      0,
      0,
      0
    )
  );
};

const getMonthKey = (
  year,
  month
) =>
  `${year}-${String(
    month
  ).padStart(2, "0")}`;

const createMonthlyTrend = ({
  months,
  revenueRows,
  leadRows,
  businessRows,
}) => {
  const revenueMap =
    new Map();

  const leadMap =
    new Map();

  const businessMap =
    new Map();

  revenueRows.forEach(
    (row) => {
      const key =
        getMonthKey(
          row._id.year,
          row._id.month
        );

      revenueMap.set(
        key,
        roundMoney(
          row.amount
        )
      );
    }
  );

  leadRows.forEach(
    (row) => {
      const key =
        getMonthKey(
          row._id.year,
          row._id.month
        );

      leadMap.set(
        key,
        safeNumber(
          row.count
        )
      );
    }
  );

  businessRows.forEach(
    (row) => {
      const key =
        getMonthKey(
          row._id.year,
          row._id.month
        );

      businessMap.set(
        key,
        safeNumber(
          row.count
        )
      );
    }
  );

  const now =
    new Date();

  const trend = [];

  for (
    let offset =
      months - 1;
    offset >= 0;
    offset -= 1
  ) {
    const date =
      new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth() -
            offset,
          1
        )
      );

    const year =
      date.getUTCFullYear();

    const month =
      date.getUTCMonth() +
      1;

    const key =
      getMonthKey(
        year,
        month
      );

    const label =
      new Intl.DateTimeFormat(
        "en-US",
        {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }
      ).format(date);

    trend.push({
      key,
      label,

      revenue:
        revenueMap.get(
          key
        ) || 0,

      leads:
        leadMap.get(
          key
        ) || 0,

      businesses:
        businessMap.get(
          key
        ) || 0,
    });
  }

  return trend;
};

// ==============================
// GET ANALYTICS OVERVIEW
// ==============================

const getAnalyticsOverview =
  async (
    req,
    res,
    next
  ) => {
    try {
      const userId =
        req.user._id;

      const trendMonths =
        getTrendMonths(
          req.query.months
        );

      const trendStartDate =
        getTrendStartDate(
          trendMonths
        );

      const [
        businessCount,
        businessStatusRows,

        leadSummaryRows,
        leadPipelineRows,

        proposalStatusRows,

        quotationStatusRows,

        projectSummaryRows,
        projectStatusRows,

        invoiceSummaryRows,
        invoiceStatusRows,

        paymentSummaryRows,
        paymentMethodRows,

        monthlyRevenueRows,
        monthlyLeadRows,
        monthlyBusinessRows,
      ] =
        await Promise.all([
          // ==============================
          // BUSINESSES
          // ==============================

          Business.countDocuments(
            {
              createdBy:
                userId,
            }
          ),

          Business.aggregate([
            {
              $match: {
                createdBy:
                  userId,
              },
            },

            {
              $group: {
                _id: "$status",

                count: {
                  $sum: 1,
                },
              },
            },
          ]),

          // ==============================
          // LEADS
          // ==============================

          Lead.aggregate([
            {
              $match: {
                createdBy:
                  userId,
              },
            },

            {
              $group: {
                _id: null,

                total: {
                  $sum: 1,
                },

                won: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "won",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },

                lost: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "lost",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },

                pipelineValue: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          "$status",
                          OPEN_LEAD_STATUSES,
                        ],
                      },

                      {
                        $ifNull: [
                          "$estimatedValue",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },

                wonValue: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "won",
                        ],
                      },

                      {
                        $ifNull: [
                          "$estimatedValue",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },
              },
            },
          ]),

          Lead.aggregate([
            {
              $match: {
                createdBy:
                  userId,
              },
            },

            {
              $group: {
                _id: "$status",

                count: {
                  $sum: 1,
                },

                value: {
                  $sum: {
                    $ifNull: [
                      "$estimatedValue",
                      0,
                    ],
                  },
                },
              },
            },

            {
              $project: {
                _id: 0,

                status:
                  "$_id",

                count: 1,

                value: 1,
              },
            },
          ]),

          // ==============================
          // PROPOSALS
          // ==============================

          Proposal.aggregate([
            {
              $match: {
                createdBy:
                  userId,
              },
            },

            {
              $group: {
                _id: "$status",

                count: {
                  $sum: 1,
                },

                value: {
                  $sum: {
                    $ifNull: [
                      "$pricingOverview.estimatedAmount",
                      0,
                    ],
                  },
                },
              },
            },

            {
              $project: {
                _id: 0,

                status:
                  "$_id",

                count: 1,

                value: 1,
              },
            },
          ]),

          // ==============================
          // QUOTATIONS
          // ==============================

          Quotation.aggregate([
            {
              $match: {
                createdBy:
                  userId,
              },
            },

            {
              $group: {
                _id: "$status",

                count: {
                  $sum: 1,
                },

                value: {
                  $sum: {
                    $ifNull: [
                      "$total",
                      0,
                    ],
                  },
                },
              },
            },

            {
              $project: {
                _id: 0,

                status:
                  "$_id",

                count: 1,

                value: 1,
              },
            },
          ]),

          // ==============================
          // PROJECTS
          // ==============================

          Project.aggregate([
            {
              $match: {
                createdBy:
                  userId,
              },
            },

            {
              $group: {
                _id: null,

                total: {
                  $sum: 1,
                },

                active: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          "$status",
                          ACTIVE_PROJECT_STATUSES,
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },

                completed: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "completed",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },

                totalProjectValue: {
                  $sum: {
                    $cond: [
                      {
                        $ne: [
                          "$status",
                          "cancelled",
                        ],
                      },

                      {
                        $ifNull: [
                          "$projectValue",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },

                activeProjectValue: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          "$status",
                          ACTIVE_PROJECT_STATUSES,
                        ],
                      },

                      {
                        $ifNull: [
                          "$projectValue",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },

                completedProjectValue: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "completed",
                        ],
                      },

                      {
                        $ifNull: [
                          "$projectValue",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },

                averageProgress: {
                  $avg: {
                    $cond: [
                      {
                        $ne: [
                          "$status",
                          "cancelled",
                        ],
                      },

                      {
                        $ifNull: [
                          "$progress",
                          0,
                        ],
                      },

                      null,
                    ],
                  },
                },
              },
            },
          ]),

          Project.aggregate([
            {
              $match: {
                createdBy:
                  userId,
              },
            },

            {
              $group: {
                _id: "$status",

                count: {
                  $sum: 1,
                },

                value: {
                  $sum: {
                    $ifNull: [
                      "$projectValue",
                      0,
                    ],
                  },
                },
              },
            },

            {
              $project: {
                _id: 0,

                status:
                  "$_id",

                count: 1,

                value: 1,
              },
            },
          ]),

          // ==============================
          // INVOICES
          // ==============================

          Invoice.aggregate([
            {
              $match: {
                createdBy:
                  userId,
              },
            },

            {
              $group: {
                _id: null,

                total: {
                  $sum: 1,
                },

                invoicedTotal: {
                  $sum: {
                    $cond: [
                      {
                        $ne: [
                          "$status",
                          "cancelled",
                        ],
                      },

                      {
                        $ifNull: [
                          "$total",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },

                outstandingBalance: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          "$status",
                          OUTSTANDING_INVOICE_STATUSES,
                        ],
                      },

                      {
                        $ifNull: [
                          "$balanceDue",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },

                overdueBalance: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "overdue",
                        ],
                      },

                      {
                        $ifNull: [
                          "$balanceDue",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },

                paidInvoiceValue: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "paid",
                        ],
                      },

                      {
                        $ifNull: [
                          "$total",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },
              },
            },
          ]),

          Invoice.aggregate([
            {
              $match: {
                createdBy:
                  userId,
              },
            },

            {
              $group: {
                _id: "$status",

                count: {
                  $sum: 1,
                },

                value: {
                  $sum: {
                    $ifNull: [
                      "$total",
                      0,
                    ],
                  },
                },

                balance: {
                  $sum: {
                    $ifNull: [
                      "$balanceDue",
                      0,
                    ],
                  },
                },
              },
            },

            {
              $project: {
                _id: 0,

                status:
                  "$_id",

                count: 1,

                value: 1,

                balance: 1,
              },
            },
          ]),

          // ==============================
          // PAYMENTS
          // ==============================

          Payment.aggregate([
            {
              $match: {
                createdBy:
                  userId,
              },
            },

            {
              $group: {
                _id: null,

                total: {
                  $sum: 1,
                },

                completed: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "completed",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },

                reversed: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "reversed",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },

                revenue: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "completed",
                        ],
                      },

                      {
                        $ifNull: [
                          "$amount",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },

                reversedAmount: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "reversed",
                        ],
                      },

                      {
                        $ifNull: [
                          "$amount",
                          0,
                        ],
                      },

                      0,
                    ],
                  },
                },
              },
            },
          ]),

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
                _id: "$method",

                count: {
                  $sum: 1,
                },

                amount: {
                  $sum: {
                    $ifNull: [
                      "$amount",
                      0,
                    ],
                  },
                },
              },
            },

            {
              $project: {
                _id: 0,

                method:
                  "$_id",

                count: 1,

                amount: 1,
              },
            },
          ]),

          // ==============================
          // MONTHLY REVENUE TREND
          // ==============================

          Payment.aggregate([
            {
              $match: {
                createdBy:
                  userId,

                status:
                  "completed",

                paidAt: {
                  $gte:
                    trendStartDate,
                },
              },
            },

            {
              $group: {
                _id: {
                  year: {
                    $year:
                      "$paidAt",
                  },

                  month: {
                    $month:
                      "$paidAt",
                  },
                },

                amount: {
                  $sum: {
                    $ifNull: [
                      "$amount",
                      0,
                    ],
                  },
                },
              },
            },

            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1,
              },
            },
          ]),

          // ==============================
          // MONTHLY LEAD GROWTH
          // ==============================

          Lead.aggregate([
            {
              $match: {
                createdBy:
                  userId,

                createdAt: {
                  $gte:
                    trendStartDate,
                },
              },
            },

            {
              $group: {
                _id: {
                  year: {
                    $year:
                      "$createdAt",
                  },

                  month: {
                    $month:
                      "$createdAt",
                  },
                },

                count: {
                  $sum: 1,
                },
              },
            },

            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1,
              },
            },
          ]),

          // ==============================
          // MONTHLY BUSINESS GROWTH
          // ==============================

          Business.aggregate([
            {
              $match: {
                createdBy:
                  userId,

                createdAt: {
                  $gte:
                    trendStartDate,
                },
              },
            },

            {
              $group: {
                _id: {
                  year: {
                    $year:
                      "$createdAt",
                  },

                  month: {
                    $month:
                      "$createdAt",
                  },
                },

                count: {
                  $sum: 1,
                },
              },
            },

            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1,
              },
            },
          ]),
        ]);

      // ==============================
      // NORMALIZE DATA
      // ==============================

      const businessStatus =
        normalizeStatusBreakdown(
          businessStatusRows.map(
            (row) => ({
              status:
                row._id,

              count:
                row.count,
            })
          ),

          BUSINESS_STATUSES
        );

      const leadSummary =
        leadSummaryRows[0] ||
        {};

      const leadPipeline =
        normalizeStatusBreakdown(
          leadPipelineRows,
          LEAD_STATUSES
        );

      const proposalStatus =
        normalizeStatusBreakdown(
          proposalStatusRows,
          PROPOSAL_STATUSES
        );

      const quotationStatus =
        normalizeStatusBreakdown(
          quotationStatusRows,
          QUOTATION_STATUSES
        );

      const projectSummary =
        projectSummaryRows[0] ||
        {};

      const projectStatus =
        normalizeStatusBreakdown(
          projectStatusRows,
          PROJECT_STATUSES
        );

      const invoiceSummary =
        invoiceSummaryRows[0] ||
        {};

      const invoiceStatus =
        normalizeStatusBreakdown(
          invoiceStatusRows,
          INVOICE_STATUSES
        );

      const paymentSummary =
        paymentSummaryRows[0] ||
        {};

      const paymentMethods =
        normalizePaymentMethods(
          paymentMethodRows
        );

      // ==============================
      // SALES DOCUMENT PERFORMANCE
      // ==============================

      const proposalCount =
        sumCounts(
          proposalStatus
        );

      const proposalAccepted =
        safeNumber(
          getStatusRow(
            proposalStatus,
            "accepted"
          )?.count
        );

      const proposalRejected =
        safeNumber(
          getStatusRow(
            proposalStatus,
            "rejected"
          )?.count
        );

      const proposalExpired =
        safeNumber(
          getStatusRow(
            proposalStatus,
            "expired"
          )?.count
        );

      const proposalDecisions =
        proposalAccepted +
        proposalRejected +
        proposalExpired;

      const quotationCount =
        sumCounts(
          quotationStatus
        );

      const quotationAccepted =
        safeNumber(
          getStatusRow(
            quotationStatus,
            "accepted"
          )?.count
        );

      const quotationRejected =
        safeNumber(
          getStatusRow(
            quotationStatus,
            "rejected"
          )?.count
        );

      const quotationExpired =
        safeNumber(
          getStatusRow(
            quotationStatus,
            "expired"
          )?.count
        );

      const quotationDecisions =
        quotationAccepted +
        quotationRejected +
        quotationExpired;

      // ==============================
      // LEAD PERFORMANCE
      // ==============================

      const totalLeads =
        safeNumber(
          leadSummary.total
        );

      const wonLeads =
        safeNumber(
          leadSummary.won
        );

      const lostLeads =
        safeNumber(
          leadSummary.lost
        );

      const closedLeads =
        wonLeads +
        lostLeads;

      // ==============================
      // MONTHLY TREND
      // ==============================

      const monthlyTrend =
        createMonthlyTrend({
          months:
            trendMonths,

          revenueRows:
            monthlyRevenueRows,

          leadRows:
            monthlyLeadRows,

          businessRows:
            monthlyBusinessRows,
        });

      // ==============================
      // RESPONSE
      // ==============================

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Analytics loaded successfully",

          currency:
            "GHS",

          summary: {
            businesses:
              safeNumber(
                businessCount
              ),

            leads:
              totalLeads,

            wonLeads,

            lostLeads,

            leadConversionRate:
              percentage(
                wonLeads,
                closedLeads
              ),

            pipelineValue:
              roundMoney(
                leadSummary.pipelineValue
              ),

            wonLeadValue:
              roundMoney(
                leadSummary.wonValue
              ),

            proposals:
              proposalCount,

            proposalAcceptanceRate:
              percentage(
                proposalAccepted,
                proposalDecisions
              ),

            quotations:
              quotationCount,

            quotationAcceptanceRate:
              percentage(
                quotationAccepted,
                quotationDecisions
              ),

            projects:
              safeNumber(
                projectSummary.total
              ),

            activeProjects:
              safeNumber(
                projectSummary.active
              ),

            projectValue:
              roundMoney(
                projectSummary.totalProjectValue
              ),

            invoices:
              safeNumber(
                invoiceSummary.total
              ),

            invoicedTotal:
              roundMoney(
                invoiceSummary.invoicedTotal
              ),

            outstandingBalance:
              roundMoney(
                invoiceSummary.outstandingBalance
              ),

            overdueBalance:
              roundMoney(
                invoiceSummary.overdueBalance
              ),

            revenue:
              roundMoney(
                paymentSummary.revenue
              ),
          },

          businesses: {
            total:
              safeNumber(
                businessCount
              ),

            converted:
              safeNumber(
                getStatusRow(
                  businessStatus,
                  "converted"
                )?.count
              ),

            statusBreakdown:
              businessStatus,
          },

          pipeline: {
            totalLeads,

            wonLeads,

            lostLeads,

            openLeads:
              totalLeads -
              wonLeads -
              lostLeads,

            conversionRate:
              percentage(
                wonLeads,
                closedLeads
              ),

            pipelineValue:
              roundMoney(
                leadSummary.pipelineValue
              ),

            wonValue:
              roundMoney(
                leadSummary.wonValue
              ),

            statusBreakdown:
              leadPipeline,
          },

          proposals: {
            total:
              proposalCount,

            accepted:
              proposalAccepted,

            acceptanceRate:
              percentage(
                proposalAccepted,
                proposalDecisions
              ),

            acceptedValue:
              roundMoney(
                getStatusRow(
                  proposalStatus,
                  "accepted"
                )?.value
              ),

            statusBreakdown:
              proposalStatus,
          },

          quotations: {
            total:
              quotationCount,

            accepted:
              quotationAccepted,

            acceptanceRate:
              percentage(
                quotationAccepted,
                quotationDecisions
              ),

            acceptedValue:
              roundMoney(
                getStatusRow(
                  quotationStatus,
                  "accepted"
                )?.value
              ),

            statusBreakdown:
              quotationStatus,
          },

          projects: {
            total:
              safeNumber(
                projectSummary.total
              ),

            active:
              safeNumber(
                projectSummary.active
              ),

            completed:
              safeNumber(
                projectSummary.completed
              ),

            completionRate:
              percentage(
                projectSummary.completed,
                projectSummary.total
              ),

            averageProgress:
              Number(
                safeNumber(
                  projectSummary.averageProgress
                ).toFixed(1)
              ),

            totalValue:
              roundMoney(
                projectSummary.totalProjectValue
              ),

            activeValue:
              roundMoney(
                projectSummary.activeProjectValue
              ),

            completedValue:
              roundMoney(
                projectSummary.completedProjectValue
              ),

            statusBreakdown:
              projectStatus,
          },

          billing: {
            invoices:
              safeNumber(
                invoiceSummary.total
              ),

            invoicedTotal:
              roundMoney(
                invoiceSummary.invoicedTotal
              ),

            paidInvoiceValue:
              roundMoney(
                invoiceSummary.paidInvoiceValue
              ),

            outstandingBalance:
              roundMoney(
                invoiceSummary.outstandingBalance
              ),

            overdueBalance:
              roundMoney(
                invoiceSummary.overdueBalance
              ),

            invoiceStatus:
              invoiceStatus,

            payments: {
              total:
                safeNumber(
                  paymentSummary.total
                ),

              completed:
                safeNumber(
                  paymentSummary.completed
                ),

              reversed:
                safeNumber(
                  paymentSummary.reversed
                ),

              revenue:
                roundMoney(
                  paymentSummary.revenue
                ),

              reversedAmount:
                roundMoney(
                  paymentSummary.reversedAmount
                ),

              methodBreakdown:
                paymentMethods,
            },
          },

          trends: {
            months:
              trendMonths,

            monthly:
              monthlyTrend,
          },
        });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  getAnalyticsOverview,
};