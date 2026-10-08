const Proposal = require(
  "../models/Proposal"
);

const Lead = require(
  "../models/Lead"
);

const Business = require(
  "../models/Business"
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
  const lead = await Lead.findOne({
    _id: leadId,
    createdBy: userId,
  });

  if (!lead) {
    const error = new Error(
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
    const error = new Error(
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
  const proposal =
    await Proposal.findOne({
      _id: proposalId,
      createdBy: userId,
    });

  if (!proposal) {
    const error = new Error(
      "Proposal not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return proposal;
};

const populateProposal = async (
  proposal
) => {
  if (!proposal) {
    return proposal;
  }

  await proposal.populate(
    "lead"
  );

  await proposal.populate(
    "business"
  );

  return proposal;
};

const normalizeStringArray = (
  values
) => {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) =>
      String(value || "").trim()
    )
    .filter(Boolean);
};

const normalizeScopeOfWork = (
  items
) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      title: String(
        item?.title || ""
      ).trim(),

      description: String(
        item?.description || ""
      ).trim(),

      deliverables:
        normalizeStringArray(
          item?.deliverables
        ),
    }))
    .filter(
      (item) => item.title
    );
};

const generateProposalNumber =
  async (userId) => {
    const year =
      new Date().getFullYear();

    const prefix =
      `BF-PROP-${year}-`;

    const latest =
      await Proposal.findOne({
        createdBy: userId,

        proposalNumber: {
          $regex: new RegExp(
            `^${escapeRegex(
              prefix
            )}\\d+$`
          ),
        },
      })
        .sort({
          proposalNumber: -1,
        })
        .select(
          "proposalNumber"
        );

    let nextNumber = 1;

    if (latest?.proposalNumber) {
      const parts =
        latest.proposalNumber.split(
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

const syncLeadStatus = async (
  lead,
  proposalStatus
) => {
  if (
    !lead ||
    ["won", "lost"].includes(
      lead.status
    )
  ) {
    return;
  }

  if (
    proposalStatus === "sent"
  ) {
    // Never move a lead backward if it has
    // already reached proposal or negotiation.
    if (
      ["proposal", "negotiation"].includes(
        lead.status
      )
    ) {
      return;
    }

    lead.status = "proposal";

    await lead.save();

    return;
  }

  if (
    proposalStatus ===
    "accepted"
  ) {
    if (
      lead.status ===
      "negotiation"
    ) {
      return;
    }

    lead.status =
      "negotiation";

    await lead.save();
  }
};

// ==============================
// GET PROPOSALS
// ==============================

const getProposals = async (
  req,
  res
) => {
  const {
    status = "all",
    search = "",
    leadId = "",
    businessId = "",
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

    query.lead = leadId;
  }

  if (businessId) {
    await getOwnedBusiness(
      businessId,
      req.user._id
    );

    query.business =
      businessId;
  }

  const normalizedSearch =
    String(search || "").trim();

  if (normalizedSearch) {
    const regex =
      new RegExp(
        escapeRegex(
          normalizedSearch
        ),
        "i"
      );

    query.$or = [
      {
        proposalNumber:
          regex,
      },
      {
        title: regex,
      },
      {
        summary: regex,
      },
      {
        clientProblem:
          regex,
      },
      {
        proposedSolution:
          regex,
      },
      {
        notes: regex,
      },
    ];
  }

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const [
    proposals,
    total,
    totalProposals,
    draftCount,
    sentCount,
    acceptedCount,
    rejectedCount,
    expiredCount,
  ] = await Promise.all([
    Proposal.find(query)
      .populate("lead")
      .populate("business")
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(limitNumber),

    Proposal.countDocuments(
      query
    ),

    Proposal.countDocuments({
      createdBy:
        req.user._id,
    }),

    Proposal.countDocuments({
      createdBy:
        req.user._id,
      status: "draft",
    }),

    Proposal.countDocuments({
      createdBy:
        req.user._id,
      status: "sent",
    }),

    Proposal.countDocuments({
      createdBy:
        req.user._id,
      status: "accepted",
    }),

    Proposal.countDocuments({
      createdBy:
        req.user._id,
      status: "rejected",
    }),

    Proposal.countDocuments({
      createdBy:
        req.user._id,
      status: "expired",
    }),
  ]);

  res.status(200).json({
    success: true,

    count:
      proposals.length,

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
        totalProposals,
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

    proposals,
  });
};

// ==============================
// GET PROPOSAL BY ID
// ==============================

const getProposalById = async (
  req,
  res
) => {
  const proposal =
    await getOwnedProposal(
      req.params.proposalId,
      req.user._id
    );

  await populateProposal(
    proposal
  );

  res.status(200).json({
    success: true,
    proposal,
  });
};

// ==============================
// GET PROPOSALS BY LEAD
// ==============================

const getProposalsByLead =
  async (req, res) => {
    const lead =
      await getOwnedLead(
        req.params.leadId,
        req.user._id
      );

    const proposals =
      await Proposal.find({
        createdBy:
          req.user._id,
        lead:
          lead._id,
      })
        .populate("lead")
        .populate(
          "business"
        )
        .sort({
          updatedAt: -1,
        });

    res.status(200).json({
      success: true,
      count:
        proposals.length,
      proposals,
    });
  };

// ==============================
// CREATE PROPOSAL
// ==============================

const createProposal = async (
  req,
  res
) => {
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

  const title = String(
    req.body.title || ""
  ).trim();

  if (!title) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Proposal title is required",
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
          "Proposal business must match the lead business",
      });
  }

  const proposalNumber =
    await generateProposalNumber(
      req.user._id
    );

  const initialScope =
    req.body.scopeOfWork !==
    undefined
      ? normalizeScopeOfWork(
          req.body.scopeOfWork
        )
      : Array.isArray(
            lead.servicesInterestedIn
          )
        ? lead.servicesInterestedIn.map(
            (service) => ({
              title: String(
                service
              ).trim(),
              description: "",
              deliverables: [],
            })
          )
        : [];

  const estimatedAmount =
    req.body.pricingOverview
      ?.estimatedAmount !==
    undefined
      ? req.body
          .pricingOverview
          .estimatedAmount
      : lead.estimatedValue ||
        0;

  const proposal =
    await Proposal.create({
      createdBy:
        req.user._id,

      lead:
        lead._id,

      business:
        business?._id ||
        null,

      proposalNumber,

      title,

      status:
        "draft",

      summary:
        req.body.summary !==
        undefined
          ? req.body.summary
          : lead.opportunitySummary ||
            "",

      clientProblem:
        req.body
          .clientProblem ||
        "",

      proposedSolution:
        req.body
          .proposedSolution ||
        "",

      objectives:
        normalizeStringArray(
          req.body.objectives
        ),

      scopeOfWork:
        initialScope,

      timeline:
        req.body.timeline ||
        {},

      pricingOverview: {
        currency:
          req.body
            .pricingOverview
            ?.currency ||
          "GHS",

        estimatedAmount,

        note:
          req.body
            .pricingOverview
            ?.note ||
          "",
      },

      termsAndConditions:
        req.body
          .termsAndConditions ||
        "",

      notes:
        req.body.notes ||
        "",

      validUntil:
        req.body.validUntil ||
        null,
    });

  await populateProposal(
    proposal
  );

  res.status(201).json({
    success: true,
    message:
      "Proposal created successfully",
    proposal,
  });
};

// ==============================
// UPDATE PROPOSAL
// ==============================

const updateProposal = async (
  req,
  res
) => {
  const proposal =
    await getOwnedProposal(
      req.params.proposalId,
      req.user._id
    );

  if (
    proposal.status !==
      "draft" &&
    proposal.status !==
      "sent"
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Accepted, rejected or expired proposals cannot be edited",
      });
  }

  const allowedFields = [
    "title",
    "summary",
    "clientProblem",
    "proposedSolution",
    "timeline",
    "pricingOverview",
    "termsAndConditions",
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
        proposal[field] =
          req.body[field];
      }
    }
  );

  if (
    Object.prototype.hasOwnProperty.call(
      req.body,
      "objectives"
    )
  ) {
    proposal.objectives =
      normalizeStringArray(
        req.body.objectives
      );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      req.body,
      "scopeOfWork"
    )
  ) {
    proposal.scopeOfWork =
      normalizeScopeOfWork(
        req.body.scopeOfWork
      );
  }

  await proposal.save();

  await populateProposal(
    proposal
  );

  res.status(200).json({
    success: true,
    message:
      "Proposal updated successfully",
    proposal,
  });
};

// ==============================
// SEND PROPOSAL
// ==============================

const sendProposal = async (
  req,
  res
) => {
  const proposal =
    await getOwnedProposal(
      req.params.proposalId,
      req.user._id
    );

  if (
    [
      "accepted",
      "rejected",
      "expired",
    ].includes(
      proposal.status
    )
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "This proposal can no longer be sent",
      });
  }

  const lead =
    await getOwnedLead(
      proposal.lead,
      req.user._id
    );

  proposal.status =
    "sent";

  proposal.sentAt =
    new Date();

  proposal.acceptedAt =
    null;

  proposal.rejectedAt =
    null;

  await proposal.save();

  await syncLeadStatus(
    lead,
    "sent"
  );

  await populateProposal(
    proposal
  );

  res.status(200).json({
    success: true,
    message:
      "Proposal marked as sent",
    proposal,
  });
};

// ==============================
// ACCEPT PROPOSAL
// ==============================

const acceptProposal = async (
  req,
  res
) => {
  const proposal =
    await getOwnedProposal(
      req.params.proposalId,
      req.user._id
    );

  if (
    proposal.status !==
    "sent"
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Only sent proposals can be accepted",
      });
  }

  const lead =
    await getOwnedLead(
      proposal.lead,
      req.user._id
    );

  proposal.status =
    "accepted";

  proposal.acceptedAt =
    new Date();

  proposal.rejectedAt =
    null;

  await proposal.save();

  await syncLeadStatus(
    lead,
    "accepted"
  );

  await populateProposal(
    proposal
  );

  res.status(200).json({
    success: true,
    message:
      "Proposal accepted successfully",
    proposal,
  });
};

// ==============================
// REJECT PROPOSAL
// ==============================

const rejectProposal = async (
  req,
  res
) => {
  const proposal =
    await getOwnedProposal(
      req.params.proposalId,
      req.user._id
    );

  if (
    proposal.status !==
    "sent"
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Only sent proposals can be rejected",
      });
  }

  proposal.status =
    "rejected";

  proposal.rejectedAt =
    new Date();

  proposal.acceptedAt =
    null;

  await proposal.save();

  await populateProposal(
    proposal
  );

  res.status(200).json({
    success: true,
    message:
      "Proposal rejected successfully",
    proposal,
  });
};

// ==============================
// EXPIRE PROPOSAL
// ==============================

const expireProposal = async (
  req,
  res
) => {
  const proposal =
    await getOwnedProposal(
      req.params.proposalId,
      req.user._id
    );

  if (
    proposal.status ===
      "accepted" ||
    proposal.status ===
      "rejected"
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Accepted or rejected proposals cannot be expired",
      });
  }

  proposal.status =
    "expired";

  await proposal.save();

  await populateProposal(
    proposal
  );

  res.status(200).json({
    success: true,
    message:
      "Proposal marked as expired",
    proposal,
  });
};

// ==============================
// REOPEN PROPOSAL
// ==============================

const reopenProposal = async (
  req,
  res
) => {
  const proposal =
    await getOwnedProposal(
      req.params.proposalId,
      req.user._id
    );

  if (
    ![
      "rejected",
      "expired",
    ].includes(
      proposal.status
    )
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Only rejected or expired proposals can be reopened",
      });
  }

  proposal.status =
    "draft";

  proposal.sentAt =
    null;

  proposal.acceptedAt =
    null;

  proposal.rejectedAt =
    null;

  await proposal.save();

  await populateProposal(
    proposal
  );

  res.status(200).json({
    success: true,
    message:
      "Proposal reopened successfully",
    proposal,
  });
};

// ==============================
// DELETE PROPOSAL
// ==============================

const deleteProposal = async (
  req,
  res
) => {
  const proposal =
    await getOwnedProposal(
      req.params.proposalId,
      req.user._id
    );

  await proposal.deleteOne();

  res.status(200).json({
    success: true,
    message:
      "Proposal deleted successfully",
  });
};

module.exports = {
  getProposals,
  getProposalById,
  getProposalsByLead,
  createProposal,
  updateProposal,
  sendProposal,
  acceptProposal,
  rejectProposal,
  expireProposal,
  reopenProposal,
  deleteProposal,
};