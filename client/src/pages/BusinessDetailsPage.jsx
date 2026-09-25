import {
  useState,
} from "react";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleAlert,
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
  useBusiness,
} from "../features/businesses/useBusiness";

import {
  useUpdateBusiness,
} from "../features/businesses/useUpdateBusiness";

import {
  useDeleteBusiness,
} from "../features/businesses/useDeleteBusiness";

import EditBusinessModal from "../features/businesses/EditBusinessModal";

import DeleteBusinessModal from "../features/businesses/DeleteBusinessModal";

const formatStatus = (
  status
) => {
  if (!status) {
    return "Saved";
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

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

function BusinessDetailsPage() {
  const {
    businessId,
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
    isDeleteOpen,
    setIsDeleteOpen,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

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

  const updateBusinessMutation =
    useUpdateBusiness();

  const deleteBusinessMutation =
    useDeleteBusiness();

  const business =
    data?.business;

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

  return (
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
          onClick={() =>
            refetch()
          }
          disabled={
            isFetching
          }
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--border-primary)] bg-white/[0.02] px-3 text-xs font-medium text-[var(--text-muted)] transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            className={
              isFetching
                ? "animate-spin"
                : ""
            }
          />

          {isFetching
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
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border-primary)] bg-white/[0.025] px-4 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-white/[0.05] hover:text-white"
            >
              <Search
                size={14}
              />

              Start research
            </button>

            <button
              type="button"
              onClick={() => {
                setUpdateError("");

                setIsEditOpen(
                  true
                );
              }}
              disabled={
                deleteBusinessMutation
                  .isPending
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
                updateBusinessMutation
                  .isPending
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

      {/* ============================== */}
      {/* CONTENT GRID */}
      {/* ============================== */}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.8fr]">
        {/* ============================== */}
        {/* LEFT COLUMN */}
        {/* ============================== */}

        <div className="space-y-5">
          {/* ============================== */}
          {/* CONTACT */}
          {/* ============================== */}

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

          {/* ============================== */}
          {/* LOCATION */}
          {/* ============================== */}

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

          {/* ============================== */}
          {/* NOTES */}
          {/* ============================== */}

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

        {/* ============================== */}
        {/* RIGHT COLUMN */}
        {/* ============================== */}

        <div className="space-y-5">
          {/* ============================== */}
          {/* WORKFLOW */}
          {/* ============================== */}

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
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-primary)] bg-white/[0.02] px-4 py-3">
                <span className="text-xs text-[var(--text-secondary)]">
                  Current status
                </span>

                <span className="text-xs font-semibold text-white">
                  {formatStatus(
                    business.status
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-primary)] bg-white/[0.02] px-4 py-3">
                <span className="text-xs text-[var(--text-secondary)]">
                  Research completed
                </span>

                <span className="text-xs font-semibold text-white">
                  {business
                    .researchCompleted
                    ? "Yes"
                    : "No"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-primary)] bg-white/[0.02] px-4 py-3">
                <span className="text-xs text-[var(--text-secondary)]">
                  Website audit
                </span>

                <span className="text-xs font-semibold text-white">
                  {business
                    .websiteAuditCompleted
                    ? "Completed"
                    : "Not completed"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-primary)] bg-white/[0.02] px-4 py-3">
                <span className="text-xs text-[var(--text-secondary)]">
                  Converted to lead
                </span>

                <span className="text-xs font-semibold text-white">
                  {business
                    .convertedToLead
                    ? "Yes"
                    : "No"}
                </span>
              </div>
            </div>
          </section>

          {/* ============================== */}
          {/* RECORD DETAILS */}
          {/* ============================== */}

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
  );
}

export default BusinessDetailsPage;