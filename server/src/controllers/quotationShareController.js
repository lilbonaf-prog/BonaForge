const crypto = require(
  "crypto"
);

const Quotation = require(
  "../models/Quotation"
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

const getOwnedQuotation = async (
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

const buildPublicQuotation = (
  quotation
) => {
  const lead =
    quotation.lead || null;

  const business =
    quotation.business || null;

  return {
    id:
      quotation._id,

    quotationNumber:
      quotation.quotationNumber,

    title:
      quotation.title,

    status:
      quotation.status,

    currency:
      quotation.currency,

    lineItems:
      quotation.lineItems ||
      [],

    subtotal:
      quotation.subtotal,

    discount:
      quotation.discount,

    tax:
      quotation.tax,

    total:
      quotation.total,

    paymentTerms:
      quotation.paymentTerms,

    validUntil:
      quotation.validUntil,

    sentAt:
      quotation.sentAt,

    acceptedAt:
      quotation.acceptedAt,

    rejectedAt:
      quotation.rejectedAt,

    expiredAt:
      quotation.expiredAt,

    createdAt:
      quotation.createdAt,

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

const createQuotationShareLink =
  async (
    req,
    res,
    next
  ) => {
    try {
      const quotation =
        await getOwnedQuotation(
          req.params.quotationId,
          req.user._id
        );

      if (
        quotation.status ===
        "draft"
      ) {
        const error =
          new Error(
            "Draft quotations cannot be shared. Mark the quotation as sent first"
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
        quotation.createShareToken(
          expiresInDays
        );

      await quotation.save();

      res.status(200).json({
        success: true,

        message:
          "Quotation share link created successfully",

        share: {
          token:
            rawToken,

          path:
            `/share/quotation/${rawToken}`,

          expiresAt:
            quotation
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

const revokeQuotationShareLink =
  async (
    req,
    res,
    next
  ) => {
    try {
      const quotation =
        await getOwnedQuotation(
          req.params.quotationId,
          req.user._id
        );

      quotation.revokeShareToken();

      await quotation.save();

      res.status(200).json({
        success: true,

        message:
          "Quotation share link revoked successfully",

        share: {
          enabled: false,

          revokedAt:
            quotation
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
// PUBLIC READ-ONLY QUOTATION
// NO LOGIN REQUIRED
// ==============================

const getPublicQuotationByToken =
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
            "Shared quotation not found or link expired"
          );

        error.statusCode =
          404;

        throw error;
      }

      const tokenHash =
        hashShareToken(
          rawToken
        );

      const quotation =
        await Quotation.findOne({
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

      if (!quotation) {
        const error =
          new Error(
            "Shared quotation not found or link expired"
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

        quotation:
          buildPublicQuotation(
            quotation
          ),
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  createQuotationShareLink,
  revokeQuotationShareLink,
  getPublicQuotationByToken,
};