const Quotation = require(
  "../models/Quotation"
);

const Lead = require(
  "../models/Lead"
);

const Business = require(
  "../models/Business"
);

const Proposal = require(
  "../models/Proposal"
);

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

const getOwnedLead = async (
  leadId,
  userId
) => {
  const lead =
    await Lead.findOne({
      _id: leadId,
      createdBy: userId,
    });

  if (!lead) {
    const error =
      new Error(
        "Lead not found"
      );

    error.statusCode = 404;

    throw error;
  }

  return lead;
};

const getOwnedBusiness = async (
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

const getOwnedProposal = async (
  proposalId,
  userId
) => {
  if (!proposalId) {
    return null;
  }

  const proposal =
    await Proposal.findOne({
      _id: proposalId,
      createdBy: userId,
    });

  if (!proposal) {
    const error =
      new Error(
        "Proposal not found"
      );

    error.statusCode = 404;

    throw error;
  }

  return proposal;
};

const getOwnedQuotation =
  async (
    quotationId,
    userId
  ) => {
    const quotation =
      await Quotation.findOne({
        _id: quotationId,
        createdBy: userId,
      });

    if (!quotation) {
      const error =
        new Error(
          "Quotation not found"
        );

      error.statusCode = 404;

      throw error;
    }

    return quotation;
  };

const populateQuotation =
  async (quotation) => {
    if (!quotation) {
      return quotation;
    }

    await quotation.populate(
      "lead"
    );

    await quotation.populate(
      "business"
    );

    await quotation.populate(
      "proposal"
    );

    return quotation;
  };

const normalizeLineItems = (
  items
) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      description: String(
        item?.description ||
          ""
      ).trim(),

      quantity: Math.max(
        Number(
          item?.quantity
        ) || 0,
        0
      ),

      unitPrice: Math.max(
        Number(
          item?.unitPrice
        ) || 0,
        0
      ),
    }))
    .filter(
      (item) =>
        item.description
    );
};

const generateQuotationNumber =
  async (userId) => {
    const year =
      new Date().getFullYear();

    const prefix =
      `BF-QUO-${year}-`;

    const latest =
      await Quotation.findOne({
        createdBy: userId,

        quotationNumber: {
          $regex:
            new RegExp(
              `^${escapeRegex(
                prefix
              )}\\d+$`
            ),
        },
      })
        .sort({
          quotationNumber: -1,
        })
        .select(
          "quotationNumber"
        );

    let nextNumber = 1;

    if (
      latest?.quotationNumber
    ) {
      const parts =
        latest.quotationNumber.split(
          "-"
        );

      const previousNumber =
        Number.parseInt(
          parts[
            parts.length - 1
          ],
          10
        );

      if (
        Number.isFinite(
          previousNumber
        )
      ) {
        nextNumber =
          previousNumber + 1;
      }
    }

    return `${prefix}${String(
      nextNumber
    ).padStart(4, "0")}`;
  };

const buildDefaultLineItems = ({
  lead,
  proposal,
  title,
}) => {
  if (proposal) {
    const proposalAmount =
      Number(
        proposal
          ?.pricingOverview
          ?.estimatedAmount
      ) || 0;

    if (
      proposalAmount > 0
    ) {
      return [
        {
          description:
            proposal.title ||
            title,
          quantity: 1,
          unitPrice:
            proposalAmount,
        },
      ];
    }

    if (
      Array.isArray(
        proposal.scopeOfWork
      ) &&
      proposal.scopeOfWork
        .length > 0
    ) {
      return proposal.scopeOfWork
        .map((item) => ({
          description:
            String(
              item?.title ||
                item?.description ||
                ""
            ).trim(),
          quantity: 1,
          unitPrice: 0,
        }))
        .filter(
          (item) =>
            item.description
        );
    }
  }

  const leadAmount =
    Number(
      lead?.estimatedValue
    ) || 0;

  const services =
    Array.isArray(
      lead
        ?.servicesInterestedIn
    )
      ? lead.servicesInterestedIn
          .map((service) =>
            String(
              service || ""
            ).trim()
          )
          .filter(Boolean)
      : [];

  if (leadAmount > 0) {
    return [
      {
        description:
          services.length > 0
            ? services.join(
                " + "
              )
            : title,
        quantity: 1,
        unitPrice:
          leadAmount,
      },
    ];
  }

  if (
    services.length > 0
  ) {
    return services.map(
      (service) => ({
        description:
          service,
        quantity: 1,
        unitPrice: 0,
      })
    );
  }

  return [];
};

const syncLeadStatus = async (
  lead
) => {
  if (!lead) {
    return;
  }

  if (
    [
      "negotiation",
      "won",
      "lost",
    ].includes(
      lead.status
    )
  ) {
    return;
  }

  lead.status =
    "negotiation";

  await lead.save();
};

// ==============================
// GET QUOTATIONS
// ==============================

const getQuotations = async (
  req,
  res
) => {
  const {
    status = "all",
    search = "",
    leadId = "",
    businessId = "",
    proposalId = "",
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

  const allowedStatuses = [
    "draft",
    "sent",
    "accepted",
    "rejected",
    "expired",
  ];

  if (
    status !== "all" &&
    allowedStatuses.includes(
      status
    )
  ) {
    query.status = status;
  }

  if (leadId) {
    await getOwnedLead(
      leadId,
      req.user._id
    );

    query.lead =
      leadId;
  }

  if (businessId) {
    await getOwnedBusiness(
      businessId,
      req.user._id
    );

    query.business =
      businessId;
  }

  if (proposalId) {
    await getOwnedProposal(
      proposalId,
      req.user._id
    );

    query.proposal =
      proposalId;
  }

  const normalizedSearch =
    String(
      search || ""
    ).trim();

  if (
    normalizedSearch
  ) {
    const regex =
      new RegExp(
        escapeRegex(
          normalizedSearch
        ),
        "i"
      );

    query.$or = [
      {
        quotationNumber:
          regex,
      },
      {
        title: regex,
      },
      {
        paymentTerms:
          regex,
      },
      {
        notes: regex,
      },
      {
        "lineItems.description":
          regex,
      },
    ];
  }

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const [
    quotations,
    total,
    totalQuotations,
    draftCount,
    sentCount,
    acceptedCount,
    rejectedCount,
    expiredCount,
  ] = await Promise.all([
    Quotation.find(query)
      .populate("lead")
      .populate(
        "business"
      )
      .populate(
        "proposal"
      )
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(limitNumber),

    Quotation.countDocuments(
      query
    ),

    Quotation.countDocuments({
      createdBy:
        req.user._id,
    }),

    Quotation.countDocuments({
      createdBy:
        req.user._id,
      status: "draft",
    }),

    Quotation.countDocuments({
      createdBy:
        req.user._id,
      status: "sent",
    }),

    Quotation.countDocuments({
      createdBy:
        req.user._id,
      status:
        "accepted",
    }),

    Quotation.countDocuments({
      createdBy:
        req.user._id,
      status:
        "rejected",
    }),

    Quotation.countDocuments({
      createdBy:
        req.user._id,
      status:
        "expired",
    }),
  ]);

  res.status(200).json({
    success: true,

    count:
      quotations.length,

    total,

    page:
      pageNumber,

    pages: Math.max(
      Math.ceil(
        total /
          limitNumber
      ),
      1
    ),

    stats: {
      total:
        totalQuotations,
      draft:
        draftCount,
      sent:
        sentCount,
      accepted:
        acceptedCount,
      rejected:
        rejectedCount,
      expired:
        expiredCount,
    },

    quotations,
  });
};

// ==============================
// GET QUOTATION BY ID
// ==============================

const getQuotationById =
  async (req, res) => {
    const quotation =
      await getOwnedQuotation(
        req.params
          .quotationId,
        req.user._id
      );

    await populateQuotation(
      quotation
    );

    res.status(200).json({
      success: true,
      quotation,
    });
  };

// ==============================
// GET QUOTATIONS BY LEAD
// ==============================

const getQuotationsByLead =
  async (req, res) => {
    const lead =
      await getOwnedLead(
        req.params.leadId,
        req.user._id
      );

    const quotations =
      await Quotation.find({
        createdBy:
          req.user._id,

        lead:
          lead._id,
      })
        .populate("lead")
        .populate(
          "business"
        )
        .populate(
          "proposal"
        )
        .sort({
          updatedAt: -1,
        });

    res.status(200).json({
      success: true,
      count:
        quotations.length,
      quotations,
    });
  };

// ==============================
// GET QUOTATIONS BY PROPOSAL
// ==============================

const getQuotationsByProposal =
  async (req, res) => {
    const proposal =
      await getOwnedProposal(
        req.params
          .proposalId,
        req.user._id
      );

    const quotations =
      await Quotation.find({
        createdBy:
          req.user._id,

        proposal:
          proposal._id,
      })
        .populate("lead")
        .populate(
          "business"
        )
        .populate(
          "proposal"
        )
        .sort({
          updatedAt: -1,
        });

    res.status(200).json({
      success: true,
      count:
        quotations.length,
      quotations,
    });
  };

// ==============================
// CREATE QUOTATION
// ==============================

const createQuotation =
  async (req, res) => {
    const leadId =
      req.params.leadId ||
      req.body.lead;

    if (!leadId) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Lead is required",
        });
    }

    const lead =
      await getOwnedLead(
        leadId,
        req.user._id
      );

    const title =
      String(
        req.body.title ||
          ""
      ).trim();

    if (!title) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Quotation title is required",
        });
    }

    let business = null;

    const requestedBusinessId =
      req.body.business ||
      lead.business ||
      null;

    if (
      requestedBusinessId
    ) {
      business =
        await getOwnedBusiness(
          requestedBusinessId,
          req.user._id
        );
    }

    if (
      req.body.business &&
      lead.business &&
      String(
        req.body.business
      ) !==
        String(
          lead.business
        )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Quotation business must match the lead business",
        });
    }

    let proposal = null;

    if (
      req.body.proposal
    ) {
      proposal =
        await getOwnedProposal(
          req.body.proposal,
          req.user._id
        );

      if (
        String(
          proposal.lead
        ) !==
        String(lead._id)
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Quotation proposal must belong to the same lead",
          });
      }

      if (
        proposal.business &&
        business &&
        String(
          proposal.business
        ) !==
          String(
            business._id
          )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Quotation proposal must belong to the same business",
          });
      }
    }

    const quotationNumber =
      await generateQuotationNumber(
        req.user._id
      );

    const lineItems =
      req.body.lineItems !==
      undefined
        ? normalizeLineItems(
            req.body
              .lineItems
          )
        : buildDefaultLineItems(
            {
              lead,
              proposal,
              title,
            }
          );

    const currency =
      String(
        req.body.currency ||
          proposal
            ?.pricingOverview
            ?.currency ||
          lead.currency ||
          "GHS"
      )
        .trim()
        .toUpperCase();

    const quotation =
      await Quotation.create(
        {
          createdBy:
            req.user._id,

          lead:
            lead._id,

          business:
            business?._id ||
            null,

          proposal:
            proposal?._id ||
            null,

          quotationNumber,

          title,

          status:
            "draft",

          currency,

          lineItems,

          discount:
            req.body.discount ??
            0,

          tax:
            req.body.tax ??
            0,

          paymentTerms:
            req.body
              .paymentTerms ||
            "",

          notes:
            req.body.notes ||
            "",

          validUntil:
            req.body
              .validUntil ||
            null,
        }
      );

    await populateQuotation(
      quotation
    );

    res.status(201).json({
      success: true,
      message:
        "Quotation created successfully",
      quotation,
    });
  };

// ==============================
// UPDATE QUOTATION
// ==============================

const updateQuotation =
  async (req, res) => {
    const quotation =
      await getOwnedQuotation(
        req.params
          .quotationId,
        req.user._id
      );

    if (
      ![
        "draft",
        "sent",
      ].includes(
        quotation.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Accepted, rejected or expired quotations cannot be edited",
        });
    }

    const allowedFields = [
      "title",
      "currency",
      "discount",
      "tax",
      "paymentTerms",
      "notes",
      "validUntil",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          Object.prototype.hasOwnProperty.call(
            req.body,
            field
          )
        ) {
          quotation[field] =
            req.body[field];
        }
      }
    );

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "lineItems"
      )
    ) {
      quotation.lineItems =
        normalizeLineItems(
          req.body
            .lineItems
        );
    }

    await quotation.save();

    await populateQuotation(
      quotation
    );

    res.status(200).json({
      success: true,
      message:
        "Quotation updated successfully",
      quotation,
    });
  };

// ==============================
// SEND QUOTATION
// ==============================

const sendQuotation =
  async (req, res) => {
    const quotation =
      await getOwnedQuotation(
        req.params
          .quotationId,
        req.user._id
      );

    if (
      quotation.status !==
      "draft"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only draft quotations can be sent",
        });
    }

    if (
      !Array.isArray(
        quotation.lineItems
      ) ||
      quotation.lineItems
        .length === 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Add at least one line item before sending the quotation",
        });
    }

    const lead =
      await getOwnedLead(
        quotation.lead,
        req.user._id
      );

    quotation.status =
      "sent";

    quotation.sentAt =
      new Date();

    quotation.acceptedAt =
      null;

    quotation.rejectedAt =
      null;

    quotation.expiredAt =
      null;

    await quotation.save();

    await syncLeadStatus(
      lead
    );

    await populateQuotation(
      quotation
    );

    res.status(200).json({
      success: true,
      message:
        "Quotation marked as sent",
      quotation,
    });
  };

// ==============================
// ACCEPT QUOTATION
// ==============================

const acceptQuotation =
  async (req, res) => {
    const quotation =
      await getOwnedQuotation(
        req.params
          .quotationId,
        req.user._id
      );

    if (
      quotation.status !==
      "sent"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only sent quotations can be accepted",
        });
    }

    const lead =
      await getOwnedLead(
        quotation.lead,
        req.user._id
      );

    quotation.status =
      "accepted";

    quotation.acceptedAt =
      new Date();

    quotation.rejectedAt =
      null;

    quotation.expiredAt =
      null;

    await quotation.save();

    await syncLeadStatus(
      lead
    );

    await populateQuotation(
      quotation
    );

    res.status(200).json({
      success: true,
      message:
        "Quotation accepted successfully",
      quotation,
    });
  };

// ==============================
// REJECT QUOTATION
// ==============================

const rejectQuotation =
  async (req, res) => {
    const quotation =
      await getOwnedQuotation(
        req.params
          .quotationId,
        req.user._id
      );

    if (
      quotation.status !==
      "sent"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only sent quotations can be rejected",
        });
    }

    quotation.status =
      "rejected";

    quotation.rejectedAt =
      new Date();

    quotation.acceptedAt =
      null;

    quotation.expiredAt =
      null;

    await quotation.save();

    await populateQuotation(
      quotation
    );

    res.status(200).json({
      success: true,
      message:
        "Quotation rejected successfully",
      quotation,
    });
  };

// ==============================
// EXPIRE QUOTATION
// ==============================

const expireQuotation =
  async (req, res) => {
    const quotation =
      await getOwnedQuotation(
        req.params
          .quotationId,
        req.user._id
      );

    if (
      ![
        "draft",
        "sent",
      ].includes(
        quotation.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only draft or sent quotations can be expired",
        });
    }

    quotation.status =
      "expired";

    quotation.expiredAt =
      new Date();

    await quotation.save();

    await populateQuotation(
      quotation
    );

    res.status(200).json({
      success: true,
      message:
        "Quotation marked as expired",
      quotation,
    });
  };

// ==============================
// REOPEN QUOTATION
// ==============================

const reopenQuotation =
  async (req, res) => {
    const quotation =
      await getOwnedQuotation(
        req.params
          .quotationId,
        req.user._id
      );

    if (
      ![
        "rejected",
        "expired",
      ].includes(
        quotation.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only rejected or expired quotations can be reopened",
        });
    }

    quotation.status =
      "draft";

    quotation.sentAt =
      null;

    quotation.acceptedAt =
      null;

    quotation.rejectedAt =
      null;

    quotation.expiredAt =
      null;

    await quotation.save();

    await populateQuotation(
      quotation
    );

    res.status(200).json({
      success: true,
      message:
        "Quotation reopened successfully",
      quotation,
    });
  };

// ==============================
// DELETE QUOTATION
// ==============================

const deleteQuotation =
  async (req, res) => {
    const quotation =
      await getOwnedQuotation(
        req.params
          .quotationId,
        req.user._id
      );

    await quotation.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Quotation deleted successfully",
    });
  };

module.exports = {
  getQuotations,
  getQuotationById,
  getQuotationsByLead,
  getQuotationsByProposal,
  createQuotation,
  updateQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  expireQuotation,
  reopenQuotation,
  deleteQuotation,
};