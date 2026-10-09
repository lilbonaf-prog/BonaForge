const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createError = (
  message,
  statusCode = 400
) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const getOwnedInvoice = async (
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
      "Invoice not found.",
      404
    );
  }

  return invoice;
};

const getOwnedPayment = async (
  paymentId,
  userId
) => {
  const payment =
    await Payment.findOne({
      _id: paymentId,
      createdBy: userId,
    });

  if (!payment) {
    throw createError(
      "Payment not found.",
      404
    );
  }

  return payment;
};

const populatePayment = async (
  payment
) => {
  await payment.populate([
    {
      path: "invoice",
      select:
        "invoiceNumber title status total amountPaid balanceDue currency issueDate dueDate sentAt paidAt",
    },
    {
      path: "project",
      select:
        "projectNumber name status projectValue currency",
    },
    {
      path: "lead",
      select:
        "name companyName email phone whatsapp status",
    },
    {
      path: "business",
      select:
        "name industry website status",
    },
  ]);

  return payment;
};

const populateInvoice = async (
  invoice
) => {
  await invoice.populate([
    {
      path: "project",
      select:
        "projectNumber name status projectValue currency",
    },
    {
      path: "lead",
      select:
        "name companyName email phone whatsapp status",
    },
    {
      path: "business",
      select:
        "name industry website status",
    },
    {
      path: "quotation",
      select:
        "quotationNumber title status total currency",
    },
  ]);

  return invoice;
};

const generatePaymentNumber =
  async (userId) => {
    const year =
      new Date().getFullYear();

    const prefix =
      `BF-PAY-${year}-`;

    const latest =
      await Payment.findOne({
        createdBy: userId,
        paymentNumber: {
          $regex: `^${escapeRegex(prefix)}`,
        },
      })
        .sort({
          paymentNumber: -1,
        })
        .select("paymentNumber")
        .lean();

    let nextNumber = 1;

    if (
      latest?.paymentNumber
    ) {
      const lastPart =
        latest.paymentNumber
          .split("-")
          .pop();

      const parsed =
        Number(lastPart);

      if (
        Number.isFinite(parsed)
      ) {
        nextNumber =
          parsed + 1;
      }
    }

    return `${prefix}${String(
      nextNumber
    ).padStart(4, "0")}`;
  };

const syncInvoicePayments =
  async (
    invoiceId,
    userId
  ) => {
    const invoice =
      await getOwnedInvoice(
        invoiceId,
        userId
      );

    const totals =
      await Payment.aggregate([
        {
          $match: {
            createdBy:
              invoice.createdBy,
            invoice:
              invoice._id,
            status:
              "completed",
          },
        },
        {
          $group: {
            _id: null,
            amountPaid: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const amountPaid =
      Math.max(
        Number(
          totals?.[0]
            ?.amountPaid
        ) || 0,
        0
      );

    invoice.amountPaid =
      Math.min(
        amountPaid,
        Number(
          invoice.total
        ) || 0
      );

    const remaining =
      Math.max(
        (Number(
          invoice.total
        ) || 0) -
          invoice.amountPaid,
        0
      );

    const isFullyPaid =
      Number(
        invoice.total
      ) > 0 &&
      remaining <= 0.005 &&
      invoice.amountPaid > 0;

    const dueDate =
      invoice.dueDate
        ? new Date(
            invoice.dueDate
          )
        : null;

    const isOverdue =
      dueDate &&
      !Number.isNaN(
        dueDate.getTime()
      ) &&
      dueDate.getTime() <
        Date.now();

    if (isFullyPaid) {
      invoice.status =
        "paid";

      invoice.paidAt =
        invoice.paidAt ||
        new Date();
    } else {
      invoice.paidAt =
        null;

      if (
        invoice.amountPaid >
        0
      ) {
        invoice.status =
          isOverdue
            ? "overdue"
            : "partially_paid";
      } else if (
        invoice.sentAt
      ) {
        invoice.status =
          isOverdue
            ? "overdue"
            : "sent";
      } else {
        invoice.status =
          "draft";
      }
    }

    await invoice.save();

    return invoice;
  };

exports.getPayments =
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

      const filter = {
        createdBy:
          req.user._id,
      };

      if (
        req.query.status &&
        req.query.status !==
          "all"
      ) {
        filter.status =
          req.query.status;
      }

      if (
        req.query.method &&
        req.query.method !==
          "all"
      ) {
        filter.method =
          req.query.method;
      }

      if (
        req.query.invoiceId
      ) {
        filter.invoice =
          req.query.invoiceId;
      }

      if (
        req.query.projectId
      ) {
        filter.project =
          req.query.projectId;
      }

      if (
        req.query.leadId
      ) {
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

        filter.$or = [
          {
            paymentNumber:
              regex,
          },
          {
            transactionReference:
              regex,
          },
          {
            notes: regex,
          },
        ];
      }

      const [
        payments,
        total,
        statsResult,
      ] =
        await Promise.all([
          Payment.find(
            filter
          )
            .populate(
              "invoice",
              "invoiceNumber title status total amountPaid balanceDue currency dueDate"
            )
            .populate(
              "project",
              "projectNumber name status"
            )
            .populate(
              "lead",
              "name companyName"
            )
            .populate(
              "business",
              "name"
            )
            .sort({
              paidAt: -1,
              createdAt: -1,
            })
            .skip(skip)
            .limit(limit),

          Payment.countDocuments(
            filter
          ),

          Payment.aggregate([
            {
              $match: {
                createdBy:
                  req.user._id,
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

                totalReceived: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$status",
                          "completed",
                        ],
                      },
                      "$amount",
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
                      "$amount",
                      0,
                    ],
                  },
                },
              },
            },
          ]),
        ]);

      const stats =
        statsResult?.[0] ||
        {
          total: 0,
          completed: 0,
          reversed: 0,
          totalReceived: 0,
          reversedAmount: 0,
        };

      return res.status(200).json({
        payments,

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

        stats: {
          total:
            stats.total || 0,

          completed:
            stats.completed ||
            0,

          reversed:
            stats.reversed ||
            0,

          totalReceived:
            stats.totalReceived ||
            0,

          reversedAmount:
            stats.reversedAmount ||
            0,
        },
      });
    } catch (error) {
      next(error);
    }
  };

exports.getPaymentById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const payment =
        await getOwnedPayment(
          req.params
            .paymentId,
          req.user._id
        );

      await populatePayment(
        payment
      );

      return res.status(200).json({
        payment,
      });
    } catch (error) {
      next(error);
    }
  };

exports.getInvoicePayments =
  async (
    req,
    res,
    next
  ) => {
    try {
      const invoice =
        await getOwnedInvoice(
          req.params
            .invoiceId,
          req.user._id
        );

      const payments =
        await Payment.find({
          createdBy:
            req.user._id,

          invoice:
            invoice._id,
        })
          .populate(
            "project",
            "projectNumber name status"
          )
          .populate(
            "lead",
            "name companyName"
          )
          .populate(
            "business",
            "name"
          )
          .sort({
            paidAt: -1,
            createdAt: -1,
          });

      return res.status(200).json({
        payments,
      });
    } catch (error) {
      next(error);
    }
  };

exports.createPayment =
  async (
    req,
    res,
    next
  ) => {
    let createdPayment =
      null;

    try {
      const invoice =
        await getOwnedInvoice(
          req.params
            .invoiceId,
          req.user._id
        );

      if (
        invoice.status ===
        "cancelled"
      ) {
        throw createError(
          "You cannot record a payment for a cancelled invoice."
        );
      }

      if (
        invoice.status ===
        "draft"
      ) {
        throw createError(
          "Send the invoice before recording a payment."
        );
      }

      const total =
        Number(
          invoice.total
        ) || 0;

      const balanceDue =
        Number(
          invoice.balanceDue
        ) || 0;

      if (total <= 0) {
        throw createError(
          "This invoice has no payable total."
        );
      }

      if (
        balanceDue <=
        0.005
      ) {
        throw createError(
          "This invoice is already fully paid."
        );
      }

      const amount =
        Number(
          req.body.amount
        );

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        throw createError(
          "Payment amount must be greater than zero."
        );
      }

      if (
        amount >
        balanceDue + 0.005
      ) {
        throw createError(
          `Payment cannot exceed the outstanding balance of ${invoice.currency} ${balanceDue.toFixed(
            2
          )}.`
        );
      }

      const paymentNumber =
        await generatePaymentNumber(
          req.user._id
        );

      createdPayment =
        await Payment.create({
          createdBy:
            req.user._id,

          invoice:
            invoice._id,

          project:
            invoice.project,

          lead:
            invoice.lead,

          business:
            invoice.business ||
            null,

          paymentNumber,

          amount,

          currency:
            invoice.currency ||
            "GHS",

          method:
            req.body.method ||
            "bank_transfer",

          transactionReference:
            String(
              req.body
                .transactionReference ||
                ""
            ).trim(),

          status:
            "completed",

          paidAt:
            req.body.paidAt ||
            new Date(),

          notes:
            String(
              req.body.notes ||
                ""
            ).trim(),
        });

      const updatedInvoice =
        await syncInvoicePayments(
          invoice._id,
          req.user._id
        );

      await Promise.all([
        populatePayment(
          createdPayment
        ),
        populateInvoice(
          updatedInvoice
        ),
      ]);

      return res.status(201).json({
        message:
          "Payment recorded successfully.",

        payment:
          createdPayment,

        invoice:
          updatedInvoice,
      });
    } catch (error) {
      if (
        createdPayment?._id
      ) {
        try {
          await Payment.deleteOne({
            _id:
              createdPayment._id,
          });
        } catch {
          // Preserve the original error.
        }
      }

      next(error);
    }
  };

exports.updatePayment =
  async (
    req,
    res,
    next
  ) => {
    try {
      const payment =
        await getOwnedPayment(
          req.params
            .paymentId,
          req.user._id
        );

      if (
        payment.status !==
        "completed"
      ) {
        throw createError(
          "Only completed payments can be edited."
        );
      }

      if (
        req.body.method !==
        undefined
      ) {
        payment.method =
          req.body.method;
      }

      if (
        req.body
          .transactionReference !==
        undefined
      ) {
        payment.transactionReference =
          String(
            req.body
              .transactionReference ||
              ""
          ).trim();
      }

      if (
        req.body.paidAt !==
        undefined
      ) {
        payment.paidAt =
          req.body.paidAt;
      }

      if (
        req.body.notes !==
        undefined
      ) {
        payment.notes =
          String(
            req.body.notes ||
              ""
          ).trim();
      }

      await payment.save();

      await populatePayment(
        payment
      );

      return res.status(200).json({
        message:
          "Payment updated successfully.",

        payment,
      });
    } catch (error) {
      next(error);
    }
  };

exports.reversePayment =
  async (
    req,
    res,
    next
  ) => {
    let originalState =
      null;

    try {
      const payment =
        await getOwnedPayment(
          req.params
            .paymentId,
          req.user._id
        );

      if (
        payment.status ===
        "reversed"
      ) {
        throw createError(
          "This payment has already been reversed."
        );
      }

      const reversalReason =
        String(
          req.body
            .reversalReason ||
            ""
        ).trim();

      if (
        !reversalReason
      ) {
        throw createError(
          "A reversal reason is required."
        );
      }

      originalState = {
        status:
          payment.status,
        reversedAt:
          payment.reversedAt,
        reversalReason:
          payment.reversalReason,
      };

      payment.status =
        "reversed";

      payment.reversedAt =
        new Date();

      payment.reversalReason =
        reversalReason;

      await payment.save();

      const updatedInvoice =
        await syncInvoicePayments(
          payment.invoice,
          req.user._id
        );

      await Promise.all([
        populatePayment(
          payment
        ),
        populateInvoice(
          updatedInvoice
        ),
      ]);

      return res.status(200).json({
        message:
          "Payment reversed successfully.",

        payment,

        invoice:
          updatedInvoice,
      });
    } catch (error) {
      if (
        originalState
      ) {
        try {
          const payment =
            await Payment.findOne({
              _id:
                req.params
                  .paymentId,

              createdBy:
                req.user._id,
            });

          if (payment) {
            payment.status =
              originalState.status;

            payment.reversedAt =
              originalState.reversedAt;

            payment.reversalReason =
              originalState.reversalReason;

            await payment.save();
          }
        } catch {
          // Preserve the original error.
        }
      }

      next(error);
    }
  };