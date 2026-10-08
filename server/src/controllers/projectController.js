const Project = require(
  "../models/Project"
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

const Quotation = require(
  "../models/Quotation"
);

// ==============================
// HELPERS
// ==============================

const escapeRegex = (
  value = ""
) =>
  String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

const normalizeStringArray = (
  value
) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .map((item) =>
          String(
            item || ""
          ).trim()
        )
        .filter(Boolean)
    ),
  ];
};

const normalizeMilestones = (
  milestones
) => {
  if (!Array.isArray(milestones)) {
    return [];
  }

  return milestones
    .map((milestone) => ({
      title: String(
        milestone?.title || ""
      ).trim(),

      description: String(
        milestone?.description ||
          ""
      ).trim(),

      status: [
        "pending",
        "in_progress",
        "completed",
      ].includes(
        milestone?.status
      )
        ? milestone.status
        : "pending",

      dueDate:
        milestone?.dueDate ||
        null,

      completedAt:
        milestone?.status ===
        "completed"
          ? milestone
              ?.completedAt ||
            new Date()
          : null,
    }))
    .filter(
      (milestone) =>
        milestone.title
    );
};

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

const getOwnedBusiness =
  async (
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

const getOwnedProposal =
  async (
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
    if (!quotationId) {
      return null;
    }

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

const getOwnedProject =
  async (
    projectId,
    userId
  ) => {
    const project =
      await Project.findOne({
        _id: projectId,
        createdBy: userId,
      });

    if (!project) {
      const error =
        new Error(
          "Project not found"
        );

      error.statusCode = 404;

      throw error;
    }

    return project;
  };

const populateProject =
  async (project) => {
    await project.populate([
      {
        path: "lead",
      },
      {
        path: "business",
      },
      {
        path: "proposal",
      },
      {
        path: "quotation",
      },
    ]);

    return project;
  };

const generateProjectNumber =
  async (userId) => {
    const year =
      new Date().getFullYear();

    const prefix =
      `BF-PROJ-${year}-`;

    const latest =
      await Project.findOne({
        createdBy: userId,
        projectNumber: {
          $regex:
            `^${escapeRegex(
              prefix
            )}`,
        },
      })
        .sort({
          projectNumber: -1,
        })
        .select(
          "projectNumber"
        );

    let nextNumber = 1;

    if (
      latest?.projectNumber
    ) {
      const parts =
        latest.projectNumber.split(
          "-"
        );

      const lastPart =
        Number(
          parts[
            parts.length - 1
          ]
        );

      if (
        Number.isFinite(
          lastPart
        )
      ) {
        nextNumber =
          lastPart + 1;
      }
    }

    return `${prefix}${String(
      nextNumber
    ).padStart(4, "0")}`;
  };

const buildProposalScope = (
  proposal
) => {
  if (
    !Array.isArray(
      proposal?.scopeOfWork
    )
  ) {
    return "";
  }

  return proposal.scopeOfWork
    .map((item) => {
      const title =
        String(
          item?.title || ""
        ).trim();

      const description =
        String(
          item?.description ||
            ""
        ).trim();

      if (
        title &&
        description
      ) {
        return `${title}: ${description}`;
      }

      return (
        title ||
        description
      );
    })
    .filter(Boolean)
    .join("\n\n");
};

const buildProposalDeliverables =
  (proposal) => {
    if (
      !Array.isArray(
        proposal?.scopeOfWork
      )
    ) {
      return [];
    }

    return normalizeStringArray(
      proposal.scopeOfWork.flatMap(
        (item) =>
          Array.isArray(
            item?.deliverables
          )
            ? item.deliverables
            : []
      )
    );
  };

// ==============================
// GET PROJECTS
// ==============================

const getProjects = async (
  req,
  res
) => {
  const page =
    Math.max(
      Number(req.query.page) ||
        1,
      1
    );

  const limit =
    Math.min(
      Math.max(
        Number(
          req.query.limit
        ) || 20,
        1
      ),
      100
    );

  const skip =
    (page - 1) * limit;

  const filter = {
    createdBy:
      req.user._id,
  };

  const status =
    String(
      req.query.status || ""
    ).trim();

  if (
    status &&
    status !== "all"
  ) {
    filter.status = status;
  }

  if (req.query.leadId) {
    filter.lead =
      req.query.leadId;
  }

  if (
    req.query.businessId
  ) {
    filter.business =
      req.query.businessId;
  }

  const search =
    String(
      req.query.search || ""
    ).trim();

  if (search) {
    const regex =
      new RegExp(
        escapeRegex(search),
        "i"
      );

    filter.$or = [
      {
        projectNumber:
          regex,
      },
      {
        name: regex,
      },
      {
        summary: regex,
      },
      {
        services: regex,
      },
    ];
  }

  const [
    projects,
    total,
    statsResult,
  ] = await Promise.all([
    Project.find(filter)
      .populate("lead")
      .populate("business")
      .populate("proposal")
      .populate("quotation")
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Project.countDocuments(
      filter
    ),

    Project.aggregate([
      {
        $match: {
          createdBy:
            req.user._id,
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
  ]);

  const stats = {
    total: 0,
    planned: 0,
    in_progress: 0,
    on_hold: 0,
    completed: 0,
    cancelled: 0,
  };

  statsResult.forEach(
    (item) => {
      if (
        Object.prototype.hasOwnProperty.call(
          stats,
          item._id
        )
      ) {
        stats[
          item._id
        ] = item.count;
      }

      stats.total +=
        item.count;
    }
  );

  res.status(200).json({
    success: true,
    count:
      projects.length,
    total,
    page,
    pages:
      Math.max(
        Math.ceil(
          total / limit
        ),
        1
      ),
    stats,
    projects,
  });
};

// ==============================
// GET PROJECT BY ID
// ==============================

const getProjectById =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    await populateProject(
      project
    );

    res.status(200).json({
      success: true,
      project,
    });
  };

// ==============================
// GET PROJECT BY LEAD
// ==============================

const getProjectByLead =
  async (req, res) => {
    await getOwnedLead(
      req.params.leadId,
      req.user._id
    );

    const project =
      await Project.findOne({
        createdBy:
          req.user._id,

        lead:
          req.params.leadId,
      });

    if (!project) {
      return res
        .status(200)
        .json({
          success: true,
          project: null,
        });
    }

    await populateProject(
      project
    );

    res.status(200).json({
      success: true,
      project,
    });
  };

// ==============================
// CREATE PROJECT
// ==============================

const createProject =
  async (req, res) => {
    const lead =
      await getOwnedLead(
        req.params.leadId,
        req.user._id
      );

    if (
      lead.status !== "won"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only won leads can be converted into projects",
        });
    }

    const existing =
      await Project.findOne({
        createdBy:
          req.user._id,
        lead: lead._id,
      });

    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "A project already exists for this lead",
        });
    }

    const requestedBusinessId =
      req.body.business ||
      lead.business ||
      null;

    const business =
      await getOwnedBusiness(
        requestedBusinessId,
        req.user._id
      );

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
            "Project business must match the lead business",
        });
    }

    const proposal =
      await getOwnedProposal(
        req.body.proposal ||
          null,
        req.user._id
      );

    if (proposal) {
      if (
        String(
          proposal.lead
        ) !==
        String(lead._id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Proposal must belong to this lead",
          });
      }

      if (
        proposal.status !==
        "accepted"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Only accepted proposals can be linked to a project",
          });
      }
    }

    const quotation =
      await getOwnedQuotation(
        req.body.quotation ||
          null,
        req.user._id
      );

    if (quotation) {
      if (
        String(
          quotation.lead
        ) !==
        String(lead._id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Quotation must belong to this lead",
          });
      }

      if (
        quotation.status !==
        "accepted"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Only accepted quotations can be linked to a project",
          });
      }
    }

    const projectNumber =
      await generateProjectNumber(
        req.user._id
      );

    const defaultName =
      lead.companyName ||
      business?.name ||
      lead.name;

    const name = String(
      req.body.name ||
        `${defaultName} Project`
    ).trim();

    if (!name) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Project name is required",
        });
    }

    const services =
      req.body.services !==
      undefined
        ? normalizeStringArray(
            req.body.services
          )
        : normalizeStringArray(
            lead.servicesInterestedIn
          );

    const scope =
      req.body.scope !==
      undefined
        ? String(
            req.body.scope || ""
          ).trim()
        : buildProposalScope(
            proposal
          );

    const deliverables =
      req.body.deliverables !==
      undefined
        ? normalizeStringArray(
            req.body.deliverables
          )
        : buildProposalDeliverables(
            proposal
          );

    let projectValue =
      lead.estimatedValue || 0;

    let currency =
      lead.currency || "GHS";

    if (proposal) {
      projectValue =
        proposal
          ?.pricingOverview
          ?.estimatedAmount ??
        projectValue;

      currency =
        proposal
          ?.pricingOverview
          ?.currency ||
        currency;
    }

    if (quotation) {
      projectValue =
        quotation.total ??
        projectValue;

      currency =
        quotation.currency ||
        currency;
    }

    if (
      req.body.projectValue !==
      undefined
    ) {
      projectValue =
        Math.max(
          Number(
            req.body.projectValue
          ) || 0,
          0
        );
    }

    if (req.body.currency) {
      currency =
        String(
          req.body.currency
        )
          .trim()
          .toUpperCase();
    }

    const project =
      await Project.create({
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

        quotation:
          quotation?._id ||
          null,

        projectNumber,

        name,

        summary:
          req.body.summary !==
          undefined
            ? req.body.summary
            : lead.opportunitySummary ||
              "",

        status:
          "planned",

        progress: 0,

        services,

        scope,

        deliverables,

        milestones:
          normalizeMilestones(
            req.body.milestones
          ),

        projectValue,

        currency,

        startDate:
          req.body.startDate ||
          null,

        deadline:
          req.body.deadline ||
          null,

        notes:
          req.body.notes ||
          "",
      });

    await populateProject(
      project
    );

    res.status(201).json({
      success: true,
      message:
        "Project created successfully",
      project,
    });
  };

// ==============================
// UPDATE PROJECT
// ==============================

const updateProject =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    if (
      [
        "completed",
        "cancelled",
      ].includes(
        project.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Completed or cancelled projects must be reopened before editing",
        });
    }

    const stringFields = [
      "name",
      "summary",
      "scope",
      "notes",
    ];

    stringFields.forEach(
      (field) => {
        if (
          Object.prototype.hasOwnProperty.call(
            req.body,
            field
          )
        ) {
          project[field] =
            req.body[field];
        }
      }
    );

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "services"
      )
    ) {
      project.services =
        normalizeStringArray(
          req.body.services
        );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "deliverables"
      )
    ) {
      project.deliverables =
        normalizeStringArray(
          req.body.deliverables
        );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "projectValue"
      )
    ) {
      project.projectValue =
        Math.max(
          Number(
            req.body.projectValue
          ) || 0,
          0
        );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "currency"
      )
    ) {
      project.currency =
        String(
          req.body.currency ||
            "GHS"
        )
          .trim()
          .toUpperCase();
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "startDate"
      )
    ) {
      project.startDate =
        req.body.startDate ||
        null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "deadline"
      )
    ) {
      project.deadline =
        req.body.deadline ||
        null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "progress"
      )
    ) {
      project.progress =
        Math.min(
          Math.max(
            Number(
              req.body.progress
            ) || 0,
            0
          ),
          100
        );
    }

    await project.save();

    await populateProject(
      project
    );

    res.status(200).json({
      success: true,
      message:
        "Project updated successfully",
      project,
    });
  };

// ==============================
// START / RESUME PROJECT
// ==============================

const startProject =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    if (
      ![
        "planned",
        "on_hold",
      ].includes(
        project.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only planned or on-hold projects can be started",
        });
    }

    project.status =
      "in_progress";

    if (!project.startDate) {
      project.startDate =
        new Date();
    }

    await project.save();

    await populateProject(
      project
    );

    res.status(200).json({
      success: true,
      message:
        "Project started successfully",
      project,
    });
  };

// ==============================
// HOLD PROJECT
// ==============================

const holdProject =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    if (
      project.status !==
      "in_progress"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only in-progress projects can be placed on hold",
        });
    }

    project.status =
      "on_hold";

    await project.save();

    await populateProject(
      project
    );

    res.status(200).json({
      success: true,
      message:
        "Project placed on hold",
      project,
    });
  };

// ==============================
// COMPLETE PROJECT
// ==============================

const completeProject =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    if (
      ![
        "planned",
        "in_progress",
        "on_hold",
      ].includes(
        project.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "This project cannot be completed from its current status",
        });
    }

    project.status =
      "completed";

    project.progress = 100;

    project.completedAt =
      new Date();

    project.cancelledAt =
      null;

    project.cancellationReason =
      "";

    project.milestones.forEach(
      (milestone) => {
        if (
          milestone.status !==
          "completed"
        ) {
          milestone.status =
            "completed";

          milestone.completedAt =
            new Date();
        }
      }
    );

    await project.save();

    await populateProject(
      project
    );

    res.status(200).json({
      success: true,
      message:
        "Project completed successfully",
      project,
    });
  };

// ==============================
// CANCEL PROJECT
// ==============================

const cancelProject =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    if (
      [
        "completed",
        "cancelled",
      ].includes(
        project.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "This project cannot be cancelled from its current status",
        });
    }

    project.status =
      "cancelled";

    project.cancelledAt =
      new Date();

    project.completedAt =
      null;

    project.cancellationReason =
      String(
        req.body
          .cancellationReason ||
          ""
      ).trim();

    await project.save();

    await populateProject(
      project
    );

    res.status(200).json({
      success: true,
      message:
        "Project cancelled successfully",
      project,
    });
  };

// ==============================
// REOPEN PROJECT
// ==============================

const reopenProject =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    if (
      ![
        "completed",
        "cancelled",
      ].includes(
        project.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only completed or cancelled projects can be reopened",
        });
    }

    project.status =
      "planned";

    project.completedAt =
      null;

    project.cancelledAt =
      null;

    project.cancellationReason =
      "";

    if (
      project.progress === 100
    ) {
      project.progress = 0;
    }

    await project.save();

    await populateProject(
      project
    );

    res.status(200).json({
      success: true,
      message:
        "Project reopened successfully",
      project,
    });
  };

// ==============================
// ADD MILESTONE
// ==============================

const addMilestone =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    if (
      [
        "completed",
        "cancelled",
      ].includes(
        project.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Milestones cannot be changed on a completed or cancelled project",
        });
    }

    const title = String(
      req.body.title || ""
    ).trim();

    if (!title) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Milestone title is required",
        });
    }

    project.milestones.push({
      title,

      description:
        req.body.description ||
        "",

      status:
        "pending",

      dueDate:
        req.body.dueDate ||
        null,

      completedAt:
        null,
    });

    await project.save();

    await populateProject(
      project
    );

    res.status(201).json({
      success: true,
      message:
        "Milestone added successfully",
      project,
    });
  };

// ==============================
// UPDATE MILESTONE
// ==============================

const updateMilestone =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    if (
      [
        "completed",
        "cancelled",
      ].includes(
        project.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Milestones cannot be changed on a completed or cancelled project",
        });
    }

    const milestone =
      project.milestones.id(
        req.params.milestoneId
      );

    if (!milestone) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Milestone not found",
        });
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "title"
      )
    ) {
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
              "Milestone title is required",
          });
      }

      milestone.title =
        title;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "description"
      )
    ) {
      milestone.description =
        req.body.description;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "dueDate"
      )
    ) {
      milestone.dueDate =
        req.body.dueDate ||
        null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "status"
      )
    ) {
      const nextStatus =
        req.body.status;

      if (
        ![
          "pending",
          "in_progress",
          "completed",
        ].includes(
          nextStatus
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid milestone status",
          });
      }

      milestone.status =
        nextStatus;

      milestone.completedAt =
        nextStatus ===
        "completed"
          ? new Date()
          : null;
    }

    await project.save();

    await populateProject(
      project
    );

    res.status(200).json({
      success: true,
      message:
        "Milestone updated successfully",
      project,
    });
  };

// ==============================
// DELETE MILESTONE
// ==============================

const deleteMilestone =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    if (
      [
        "completed",
        "cancelled",
      ].includes(
        project.status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Milestones cannot be changed on a completed or cancelled project",
        });
    }

    const milestone =
      project.milestones.id(
        req.params.milestoneId
      );

    if (!milestone) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Milestone not found",
        });
    }

    milestone.deleteOne();

    await project.save();

    await populateProject(
      project
    );

    res.status(200).json({
      success: true,
      message:
        "Milestone deleted successfully",
      project,
    });
  };

// ==============================
// DELETE PROJECT
// ==============================

const deleteProject =
  async (req, res) => {
    const project =
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Project deleted successfully",
    });
  };

// ==============================
// EXPORTS
// ==============================

module.exports = {
  getProjects,
  getProjectById,
  getProjectByLead,
  createProject,
  updateProject,
  startProject,
  holdProject,
  completeProject,
  cancelProject,
  reopenProject,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  deleteProject,
};