const crypto = require("crypto");

const Proposal = require(
  "../models/Proposal"
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

const buildPublicProposal = (
  proposal
) => {
  const lead =
    proposal.lead || null;

  const business =
    proposal.business || null;

  return {
    id: proposal._id,

    proposalNumber:
      proposal.proposalNumber,

    title:
      proposal.title,

    status:
      proposal.status,

    summary:
      proposal.summary,

    clientProblem:
      proposal.clientProblem,

    proposedSolution:
      proposal.proposedSolution,

    objectives:
      proposal.objectives || [],

    scopeOfWork:
      proposal.scopeOfWork || [],

    timeline:
      proposal.timeline || {},

    pricingOverview:
      proposal.pricingOverview || {},

    termsAndConditions:
      proposal.termsAndConditions,

    validUntil:
      proposal.validUntil,

    sentAt:
      proposal.sentAt,

    acceptedAt:
      proposal.acceptedAt,

    rejectedAt:
      proposal.rejectedAt,

    createdAt:
      proposal.createdAt,

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

const createProposalShareLink =
  async (
    req,
    res,
    next
  ) => {
    try {
      const proposal =
        await getOwnedProposal(
          req.params.proposalId,
          req.user._id
        );

      if (
        proposal.status ===
        "draft"
      ) {
        const error = new Error(
          "Draft proposals cannot be shared. Mark the proposal as sent first"
        );

        error.statusCode = 400;

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
        proposal.createShareToken(
          expiresInDays
        );

      await proposal.save({
        validateBeforeSave:
          false,
      });

      res.status(200).json({
        success: true,

        message:
          "Proposal share link created successfully",

        share: {
          token:
            rawToken,

          path:
            `/share/proposal/${rawToken}`,

          expiresAt:
            proposal
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

const revokeProposalShareLink =
  async (
    req,
    res,
    next
  ) => {
    try {
      const proposal =
        await getOwnedProposal(
          req.params.proposalId,
          req.user._id
        );

      proposal.revokeShareToken();

      await proposal.save({
        validateBeforeSave:
          false,
      });

      res.status(200).json({
        success: true,

        message:
          "Proposal share link revoked successfully",

        share: {
          enabled: false,

          revokedAt:
            proposal
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
// PUBLIC READ-ONLY PROPOSAL
// NO LOGIN REQUIRED
// ==============================

const getPublicProposalByToken =
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
        const error = new Error(
          "Shared proposal not found or link expired"
        );

        error.statusCode = 404;

        throw error;
      }

      const tokenHash =
        hashShareToken(
          rawToken
        );

      const proposal =
        await Proposal.findOne({
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

      if (!proposal) {
        const error = new Error(
          "Shared proposal not found or link expired"
        );

        error.statusCode = 404;

        throw error;
      }

      res.set(
        "Cache-Control",
        "no-store"
      );

      res.status(200).json({
        success: true,

        proposal:
          buildPublicProposal(
            proposal
          ),
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  createProposalShareLink,
  revokeProposalShareLink,
  getPublicProposalByToken,
};