import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CircleDollarSign,
  Mail,
  Pencil,
  Phone,
  RefreshCcw,
  Target,
  Trash2,
  UserRound,
} from "lucide-react";

import LeadActivityWorkspace from "../features/leadActivities/LeadActivityWorkspace";
import LeadProposalWorkspace from "../features/proposals/LeadProposalWorkspace";
import LeadQuotationWorkspace from "../features/quotations/LeadQuotationWorkspace";

import EditLeadModal from "../features/leads/EditLeadModal";
import useDeleteLead from "../features/leads/useDeleteLead";
import useLead from "../features/leads/useLead";
import useUpdateLead from "../features/leads/useUpdateLead";

const statusLabels = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const formatMoney = (
  value,
  currency = "GHS"
) => {
  const amount =
    Number(value) || 0;

  try {
    return new Intl.NumberFormat(
      "en-GH",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const formatDateTime = (
  value
) => {
  if (!value) {
    return "Not set";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not set";
  }

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const LeadDetailsPage = () => {
  const {
    leadId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    isEditOpen,
    setIsEditOpen,
  ] = useState(false);

  const [
    updateError,
    setUpdateError,
  ] = useState("");

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLead(
    leadId
  );

  const updateLeadMutation =
    useUpdateLead();

  const deleteLeadMutation =
    useDeleteLead();

  const lead =
    data?.lead;

  const services =
    lead?.servicesInterestedIn ||
    [];

  const companyName =
    lead?.companyName ||
    lead?.business?.name ||
    "Independent prospect";

  // ==============================
  // EDIT LEAD
  // ==============================

  const openEditLead = () => {
    setUpdateError("");
    setIsEditOpen(true);
  };

  const closeEditLead = () => {
    if (
      updateLeadMutation
        .isPending
    ) {
      return;
    }

    setUpdateError("");
    setIsEditOpen(false);
  };

  const handleUpdateLead = (
    payload
  ) => {
    if (!lead?._id) {
      return;
    }

    setUpdateError("");

    updateLeadMutation.mutate(
      {
        leadId:
          lead._id,

        payload,
      },
      {
        onSuccess: () => {
          setUpdateError("");

          setIsEditOpen(
            false
          );
        },

        onError: (
          mutationError
        ) => {
          setUpdateError(
            mutationError
              ?.response
              ?.data
              ?.message ||
              mutationError
                ?.message ||
              "Unable to update lead."
          );
        },
      }
    );
  };

  // ==============================
  // DELETE LEAD
  // ==============================

  const handleDelete = () => {
    if (
      !lead?._id ||
      deleteLeadMutation
        .isPending
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${lead.name}? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setDeleteError("");

    deleteLeadMutation.mutate(
      lead._id,
      {
        onSuccess: () => {
          navigate(
            "/leads",
            {
              replace: true,
            }
          );
        },

        onError: (
          mutationError
        ) => {
          setDeleteError(
            mutationError
              ?.response
              ?.data
              ?.message ||
              mutationError
                ?.message ||
              "Unable to delete lead."
          );
        },
      }
    );
  };

  // ==============================
  // LOADING
  // ==============================

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (isError) {
    return (
      <ErrorState
        message={
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          "Unable to load this lead."
        }
        onRetry={() =>
          refetch()
        }
      />
    );
  }

  if (!lead) {
    return (
      <ErrorState
        message="Lead not found."
        onRetry={() =>
          refetch()
        }
      />
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        {/* ============================== */}
        {/* TOP BAR */}
        {/* ============================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/leads"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/55 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Back to leads
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {isFetching ? (
              <span className="text-xs text-white/35">
                Refreshing...
              </span>
            ) : null}

            <button
              type="button"
              onClick={() =>
                refetch()
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-medium text-white/60 transition hover:bg-white/[0.07] hover:text-white"
            >
              <RefreshCcw
                size={15}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={
                openEditLead
              }
              disabled={
                updateLeadMutation
                  .isPending
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil
                size={15}
              />

              Edit lead
            </button>

            <button
              type="button"
              onClick={
                handleDelete
              }
              disabled={
                deleteLeadMutation
                  .isPending
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-3 text-sm font-medium text-rose-200/80 transition hover:bg-rose-400/[0.1] hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2
                size={15}
              />

              {deleteLeadMutation
                .isPending
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        </div>

        {/* ============================== */}
        {/* HERO */}
        {/* ============================== */}

        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.13),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_32%)]" />

          <div className="relative">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={
                      lead.status
                    }
                  />

                  <PriorityBadge
                    priority={
                      lead.priority
                    }
                  />

                  {lead.source ===
                  "business_conversion" ? (
                    <span className="rounded-full border border-sky-400/15 bg-sky-400/[0.07] px-2.5 py-1 text-[11px] font-medium text-sky-200/80">
                      From business
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-5 break-words text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {lead.name}
                </h1>

                <p className="mt-2 text-base text-white/45">
                  {companyName}
                </p>

                {lead.jobTitle ? (
                  <p className="mt-1 text-sm text-white/30">
                    {
                      lead.jobTitle
                    }
                  </p>
                ) : null}
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/15 px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/30">
                  Estimated value
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatMoney(
                    lead.estimatedValue,
                    lead.currency ||
                      "GHS"
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================== */}
        {/* DELETE ERROR */}
        {/* ============================== */}

        {deleteError ? (
          <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-200">
            {deleteError}
          </div>
        ) : null}

        {/* ============================== */}
        {/* MAIN GRID */}
        {/* ============================== */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
          <div className="space-y-6">
            {/* OPPORTUNITY */}

            <SectionCard
              title="Opportunity"
              icon={Target}
            >
              <InfoBlock
                label="Opportunity summary"
                value={
                  lead.opportunitySummary ||
                  "No opportunity summary added yet."
                }
              />

              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                  Services interested in
                </p>

                {services.length >
                0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {services.map(
                      (
                        service
                      ) => (
                        <span
                          key={
                            service
                          }
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60"
                        >
                          {
                            service
                          }
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-white/35">
                    No services
                    added.
                  </p>
                )}
              </div>
            </SectionCard>

            {/* CONTACT */}

            <SectionCard
              title="Contact"
              icon={UserRound}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ContactCard
                  icon={Mail}
                  label="Email"
                  value={
                    lead.email ||
                    "Not provided"
                  }
                  href={
                    lead.email
                      ? `mailto:${lead.email}`
                      : null
                  }
                />

                <ContactCard
                  icon={Phone}
                  label="Phone"
                  value={
                    lead.phone ||
                    "Not provided"
                  }
                  href={
                    lead.phone
                      ? `tel:${lead.phone}`
                      : null
                  }
                />

                <ContactCard
                  icon={Phone}
                  label="WhatsApp"
                  value={
                    lead.whatsapp ||
                    "Not provided"
                  }
                />

                <ContactCard
                  icon={UserRound}
                  label="Preferred contact"
                  value={
                    lead.preferredContactMethod ||
                    "Not set"
                  }
                />
              </div>
            </SectionCard>

            {/* CONTACT ACTIVITY */}

            <LeadActivityWorkspace
              leadId={lead._id}
            />

            {/* PROPOSALS */}

            <LeadProposalWorkspace
              lead={lead}
            />

            {/* QUOTATIONS */}

            <LeadQuotationWorkspace
              leadId={lead._id}
              lead={lead}
            />

            {/* NOTES */}

            <SectionCard
              title="Notes"
              icon={BriefcaseBusiness}
            >
              <p className="whitespace-pre-wrap text-sm leading-7 text-white/50">
                {lead.notes ||
                  "No notes added yet."}
              </p>
            </SectionCard>
          </div>

          {/* ============================== */}
          {/* RIGHT COLUMN */}
          {/* ============================== */}

          <div className="space-y-6">
            {/* FOLLOW UP */}

            <SectionCard
              title="Follow-up"
              icon={CalendarClock}
            >
              <DetailRow
                label="Follow-up count"
                value={
                  lead.followUpCount ??
                  0
                }
              />

              <DetailRow
                label="Last contacted"
                value={formatDateTime(
                  lead.lastContactedAt
                )}
              />

              <DetailRow
                label="Next follow-up"
                value={formatDateTime(
                  lead.nextFollowUpAt
                )}
              />
            </SectionCard>

            {/* BUSINESS */}

            <SectionCard
              title="Business link"
              icon={Building2}
            >
              {lead.business ? (
                <>
                  <DetailRow
                    label="Business"
                    value={
                      lead.business
                        .name
                    }
                  />

                  <DetailRow
                    label="Industry"
                    value={
                      lead.business
                        .industry ||
                      "Not provided"
                    }
                  />

                  <DetailRow
                    label="Business status"
                    value={
                      lead.business
                        .status ||
                      "Not set"
                    }
                  />

                  <Link
                    to={`/businesses/${lead.business._id}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/65 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    View business
                  </Link>
                </>
              ) : (
                <p className="text-sm leading-6 text-white/40">
                  This Lead was
                  created independently
                  and is not linked to
                  a saved Business.
                </p>
              )}
            </SectionCard>

            {/* RECORD */}

            <SectionCard
              title="Record details"
              icon={CircleDollarSign}
            >
              <DetailRow
                label="Source"
                value={
                  lead.source ||
                  "manual"
                }
              />

              <DetailRow
                label="Source details"
                value={
                  lead.sourceDetails ||
                  "Not provided"
                }
              />

              <DetailRow
                label="Created"
                value={formatDateTime(
                  lead.createdAt
                )}
              />

              <DetailRow
                label="Updated"
                value={formatDateTime(
                  lead.updatedAt
                )}
              />

              <DetailRow
                label="Lead ID"
                value={
                  lead._id
                }
                mono
              />
            </SectionCard>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* EDIT MODAL */}
      {/* ============================== */}

      <EditLeadModal
        isOpen={
          isEditOpen
        }
        onClose={
          closeEditLead
        }
        lead={
          lead
        }
        onUpdate={
          handleUpdateLead
        }
        isPending={
          updateLeadMutation
            .isPending
        }
        serverError={
          updateError
        }
      />
    </>
  );
};

// ==============================
// SECTION CARD
// ==============================

const SectionCard = ({
  title,
  icon: Icon,
  children,
}) => {
  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55">
          <Icon
            size={17}
          />
        </div>

        <h2 className="text-base font-semibold text-white">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
};

// ==============================
// INFO BLOCK
// ==============================

const InfoBlock = ({
  label,
  value,
}) => {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/50">
        {value}
      </p>
    </div>
  );
};

// ==============================
// CONTACT CARD
// ==============================

const ContactCard = ({
  icon: Icon,
  label,
  value,
  href,
}) => {
  const content = (
    <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
      <div className="flex items-center gap-2 text-white/35">
        <Icon
          size={14}
        />

        <span className="text-[11px] uppercase tracking-[0.13em]">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words text-sm font-medium text-white/70">
        {value}
      </p>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="transition hover:-translate-y-0.5"
      >
        {content}
      </a>
    );
  }

  return content;
};

// ==============================
// DETAIL ROW
// ==============================

const DetailRow = ({
  label,
  value,
  mono = false,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3 last:border-b-0">
      <span className="text-xs text-white/35">
        {label}
      </span>

      <span
        className={`max-w-[65%] break-words text-right text-sm text-white/65 ${
          mono
            ? "font-mono text-[12px]"
            : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
};

// ==============================
// STATUS BADGE
// ==============================

const StatusBadge = ({
  status,
}) => {
  const classes = {
    new:
      "border-sky-400/20 bg-sky-400/[0.08] text-sky-200",

    contacted:
      "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-200",

    follow_up:
      "border-amber-400/20 bg-amber-400/[0.08] text-amber-200",

    qualified:
      "border-violet-400/20 bg-violet-400/[0.08] text-violet-200",

    proposal:
      "border-indigo-400/20 bg-indigo-400/[0.08] text-indigo-200",

    negotiation:
      "border-orange-400/20 bg-orange-400/[0.08] text-orange-200",

    won:
      "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-200",

    lost:
      "border-rose-400/20 bg-rose-400/[0.08] text-rose-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        classes[
          status
        ] ||
        "border-white/10 bg-white/[0.05] text-white/65"
      }`}
    >
      {statusLabels[
        status
      ] || status}
    </span>
  );
};

// ==============================
// PRIORITY BADGE
// ==============================

const PriorityBadge = ({
  priority,
}) => {
  const classes = {
    low:
      "border-white/10 bg-white/[0.04] text-white/50",

    medium:
      "border-sky-400/15 bg-sky-400/[0.06] text-sky-200/75",

    high:
      "border-amber-400/15 bg-amber-400/[0.07] text-amber-200/80",

    urgent:
      "border-rose-400/20 bg-rose-400/[0.08] text-rose-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        classes[
          priority
        ] ||
        classes.medium
      }`}
    >
      {priorityLabels[
        priority
      ] || priority}{" "}
      priority
    </span>
  );
};

// ==============================
// LOADING STATE
// ==============================

const LoadingState = () => {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <div className="h-10 w-36 animate-pulse rounded-xl bg-white/[0.04]" />

      <div className="h-[220px] animate-pulse rounded-[30px] border border-white/[0.07] bg-white/[0.025]" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <div className="h-[420px] animate-pulse rounded-[26px] border border-white/[0.07] bg-white/[0.025]" />

        <div className="h-[420px] animate-pulse rounded-[26px] border border-white/[0.07] bg-white/[0.025]" />
      </div>
    </div>
  );
};

// ==============================
// ERROR STATE
// ==============================

const ErrorState = ({
  message,
  onRetry,
}) => {
  return (
    <div className="mx-auto w-full max-w-[900px] rounded-[28px] border border-rose-400/15 bg-rose-400/[0.04] p-8 text-center">
      <h2 className="text-lg font-semibold text-white">
        Lead could not be
        loaded
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/45">
        {message}
      </p>

      <button
        type="button"
        onClick={
          onRetry
        }
        className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.09] hover:text-white"
      >
        Try again
      </button>
    </div>
  );
};

export default LeadDetailsPage;