import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import {
  motion,
} from "motion/react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useForm,
} from "react-hook-form";

import {
  useBusiness,
} from "../features/businesses/useBusiness";

import {
  useUpdateBusiness,
} from "../features/businesses/useUpdateBusiness";

import {
  useDeleteBusiness,
} from "../features/businesses/useDeleteBusiness";

import useConvertBusinessToLead from "../features/leads/useConvertBusinessToLead";

import useResearchByBusiness from "../features/research/useResearchByBusiness";
import useStartResearch from "../features/research/useStartResearch";

import useWebsiteAuditByBusiness from "../features/websiteAudit/useWebsiteAuditByBusiness";
import useStartWebsiteAudit from "../features/websiteAudit/useStartWebsiteAudit";

import EditBusinessModal from "../features/businesses/EditBusinessModal";

import DeleteBusinessModal from "../features/businesses/DeleteBusinessModal";

// ==============================
// FORMAT STATUS
// ==============================

const formatStatus = (
  status
) => {
  if (!status) {
    return "Saved";
  }

  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
};

// ==============================
// FORMAT DATE
// ==============================

const formatDate = (
  value
) => {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

// ==============================
// WEBSITE URL
// ==============================

const getWebsiteUrl = (
  website
) => {
  if (!website) {
    return "";
  }

  if (
    website.startsWith(
      "http://"
    ) ||
    website.startsWith(
      "https://"
    )
  ) {
    return website;
  }

  return `https://${website}`;
};

// ==============================
// BUSINESS DETAILS PAGE
// ==============================

function BusinessDetailsPage() {
  const {
    businessId,
  } = useParams();

  const navigate =
    useNavigate();

  // ==============================
  // EDIT STATE
  // ==============================

  const [
    isEditOpen,
    setIsEditOpen,
  ] = useState(false);

  const [
    updateError,
    setUpdateError,
  ] = useState("");

  // ==============================
  // DELETE STATE
  // ==============================

  const [
    isDeleteOpen,
    setIsDeleteOpen,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  // ==============================
  // CONVERSION STATE
  // ==============================

  const [
    isConvertOpen,
    setIsConvertOpen,
  ] = useState(false);

  const [
    convertError,
    setConvertError,
  ] = useState("");

  // ==============================
  // RESEARCH STATE
  // ==============================

  const [
    researchError,
    setResearchError,
  ] = useState("");

  // ==============================
  // WEBSITE AUDIT STATE
  // ==============================

  const [
    websiteAuditError,
    setWebsiteAuditError,
  ] = useState("");

  // ==============================
  // BUSINESS QUERY
  // ==============================

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useBusiness(
    businessId
  );

  // ==============================
  // RESEARCH QUERY
  // ==============================

  const {
    data: researchData,
    isLoading: isResearchLoading,
    isFetching: isResearchFetching,
    refetch: refetchResearch,
  } = useResearchByBusiness(
    businessId
  );

  // ==============================
  // WEBSITE AUDIT QUERY
  // ==============================

  const {
    data: websiteAuditData,
    isLoading: isWebsiteAuditLoading,
    isFetching: isWebsiteAuditFetching,
    refetch: refetchWebsiteAudit,
  } = useWebsiteAuditByBusiness(
    businessId
  );

  // ==============================
  // MUTATIONS
  // ==============================

  const updateBusinessMutation =
    useUpdateBusiness();

  const deleteBusinessMutation =
    useDeleteBusiness();

  const convertBusinessMutation =
    useConvertBusinessToLead();

  const startResearchMutation =
    useStartResearch();

  const startWebsiteAuditMutation =
    useStartWebsiteAudit();

  const business =
    data?.business;

  const existingResearch =
    researchData?.research;

  const existingWebsiteAudit =
    websiteAuditData?.audit;

  // ==============================
  // UPDATE BUSINESS
  // ==============================

  const handleUpdateBusiness = (
    payload
  ) => {
    setUpdateError("");

    updateBusinessMutation.mutate(
      {
        businessId,
        payload,
      },
      {
        onSuccess: () => {
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
              "Unable to update business. Please try again."
          );
        },
      }
    );
  };

  // ==============================
  // DELETE BUSINESS
  // ==============================

  const handleDeleteBusiness =
    () => {
      setDeleteError("");

      deleteBusinessMutation.mutate(
        businessId,
        {
          onSuccess: () => {
            setIsDeleteOpen(
              false
            );

            navigate(
              "/businesses",
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
                "Unable to delete business. Please try again."
            );
          },
        }
      );
    };

  // ==============================
  // START / OPEN RESEARCH
  // ==============================

  const handleResearchAction =
    () => {
      setResearchError("");

      if (existingResearch?._id) {
        navigate(
          `/research/${businessId}`
        );

        return;
      }

      startResearchMutation.mutate(
        businessId,
        {
          onSuccess: (
            response
          ) => {
            const researchId =
              response?.research?._id;

            if (researchId) {
              navigate(
                `/research/${businessId}`
              );
            } else {
              navigate(
                "/research"
              );
            }
          },

          onError: (
            mutationError
          ) => {
            setResearchError(
              mutationError
                ?.response
                ?.data
                ?.message ||
                mutationError
                  ?.message ||
                "Unable to start research."
            );
          },
        }
      );
    };

  // ==============================
  // START / OPEN WEBSITE AUDIT
  // ==============================

  const handleWebsiteAuditAction =
    () => {
      setWebsiteAuditError("");

      startWebsiteAuditMutation.mutate(
        businessId,
        {
          onSuccess: () => {
            navigate(
              `/website-audits/${businessId}`
            );
          },

          onError: (
            mutationError
          ) => {
            setWebsiteAuditError(
              mutationError
                ?.response
                ?.data
                ?.message ||
                mutationError
                  ?.message ||
                "Unable to start website audit."
            );
          },
        }
      );
    };

  // ==============================
  // REFRESH BUSINESS + WORKFLOW
  // ==============================

  const handleRefresh =
    () => {
      refetch();
      refetchResearch();
      refetchWebsiteAudit();
    };

  // ==============================
  // CONVERT BUSINESS TO LEAD
  // ==============================

  const handleConvertBusiness = (
    payload
  ) => {
    setConvertError("");

    convertBusinessMutation.mutate(
      {
        businessId,
        payload,
      },
      {
        onSuccess: (
          response
        ) => {
          setIsConvertOpen(
            false
          );

          const newLeadId =
            response?.lead?._id;

          if (newLeadId) {
            navigate(
              `/leads/${newLeadId}`
            );
          } else {
            navigate(
              "/leads"
            );
          }
        },

        onError: (
          mutationError
        ) => {
          setConvertError(
            mutationError
              ?.response
              ?.data
              ?.message ||
              mutationError
                ?.message ||
              "Unable to convert business to lead."
          );
        },
      }
    );
  };

  // ==============================
  // LOADING STATE
  // ==============================

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-white/[0.05]" />

        <div className="mt-8 h-44 animate-pulse rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)]" />

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.8fr]">
          <div className="space-y-5">
            <div className="h-72 animate-pulse rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)]" />

            <div className="h-40 animate-pulse rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)]" />
          </div>

          <div className="space-y-5">
            <div className="h-72 animate-pulse rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)]" />

            <div className="h-48 animate-pulse rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)]" />
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // ERROR STATE
  // ==============================

  if (
    isError ||
    !business
  ) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
        <Link
          to="/businesses"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-white"
        >
          <ArrowLeft
            size={16}
          />

          Back to businesses
        </Link>

        <div className="mt-8 flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-red-400/15 bg-red-400/[0.04] px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/15 bg-red-400/[0.07] text-red-300">
            <CircleAlert
              size={23}
            />
          </div>

          <h1 className="mt-5 text-lg font-semibold text-white">
            Unable to load
            business
          </h1>

          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
            {error?.response
              ?.data?.message ||
              "The business could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            disabled={
              isFetching
            }
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            Try again
          </button>
        </div>
      </div>
    );
  }

  // ==============================
  // DERIVED VALUES
  // ==============================

  const locationText = [
    business.location
      ?.address,

    business.location
      ?.city,

    business.location
      ?.region,

    business.location
      ?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const websiteUrl =
    getWebsiteUrl(
      business.website
    );

  const busy =
    updateBusinessMutation
      .isPending ||
    deleteBusinessMutation
      .isPending ||
    convertBusinessMutation
      .isPending ||
    startResearchMutation
      .isPending ||
    startWebsiteAuditMutation
      .isPending;

  return (
    <>
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
        {/* ============================== */}
        {/* TOP NAVIGATION */}
        {/* ============================== */}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/businesses"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Back to businesses
          </Link>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              isFetching ||
              isResearchFetching ||
              isWebsiteAuditFetching
            }
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--border-primary)] bg-white/[0.02] px-3 text-xs font-medium text-[var(--text-muted)] transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={
                isFetching ||
                isResearchFetching ||
                isWebsiteAuditFetching
                  ? "animate-spin"
                  : ""
              }
            />

            {isFetching ||
            isResearchFetching ||
            isWebsiteAuditFetching
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ============================== */}
        {/* HERO */}
        {/* ============================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative mt-6 overflow-hidden rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[var(--brand-primary)]/10 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-64 rounded-full bg-[var(--brand-primary)]/[0.04] blur-3xl" />

          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 gap-4 sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/10 text-[var(--brand-secondary)] shadow-lg shadow-black/10">
                <Building2
                  size={24}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-[var(--border-primary)] bg-white/[0.025] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {formatStatus(
                      business.status
                    )}
                  </span>

                  <span className="rounded-lg border border-[var(--brand-primary)]/15 bg-[var(--brand-primary)]/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-secondary)]">
                    {formatStatus(
                      business.source
                    )}
                  </span>

                  {!business.website && (
                    <span className="rounded-lg border border-amber-300/10 bg-amber-300/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-200/70">
                      No website
                    </span>
                  )}

                  {business.convertedToLead && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-200/80">
                      <CheckCircle2
                        size={11}
                      />

                      Lead created
                    </span>
                  )}
                </div>

                <h1 className="mt-4 break-words text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                  {
                    business.name
                  }
                </h1>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {business.industry ||
                    "Industry not specified"}
                </p>

                {business.description && (
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                    {
                      business.description
                    }
                  </p>
                )}
              </div>
            </div>

            {/* ============================== */}
            {/* BUSINESS ACTIONS */}
            {/* ============================== */}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={
                  handleResearchAction
                }
                disabled={
                  busy ||
                  isResearchLoading ||
                  isResearchFetching
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border-primary)] bg-white/[0.025] px-4 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {existingResearch?._id ? (
                  <FileText
                    size={14}
                  />
                ) : (
                  <Search
                    size={14}
                  />
                )}

                {isResearchLoading ||
                isResearchFetching
                  ? "Checking research..."
                  : startResearchMutation
                        .isPending
                    ? "Starting..."
                    : existingResearch?._id
                      ? "Open research"
                      : "Start research"}
              </button>

              <button
                type="button"
                onClick={
                  handleWebsiteAuditAction
                }
                disabled={
                  busy ||
                  isWebsiteAuditLoading ||
                  isWebsiteAuditFetching
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] px-4 text-xs font-semibold text-cyan-200/80 transition hover:border-cyan-300/25 hover:bg-cyan-400/[0.1] hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Globe2
                  size={14}
                />

                {isWebsiteAuditLoading ||
                isWebsiteAuditFetching
                  ? "Checking audit..."
                  : startWebsiteAuditMutation
                        .isPending
                    ? existingWebsiteAudit?._id
                      ? "Opening audit..."
                      : "Starting audit..."
                    : existingWebsiteAudit?._id
                      ? "Open website audit"
                      : "Start website audit"}
              </button>

              {business.convertedToLead ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 text-xs font-semibold text-emerald-200/70"
                >
                  <CheckCircle2
                    size={14}
                  />

                  Converted to lead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConvertError(
                      ""
                    );

                    setIsConvertOpen(
                      true
                    );
                  }}
                  disabled={
                    busy
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/10 px-4 text-xs font-semibold text-[var(--brand-secondary)] transition hover:bg-[var(--brand-primary)]/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserPlus
                    size={14}
                  />

                  Convert to lead
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setUpdateError("");

                  setIsEditOpen(
                    true
                  );
                }}
                disabled={
                  busy
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Edit business
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeleteError("");

                  setIsDeleteOpen(
                    true
                  );
                }}
                disabled={
                  busy
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 text-xs font-semibold text-red-300 transition hover:border-red-400/25 hover:bg-red-400/[0.1] hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2
                  size={14}
                />

                Delete
              </button>
            </div>
          </div>
        </motion.section>

        {researchError ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] px-4 py-3 text-sm leading-6 text-rose-200">
            <CircleAlert
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>
              {researchError}
            </span>
          </div>
        ) : null}

        {websiteAuditError ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] px-4 py-3 text-sm leading-6 text-rose-200">
            <CircleAlert
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>
              {websiteAuditError}
            </span>
          </div>
        ) : null}

        {/* ============================== */}
        {/* CONTENT GRID */}
        {/* ============================== */}

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.8fr]">
          {/* LEFT COLUMN */}

          <div className="space-y-5">
            {/* CONTACT */}

            <section className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={15}
                  className="text-[var(--brand-secondary)]"
                />

                <h2 className="text-sm font-semibold text-white">
                  Contact & digital
                  presence
                </h2>
              </div>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Contact information
                currently available for
                this business.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {/* PHONE */}

                <div className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.02] p-4 transition hover:bg-white/[0.03]">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Phone
                      size={14}
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                      Phone
                    </span>
                  </div>

                  {business.phone ? (
                    <a
                      href={`tel:${business.phone}`}
                      className="mt-3 block break-words text-sm font-medium text-white transition hover:text-[var(--brand-secondary)]"
                    >
                      {
                        business.phone
                      }
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                      Not added
                    </p>
                  )}
                </div>

                {/* EMAIL */}

                <div className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.02] p-4 transition hover:bg-white/[0.03]">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Mail
                      size={14}
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                      Email
                    </span>
                  </div>

                  {business.email ? (
                    <a
                      href={`mailto:${business.email}`}
                      className="mt-3 block break-all text-sm font-medium text-white transition hover:text-[var(--brand-secondary)]"
                    >
                      {
                        business.email
                      }
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                      Not added
                    </p>
                  )}
                </div>

                {/* WEBSITE */}

                <div className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.02] p-4 sm:col-span-2">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Globe2
                      size={14}
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                      Website
                    </span>
                  </div>

                  {business.website ? (
                    <a
                      href={
                        websiteUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-[var(--brand-secondary)] transition hover:text-white"
                    >
                      {
                        business.website
                      }

                      <ExternalLink
                        size={13}
                        className="shrink-0"
                      />
                    </a>
                  ) : (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-white">
                        No website
                      </p>

                      <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--text-muted)]">
                        This business can
                        still be
                        researched,
                        qualified and
                        converted into a
                        lead without a
                        website.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* LOCATION */}

            <section className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <MapPin
                  size={15}
                  className="text-[var(--brand-secondary)]"
                />

                <h2 className="text-sm font-semibold text-white">
                  Location
                </h2>
              </div>

              <div className="mt-5 rounded-2xl border border-[var(--border-primary)] bg-white/[0.02] p-4">
                <p className="text-sm leading-6 text-white">
                  {locationText ||
                    "Location not added"}
                </p>
              </div>
            </section>

            {/* NOTES */}

            <section className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <FileText
                  size={15}
                  className="text-[var(--brand-secondary)]"
                />

                <h2 className="text-sm font-semibold text-white">
                  Notes
                </h2>
              </div>

              <div className="mt-5 min-h-28 rounded-2xl border border-[var(--border-primary)] bg-white/[0.02] p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
                  {business.notes ||
                    "No notes have been added for this business yet."}
                </p>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}

          <div className="space-y-5">
            {/* WORKFLOW */}

            <section className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Workflow
              </p>

              <h2 className="mt-2 text-base font-semibold text-white">
                Business progress
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                Follow this business
                through research and
                lead conversion.
              </p>

              <div className="mt-5 space-y-3">
                <WorkflowRow
                  label="Current status"
                  value={formatStatus(
                    business.status
                  )}
                />

                <WorkflowRow
                  label="Research completed"
                  value={
                    business
                      .researchCompleted
                      ? "Yes"
                      : "No"
                  }
                />

                <WorkflowRow
                  label="Website audit"
                  value={
                    business
                      .websiteAuditCompleted
                      ? "Completed"
                      : "Not completed"
                  }
                />

                <WorkflowRow
                  label="Converted to lead"
                  value={
                    business
                      .convertedToLead
                      ? "Yes"
                      : "No"
                  }
                  success={
                    business
                      .convertedToLead
                  }
                />
              </div>
            </section>

            {/* RECORD DETAILS */}

            <section className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={15}
                  className="text-[var(--brand-secondary)]"
                />

                <h2 className="text-sm font-semibold text-white">
                  Record details
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Created
                  </p>

                  <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                    {formatDate(
                      business.createdAt
                    )}
                  </p>
                </div>

                <div className="border-t border-[var(--border-primary)] pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Last updated
                  </p>

                  <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                    {formatDate(
                      business.updatedAt
                    )}
                  </p>
                </div>

                <div className="border-t border-[var(--border-primary)] pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Source
                  </p>

                  <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                    {formatStatus(
                      business.source
                    )}
                  </p>
                </div>

                {business.sourceDetails && (
                  <div className="border-t border-[var(--border-primary)] pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Source details
                    </p>

                    <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
                      {
                        business.sourceDetails
                      }
                    </p>
                  </div>
                )}

                <div className="border-t border-[var(--border-primary)] pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Record ID
                  </p>

                  <p className="mt-1.5 break-all font-mono text-[10px] text-[var(--text-muted)]">
                    {
                      business._id
                    }
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ============================== */}
        {/* EDIT BUSINESS MODAL */}
        {/* ============================== */}

        <EditBusinessModal
          isOpen={
            isEditOpen
          }
          onClose={() => {
            setUpdateError("");

            setIsEditOpen(
              false
            );
          }}
          onSubmit={
            handleUpdateBusiness
          }
          business={
            business
          }
          isPending={
            updateBusinessMutation
              .isPending
          }
          serverError={
            updateError
          }
        />

        {/* ============================== */}
        {/* DELETE BUSINESS MODAL */}
        {/* ============================== */}

        <DeleteBusinessModal
          isOpen={
            isDeleteOpen
          }
          onClose={() => {
            setDeleteError("");

            setIsDeleteOpen(
              false
            );
          }}
          onConfirm={
            handleDeleteBusiness
          }
          business={
            business
          }
          isPending={
            deleteBusinessMutation
              .isPending
          }
          serverError={
            deleteError
          }
        />
      </div>

      {/* ============================== */}
      {/* CONVERT TO LEAD MODAL */}
      {/* ============================== */}

      <ConvertBusinessToLeadModal
        isOpen={
          isConvertOpen
        }
        business={
          business
        }
        isPending={
          convertBusinessMutation
            .isPending
        }
        serverError={
          convertError
        }
        onClose={() => {
          if (
            convertBusinessMutation
              .isPending
          ) {
            return;
          }

          setConvertError("");
          setIsConvertOpen(
            false
          );
        }}
        onSubmit={
          handleConvertBusiness
        }
      />
    </>
  );
}

// ==============================
// WORKFLOW ROW
// ==============================

const WorkflowRow = ({
  label,
  value,
  success = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-primary)] bg-white/[0.02] px-4 py-3">
      <span className="text-xs text-[var(--text-secondary)]">
        {label}
      </span>

      <span
        className={`text-xs font-semibold ${
          success
            ? "text-emerald-300"
            : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

// ==============================
// CONVERT BUSINESS MODAL
// ==============================

const ConvertBusinessToLeadModal = ({
  isOpen,
  business,
  isPending,
  serverError,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm();

  useEffect(() => {
    if (
      !isOpen ||
      !business
    ) {
      return;
    }

    reset({
      jobTitle: "",
      whatsapp:
        business.phone ||
        "",
      preferredContactMethod:
        business.phone
          ? "phone"
          : business.email
            ? "email"
            : "whatsapp",
      priority: "medium",
      estimatedValue: "",
      currency: "GHS",
      servicesInterestedIn:
        "",
      opportunitySummary:
        "",
      notes: "",
    });
  }, [
    isOpen,
    business,
    reset,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
          "Escape" &&
        !isPending
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    isPending,
    onClose,
  ]);

  if (
    !isOpen ||
    !business
  ) {
    return null;
  }

  const submitHandler = (
    values
  ) => {
    const services =
      values
        .servicesInterestedIn
        ?.split(",")
        .map((service) =>
          service.trim()
        )
        .filter(Boolean) ||
      [];

    onSubmit({
      jobTitle:
        values.jobTitle
          .trim(),

      whatsapp:
        values.whatsapp
          .trim(),

      preferredContactMethod:
        values
          .preferredContactMethod,

      priority:
        values.priority,

      estimatedValue:
        values
          .estimatedValue ===
        ""
          ? 0
          : Number(
              values
                .estimatedValue
            ),

      currency:
        values.currency
          .trim() ||
        "GHS",

      servicesInterestedIn:
        services,

      opportunitySummary:
        values
          .opportunitySummary
          .trim(),

      notes:
        values.notes
          .trim(),
    });
  };

  const handleBackdrop = (
    event
  ) => {
    if (
      event.target ===
        event.currentTarget &&
      !isPending
    ) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
      onMouseDown={
        handleBackdrop
      }
    >
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0d14] shadow-2xl shadow-black/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.07),transparent_30%)]" />

        {/* HEADER */}

        <div className="relative flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-5 md:px-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/10 px-3 py-1.5 text-xs font-medium text-[var(--brand-secondary)]">
              <UserPlus
                size={14}
              />

              Sales opportunity
            </div>

            <h2 className="mt-4 text-xl font-semibold tracking-tight text-white md:text-2xl">
              Convert business to
              lead
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Move{" "}
              <span className="font-medium text-white/75">
                {business.name}
              </span>{" "}
              into your sales
              pipeline and add the
              opportunity details.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isPending
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close conversion modal"
          >
            <X
              size={18}
            />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(
            submitHandler
          )}
          className="relative overflow-y-auto"
        >
          <div className="space-y-7 px-6 py-6 md:px-7">
            {/* BUSINESS SUMMARY */}

            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/30">
                Business
                information
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <ReadOnlyCard
                  label="Business"
                  value={
                    business.name
                  }
                />

                <ReadOnlyCard
                  label="Industry"
                  value={
                    business.industry ||
                    "Not specified"
                  }
                />

                <ReadOnlyCard
                  label="Phone"
                  value={
                    business.phone ||
                    "Not provided"
                  }
                />

                <ReadOnlyCard
                  label="Email"
                  value={
                    business.email ||
                    "Not provided"
                  }
                />
              </div>
            </section>

            {/* CONTACT */}

            <FormSection
              title="Lead contact"
              description="Add useful contact details for the person you will be selling to."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Job title">
                  <input
                    {...register(
                      "jobTitle"
                    )}
                    placeholder="e.g. Managing Director"
                    className={inputClass}
                  />
                </Field>

                <Field label="WhatsApp">
                  <input
                    {...register(
                      "whatsapp"
                    )}
                    placeholder="0240000000"
                    className={inputClass}
                  />
                </Field>

                <Field label="Preferred contact">
                  <select
                    {...register(
                      "preferredContactMethod"
                    )}
                    className={inputClass}
                  >
                    <option value="whatsapp">
                      WhatsApp
                    </option>

                    <option value="phone">
                      Phone
                    </option>

                    <option value="email">
                      Email
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </Field>
              </div>
            </FormSection>

            {/* OPPORTUNITY */}

            <FormSection
              title="Opportunity"
              description="Describe the commercial value of this prospect."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Priority">
                  <select
                    {...register(
                      "priority"
                    )}
                    className={inputClass}
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="urgent">
                      Urgent
                    </option>
                  </select>
                </Field>

                <Field
                  label="Estimated value"
                  error={
                    errors
                      .estimatedValue
                      ?.message
                  }
                >
                  <div className="relative">
                    <CircleDollarSign
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register(
                        "estimatedValue",
                        {
                          min: {
                            value: 0,
                            message:
                              "Value cannot be negative",
                          },
                        }
                      )}
                      placeholder="0"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </Field>

                <Field label="Currency">
                  <input
                    {...register(
                      "currency"
                    )}
                    maxLength={10}
                    className={inputClass}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field
                    label="Services interested in"
                    helper="Separate multiple services with commas."
                  >
                    <input
                      {...register(
                        "servicesInterestedIn"
                      )}
                      placeholder="Website Development, Branding, Digital Audit"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Opportunity summary">
                    <textarea
                      {...register(
                        "opportunitySummary"
                      )}
                      rows={4}
                      placeholder="Why is this business a good sales opportunity?"
                      className={textareaClass}
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Notes">
                    <textarea
                      {...register(
                        "notes"
                      )}
                      rows={4}
                      placeholder="Add important context or the next action..."
                      className={textareaClass}
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            {serverError ? (
              <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] px-4 py-3 text-sm leading-6 text-rose-200">
                {serverError}
              </div>
            ) : null}
          </div>

          {/* FOOTER */}

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/[0.08] bg-[#0b0d14]/95 px-6 py-4 backdrop-blur-xl sm:flex-row sm:justify-end md:px-7">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                isPending
              }
              className="h-11 rounded-xl border border-white/10 px-5 text-sm font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isPending
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus
                size={16}
              />

              {isPending
                ? "Converting..."
                : "Convert to lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==============================
// FORM SECTION
// ==============================

const FormSection = ({
  title,
  description,
  children,
}) => {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-white/35">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
};

// ==============================
// FIELD
// ==============================

const Field = ({
  label,
  helper,
  error,
  children,
}) => {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-white/55">
        {label}
      </span>

      {children}

      {error ? (
        <span className="mt-1.5 block text-xs text-rose-300">
          {error}
        </span>
      ) : helper ? (
        <span className="mt-1.5 block text-[11px] leading-5 text-white/30">
          {helper}
        </span>
      ) : null}
    </label>
  );
};

// ==============================
// READ ONLY CARD
// ==============================

const ReadOnlyCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/30">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-white/70">
        {value}
      </p>
    </div>
  );
};

// ==============================
// INPUT STYLES
// ==============================

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:bg-black/30";

const textareaClass =
  "w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:bg-black/30";

export default BusinessDetailsPage;