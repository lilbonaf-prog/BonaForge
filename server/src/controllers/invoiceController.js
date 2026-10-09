const Invoice = require(
  "../models/Invoice"
);

const Project = require(
  "../models/Project"
);

const Lead = require(
  "../models/Lead"
);

const Business = require(
  "../models/Business"
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
  value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

const createError = (
  message,
  statusCode
) => {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

const normalizeItems = (
  items
) => {
  if (
    !Array.isArray(items)
  ) {
    return [];
  }

  return items
    .map((item) => ({
      description:
        String(
          item?.description ||
            ""
        ).trim(),

      quantity:
        Math.max(
          Number(
            item?.quantity
          ) || 0,
          0
        ),

      unitPrice:
        Math.max(
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
      throw createError(
        "Project not found",
        404
      );
    }

    return project;
  };

const getOwnedLead =
  async (
    leadId,
    userId
  ) => {
    const lead =
      await Lead.findOne({
        _id: leadId,
        createdBy: userId,
      });

    if (!lead) {
      throw createError(
        "Lead not found",
        404
      );
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
      throw createError(
        "Business not found",
        404
      );
    }

    return business;
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
      throw createError(
        "Quotation not found",
        404
      );
    }

    return quotation;
  };

const getOwnedInvoice =
  async (
    invoiceId,
    userId
  ) => {
    const invoice =
      await Invoice.findOne({
        _id: invoiceId,
        createdBy: userId,
      });

    if (!invoice) {
      throw createError(
        "Invoice not found",
        404
      );
    }

    return invoice;
  };

const populateInvoice =
  async (invoice) => {
    await invoice.populate([
      {
        path: "project",
        select:
          "projectNumber name status progress projectValue currency startDate deadline",
      },
      {
        path: "lead",
        select:
          "name companyName email phone whatsapp status estimatedValue currency",
      },
      {
        path: "business",
        select:
          "name industry website status",
      },
      {
        path: "quotation",
        select:
          "quotationNumber title status subtotal discount tax total currency",
      },
    ]);

    return invoice;
  };

const generateInvoiceNumber =
  async (userId) => {
    const year =
      new Date().getFullYear();

    const prefix =
      `BF-INV-${year}-`;

    const latest =
      await Invoice.findOne({
        createdBy: userId,
        invoiceNumber: {
          $regex:
            `^${escapeRegex(
              prefix
            )}`,
        },
      })
        .sort({
          invoiceNumber: -1,
        })
        .select(
          "invoiceNumber"
        )
        .lean();

    let nextNumber = 1;

    if (
      latest?.invoiceNumber
    ) {
      const lastPart =
        latest.invoiceNumber
          .split("-")
          .pop();

      const parsed =
        Number(lastPart);

      if (
        Number.isFinite(
          parsed
        )
      ) {
        nextNumber =
          parsed + 1;
      }
    }

    return `${prefix}${String(
      nextNumber
    ).padStart(4, "0")}`;
  };

const ensureProjectRelations =
  async (
    project,
    userId
  ) => {
    const lead =
      await getOwnedLead(
        project.lead,
        userId
      );

    const business =
      project.business
        ? await getOwnedBusiness(
            project.business,
            userId
          )
        : null;

    return {
      lead,
      business,
    };
  };

// ==============================
// GET INVOICES
// ==============================

exports.getInvoices =
  async (
    req,
    res,
    next
  ) => {
    try {
      const page =
        Math.max(
          Number(
            req.query.page
          ) || 1,
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
        (page - 1) *
        limit;

      const query = {
        createdBy:
          req.user._id,
      };

      const status =
        String(
          req.query.status ||
            ""
        ).trim();

      if (
        status &&
        status !== "all"
      ) {
        query.status =
          status;
      }

      if (
        req.query.projectId
      ) {
        query.project =
          req.query.projectId;
      }

      if (
        req.query.leadId
      ) {
        query.lead =
          req.query.leadId;
      }

      if (
        req.query.businessId
      ) {
        query.business =
          req.query.businessId;
      }

      const search =
        String(
          req.query.search ||
            ""
        ).trim();

      if (search) {
        const regex =
          new RegExp(
            escapeRegex(
              search
            ),
            "i"
          );

        query.$or = [
          {
            invoiceNumber:
              regex,
          },
          {
            title: regex,
          },
          {
            notes: regex,
          },
          {
            paymentTerms:
              regex,
          },
        ];
      }

      const [
        invoices,
        total,
        statsRows,
      ] = await Promise.all([
        Invoice.find(query)
          .populate({
            path: "project",
            select:
              "projectNumber name status",
          })
          .populate({
            path: "lead",
            select:
              "name companyName",
          })
          .populate({
            path: "business",
            select:
              "name",
          })
          .populate({
            path: "quotation",
            select:
              "quotationNumber title status",
          })
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Invoice.countDocuments(
          query
        ),

        Invoice.aggregate([
          {
            $match: {
              createdBy:
                req.user._id,
            },
          },
          {
            $group: {
              _id:
                "$status",
              count: {
                $sum: 1,
              },
              totalValue: {
                $sum:
                  "$total",
              },
              amountPaid: {
                $sum:
                  "$amountPaid",
              },
              balanceDue: {
                $sum:
                  "$balanceDue",
              },
            },
          },
        ]),
      ]);

      const stats = {
        total: 0,
        draft: 0,
        sent: 0,
        partially_paid: 0,
        paid: 0,
        overdue: 0,
        cancelled: 0,
        totalValue: 0,
        amountPaid: 0,
        balanceDue: 0,
      };

      statsRows.forEach(
        (row) => {
          if (
            Object.prototype.hasOwnProperty.call(
              stats,
              row._id
            )
          ) {
            stats[row._id] =
              row.count;
          }

          stats.total +=
            row.count;

          if (
            row._id !==
            "cancelled"
          ) {
            stats.totalValue +=
              Number(
                row.totalValue
              ) || 0;

            stats.amountPaid +=
              Number(
                row.amountPaid
              ) || 0;

            stats.balanceDue +=
              Number(
                row.balanceDue
              ) || 0;
          }
        }
      );

      res.json({
        success: true,
        invoices,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages:
            Math.max(
              Math.ceil(
                total /
                  limit
              ),
              1
            ),
        },
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// GET ONE INVOICE
// ==============================

exports.getInvoiceById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const invoice =
        await getOwnedInvoice(
          req.params.invoiceId,
          req.user._id
        );

      await populateInvoice(
        invoice
      );

      res.json({
        success: true,
        invoice,
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// GET PROJECT INVOICES
// ==============================

exports.getProjectInvoices =
  async (
    req,
    res,
    next
  ) => {
    try {
      await getOwnedProject(
        req.params.projectId,
        req.user._id
      );

      const invoices =
        await Invoice.find({
          createdBy:
            req.user._id,

          project:
            req.params.projectId,
        })
          .populate({
            path: "quotation",
            select:
              "quotationNumber title status",
          })
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        invoices,
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// GET LEAD INVOICES
// ==============================

exports.getLeadInvoices =
  async (
    req,
    res,
    next
  ) => {
    try {
      await getOwnedLead(
        req.params.leadId,
        req.user._id
      );

      const invoices =
        await Invoice.find({
          createdBy:
            req.user._id,

          lead:
            req.params.leadId,
        })
          .populate({
            path: "project",
            select:
              "projectNumber name status",
          })
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        invoices,
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// CREATE INVOICE
// ==============================

exports.createInvoice =
  async (
    req,
    res,
    next
  ) => {
    try {
      const project =
        await getOwnedProject(
          req.params.projectId,
          req.user._id
        );

      if (
        project.status ===
        "cancelled"
      ) {
        throw createError(
          "Cannot create an invoice for a cancelled project",
          400
        );
      }

      const {
        lead,
        business,
      } =
        await ensureProjectRelations(
          project,
          req.user._id
        );

      let quotation = null;

      const quotationId =
        req.body.quotation ||
        project.quotation ||
        null;

      if (quotationId) {
        quotation =
          await getOwnedQuotation(
            quotationId,
            req.user._id
          );

        if (
          String(
            quotation.lead
          ) !==
          String(
            project.lead
          )
        ) {
          throw createError(
            "Quotation does not belong to this project's lead",
            400
          );
        }

        if (
          quotation.status !==
          "accepted"
        ) {
          throw createError(
            "Only accepted quotations can be linked to an invoice",
            400
          );
        }
      }

      const invoiceNumber =
        await generateInvoiceNumber(
          req.user._id
        );

      let items =
        normalizeItems(
          req.body.items
        );

      if (
        items.length === 0
      ) {
        items = [
          {
            description:
              project.name,

            quantity: 1,

            unitPrice:
              Number(
                project.projectValue
              ) || 0,
          },
        ];
      }

      const invoice =
        await Invoice.create({
          createdBy:
            req.user._id,

          project:
            project._id,

          lead:
            lead._id,

          business:
            business?._id ||
            null,

          quotation:
            quotation?._id ||
            null,

          invoiceNumber,

          title:
            String(
              req.body.title ||
                `${project.name} Invoice`
            ).trim(),

          items,

          discount:
            Math.max(
              Number(
                req.body.discount
              ) || 0,
              0
            ),

          tax:
            Math.max(
              Number(
                req.body.tax
              ) || 0,
              0
            ),

          currency:
            String(
              req.body.currency ||
                project.currency ||
                quotation?.currency ||
                "GHS"
            )
              .trim()
              .toUpperCase(),

          issueDate:
            req.body.issueDate ||
            new Date(),

          dueDate:
            req.body.dueDate ||
            null,

          paymentTerms:
            String(
              req.body.paymentTerms ||
                ""
            ),

          notes:
            String(
              req.body.notes ||
                ""
            ),

          status:
            "draft",
        });

      await populateInvoice(
        invoice
      );

      res.status(201).json({
        success: true,
        message:
          "Invoice created successfully",
        invoice,
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// UPDATE INVOICE
// ==============================

exports.updateInvoice =
  async (
    req,
    res,
    next
  ) => {
    try {
      const invoice =
        await getOwnedInvoice(
          req.params.invoiceId,
          req.user._id
        );

      if (
        invoice.status !==
        "draft"
      ) {
        throw createError(
          "Only draft invoices can be edited",
          400
        );
      }

      if (
        req.body.title !==
        undefined
      ) {
        invoice.title =
          String(
            req.body.title
          ).trim();
      }

      if (
        req.body.items !==
        undefined
      ) {
        invoice.items =
          normalizeItems(
            req.body.items
          );
      }

      if (
        req.body.discount !==
        undefined
      ) {
        invoice.discount =
          Math.max(
            Number(
              req.body.discount
            ) || 0,
            0
          );
      }

      if (
        req.body.tax !==
        undefined
      ) {
        invoice.tax =
          Math.max(
            Number(
              req.body.tax
            ) || 0,
            0
          );
      }

      if (
        req.body.currency !==
        undefined
      ) {
        invoice.currency =
          String(
            req.body.currency ||
              "GHS"
          )
            .trim()
            .toUpperCase();
      }

      if (
        req.body.issueDate !==
        undefined
      ) {
        invoice.issueDate =
          req.body.issueDate ||
          null;
      }

      if (
        req.body.dueDate !==
        undefined
      ) {
        invoice.dueDate =
          req.body.dueDate ||
          null;
      }

      if (
        req.body.paymentTerms !==
        undefined
      ) {
        invoice.paymentTerms =
          String(
            req.body.paymentTerms ||
              ""
          );
      }

      if (
        req.body.notes !==
        undefined
      ) {
        invoice.notes =
          String(
            req.body.notes ||
              ""
          );
      }

      await invoice.save();

      await populateInvoice(
        invoice
      );

      res.json({
        success: true,
        message:
          "Invoice updated successfully",
        invoice,
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// SEND INVOICE
// ==============================

exports.sendInvoice =
  async (
    req,
    res,
    next
  ) => {
    try {
      const invoice =
        await getOwnedInvoice(
          req.params.invoiceId,
          req.user._id
        );

      if (
        invoice.status !==
        "draft"
      ) {
        throw createError(
          "Only draft invoices can be sent",
          400
        );
      }

      if (
        invoice.items.length ===
        0
      ) {
        throw createError(
          "Invoice must contain at least one item before sending",
          400
        );
      }

      if (
        invoice.total <= 0
      ) {
        throw createError(
          "Invoice total must be greater than zero before sending",
          400
        );
      }

      invoice.status =
        "sent";

      invoice.sentAt =
        new Date();

      invoice.cancelledAt =
        null;

      invoice.cancellationReason =
        "";

      await invoice.save();

      await populateInvoice(
        invoice
      );

      res.json({
        success: true,
        message:
          "Invoice marked as sent",
        invoice,
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// MARK OVERDUE
// ==============================

exports.markInvoiceOverdue =
  async (
    req,
    res,
    next
  ) => {
    try {
      const invoice =
        await getOwnedInvoice(
          req.params.invoiceId,
          req.user._id
        );

      if (
        ![
          "sent",
          "partially_paid",
        ].includes(
          invoice.status
        )
      ) {
        throw createError(
          "Only sent or partially paid invoices can be marked overdue",
          400
        );
      }

      if (
        invoice.balanceDue <= 0
      ) {
        throw createError(
          "Paid invoices cannot be marked overdue",
          400
        );
      }

      invoice.status =
        "overdue";

      await invoice.save();

      await populateInvoice(
        invoice
      );

      res.json({
        success: true,
        message:
          "Invoice marked as overdue",
        invoice,
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// CANCEL INVOICE
// ==============================

exports.cancelInvoice =
  async (
    req,
    res,
    next
  ) => {
    try {
      const invoice =
        await getOwnedInvoice(
          req.params.invoiceId,
          req.user._id
        );

      if (
        invoice.status ===
        "cancelled"
      ) {
        throw createError(
          "Invoice is already cancelled",
          400
        );
      }

      if (
        invoice.status ===
        "paid"
      ) {
        throw createError(
          "A paid invoice cannot be cancelled",
          400
        );
      }

      if (
        invoice.amountPaid > 0
      ) {
        throw createError(
          "An invoice with recorded payments cannot be cancelled",
          400
        );
      }

      invoice.status =
        "cancelled";

      invoice.cancelledAt =
        new Date();

      invoice.cancellationReason =
        String(
          req.body
            .cancellationReason ||
            ""
        ).trim();

      await invoice.save();

      await populateInvoice(
        invoice
      );

      res.json({
        success: true,
        message:
          "Invoice cancelled successfully",
        invoice,
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// REOPEN INVOICE
// ==============================

exports.reopenInvoice =
  async (
    req,
    res,
    next
  ) => {
    try {
      const invoice =
        await getOwnedInvoice(
          req.params.invoiceId,
          req.user._id
        );

      if (
        invoice.status !==
        "cancelled"
      ) {
        throw createError(
          "Only cancelled invoices can be reopened",
          400
        );
      }

      if (
        invoice.amountPaid > 0
      ) {
        throw createError(
          "Invoice cannot be reopened while payments are recorded",
          400
        );
      }

      invoice.status =
        "draft";

      invoice.cancelledAt =
        null;

      invoice.cancellationReason =
        "";

      invoice.sentAt =
        null;

      await invoice.save();

      await populateInvoice(
        invoice
      );

      res.json({
        success: true,
        message:
          "Invoice reopened successfully",
        invoice,
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// DELETE INVOICE
// ==============================

exports.deleteInvoice =
  async (
    req,
    res,
    next
  ) => {
    try {
      const invoice =
        await getOwnedInvoice(
          req.params.invoiceId,
          req.user._id
        );

      if (
        ![
          "draft",
          "cancelled",
        ].includes(
          invoice.status
        )
      ) {
        throw createError(
          "Only draft or cancelled invoices can be deleted",
          400
        );
      }

      if (
        invoice.amountPaid > 0
      ) {
        throw createError(
          "Invoices with recorded payments cannot be deleted",
          400
        );
      }

      await invoice.deleteOne();

      res.json({
        success: true,
        message:
          "Invoice deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };