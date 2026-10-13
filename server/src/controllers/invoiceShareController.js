const crypto = require(
  "crypto"
);

const Invoice = require(
  "../models/Invoice"
);

// ==============================
// HELPERS
// ==============================

const hashShareToken = (
  token
) =>
  crypto
    .createHash("sha256")
    .update(
      String(token || "")
    )
    .digest("hex");

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
    const error =
      new Error(
        "Invoice not found"
      );

    error.statusCode = 404;

    throw error;
  }

  return invoice;
};

// Only fields safe for the client
// are returned here.
// Internal notes and cancellation
// details are deliberately excluded.
const buildPublicInvoice = (
  invoice
) => {
  const lead =
    invoice.lead || null;

  const business =
    invoice.business || null;

  return {
    id:
      invoice._id,

    invoiceNumber:
      invoice.invoiceNumber,

    title:
      invoice.title,

    status:
      invoice.status,

    items:
      invoice.items || [],

    subtotal:
      invoice.subtotal,

    discount:
      invoice.discount,

    tax:
      invoice.tax,

    total:
      invoice.total,

    amountPaid:
      invoice.amountPaid,

    balanceDue:
      invoice.balanceDue,

    currency:
      invoice.currency,

    issueDate:
      invoice.issueDate,

    dueDate:
      invoice.dueDate,

    sentAt:
      invoice.sentAt,

    paidAt:
      invoice.paidAt,

    paymentTerms:
      invoice.paymentTerms,

    createdAt:
      invoice.createdAt,

    client: {
      businessName:
        business?.name ||
        lead?.companyName ||
        "",

      contactName:
        lead?.name || "",

      email:
        lead?.email || "",

      phone:
        lead?.phone || "",

      jobTitle:
        lead?.jobTitle || "",
    },
  };
};

// ==============================
// CREATE / REGENERATE SHARE LINK
// ADMIN ONLY
// ==============================

const createInvoiceShareLink =
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
        "draft"
      ) {
        const error =
          new Error(
            "Draft invoices cannot be shared. Mark the invoice as sent first"
          );

        error.statusCode =
          400;

        throw error;
      }

      const requestedDays =
        Number(
          req.body
            ?.expiresInDays
        );

      const expiresInDays =
        Number.isFinite(
          requestedDays
        ) &&
        requestedDays > 0 &&
        requestedDays <= 365
          ? requestedDays
          : 30;

      const rawToken =
        invoice.createShareToken(
          expiresInDays
        );

      await invoice.save();

      res.status(200).json({
        success: true,

        message:
          "Invoice share link created successfully",

        share: {
          token:
            rawToken,

          path:
            `/share/invoice/${rawToken}`,

          expiresAt:
            invoice
              .shareAccess
              ?.expiresAt ||
            null,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// REVOKE SHARE LINK
// ADMIN ONLY
// ==============================

const revokeInvoiceShareLink =
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

      invoice.revokeShareToken();

      await invoice.save();

      res.status(200).json({
        success: true,

        message:
          "Invoice share link revoked successfully",

        share: {
          enabled: false,

          revokedAt:
            invoice
              .shareAccess
              ?.revokedAt ||
            null,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// ==============================
// PUBLIC READ-ONLY INVOICE
// NO LOGIN REQUIRED
// ==============================

const getPublicInvoiceByToken =
  async (
    req,
    res,
    next
  ) => {
    try {
      const rawToken =
        String(
          req.params.token ||
            ""
        ).trim();

      if (!rawToken) {
        const error =
          new Error(
            "Shared invoice not found or link expired"
          );

        error.statusCode =
          404;

        throw error;
      }

      const tokenHash =
        hashShareToken(
          rawToken
        );

      const invoice =
        await Invoice.findOne({
          "shareAccess.tokenHash":
            tokenHash,

          "shareAccess.enabled":
            true,

          "shareAccess.revokedAt":
            null,

          "shareAccess.expiresAt":
            {
              $gt:
                new Date(),
            },
        })
          .select(
            "+shareAccess.tokenHash"
          )
          .populate(
            "lead",
            "name companyName email phone jobTitle"
          )
          .populate(
            "business",
            "name"
          );

      if (!invoice) {
        const error =
          new Error(
            "Shared invoice not found or link expired"
          );

        error.statusCode =
          404;

        throw error;
      }

      res.set(
        "Cache-Control",
        "no-store"
      );

      res.status(200).json({
        success: true,

        invoice:
          buildPublicInvoice(
            invoice
          ),
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  createInvoiceShareLink,
  revokeInvoiceShareLink,
  getPublicInvoiceByToken,
};