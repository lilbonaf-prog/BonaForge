import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowRight,
  FileText,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import useLeadProposals from "./useLeadProposals";
import useCreateProposal from "./useCreateProposal";

const statusClasses = {
  draft:
    "border-white/10 bg-white/[0.04] text-white/55",

  sent:
    "border-sky-400/15 bg-sky-400/[0.06] text-sky-200",

  accepted:
    "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-200",

  rejected:
    "border-rose-400/15 bg-rose-400/[0.06] text-rose-200",

  expired:
    "border-amber-400/15 bg-amber-400/[0.06] text-amber-200",
};

const formatCurrency = (
  amount,
  currency = "GHS"
) => {
  const numericAmount =
    Number(amount);

  if (
    !Number.isFinite(
      numericAmount
    )
  ) {
    return `${currency} 0`;
  }

  try {
    return new Intl.NumberFormat(
      "en-GH",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(
      numericAmount
    );
  } catch {
    return `${currency} ${numericAmount.toLocaleString(
      "en-GH"
    )}`;
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

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data
    ?.message ||
  error?.message ||
  fallback;

const LeadProposalWorkspace = ({
  lead,
}) => {
  const navigate =
    useNavigate();

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  const leadId =
    lead?._id;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLeadProposals(
    leadId
  );

  const createMutation =
    useCreateProposal();

  const proposals =
    useMemo(
      () =>
        data?.proposals ||
        [],
      [
        data?.proposals,
      ]
    );

  const suggestedTitle =
    useMemo(() => {
      const services =
        Array.isArray(
          lead?.servicesInterestedIn
        )
          ? lead.servicesInterestedIn
          : [];

      if (
        services.length > 0
      ) {
        return `${services.join(
          " & "
        )} Proposal`;
      }

      const name =
        lead?.companyName ||
        lead?.business?.name ||
        lead?.name ||
        "Client";

      return `${name} Proposal`;
    }, [lead]);

  const openCreateForm =
    () => {
      setLocalError("");

      setTitle(
        suggestedTitle
      );

      setShowCreateForm(
        true
      );
    };

  const closeCreateForm =
    () => {
      if (
        createMutation.isPending
      ) {
        return;
      }

      setLocalError("");
      setTitle("");
      setShowCreateForm(
        false
      );
    };

  const handleCreate =
    async () => {
      if (
        !leadId ||
        createMutation.isPending
      ) {
        return;
      }

      const cleanTitle =
        title.trim();

      if (!cleanTitle) {
        setLocalError(
          "Proposal title is required."
        );

        return;
      }

      setLocalError("");

      try {
        const result =
          await createMutation.mutateAsync(
            {
              leadId,

              payload: {
                title:
                  cleanTitle,
              },
            }
          );

        const proposalId =
          result?.proposal?._id;

        if (!proposalId) {
          setLocalError(
            "Proposal was created, but its ID was not returned."
          );

          return;
        }

        setShowCreateForm(
          false
        );

        setTitle("");

        navigate(
          `/proposals/${proposalId}`
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to create proposal."
          )
        );
      }
    };

  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07] text-indigo-200">
            <FileText
              size={17}
            />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              Proposals
            </h2>

            <p className="mt-0.5 text-xs text-white/35">
              {proposals.length}{" "}
              {proposals.length ===
              1
                ? "proposal"
                : "proposals"}
            </p>
          </div>
        </div>

        {!showCreateForm ? (
          <button
            type="button"
            onClick={
              openCreateForm
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/15"
          >
            <Plus
              size={15}
            />

            New proposal
          </button>
        ) : null}
      </div>

      {/* CREATE FORM */}

      {showCreateForm ? (
        <div className="mt-5 rounded-2xl border border-indigo-400/15 bg-indigo-500/[0.04] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Create proposal
              </h3>

              <p className="mt-1 text-xs leading-5 text-white/35">
                BonaForge will use
                this lead&apos;s
                services, estimated
                value and opportunity
                summary as the
                starting proposal
                data.
              </p>
            </div>

            <button
              type="button"
              onClick={
                closeCreateForm
              }
              disabled={
                createMutation
                  .isPending
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
            >
              <X
                size={15}
              />
            </button>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.13em] text-white/30">
              Proposal title
            </span>

            <input
              type="text"
              value={title}
              onChange={(
                event
              ) => {
                setTitle(
                  event.target
                    .value
                );

                if (
                  localError
                ) {
                  setLocalError(
                    ""
                  );
                }
              }}
              placeholder="Enter proposal title"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400/35"
            />
          </label>

          {localError ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-3 py-2.5 text-sm text-rose-200">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0"
              />

              <span>
                {localError}
              </span>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={
                closeCreateForm
              }
              disabled={
                createMutation
                  .isPending
              }
              className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/55 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleCreate
              }
              disabled={
                createMutation
                  .isPending
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation
                .isPending ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Plus
                  size={15}
                />
              )}

              {createMutation
                .isPending
                ? "Creating..."
                : "Create proposal"}
            </button>
          </div>
        </div>
      ) : null}

      {/* LOADING */}

      {isLoading ? (
        <div className="mt-5 space-y-3">
          {[1, 2].map(
            (item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
              />
            )
          )}
        </div>
      ) : null}

      {/* ERROR */}

      {!isLoading &&
      isError ? (
        <div className="mt-5 rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0 text-rose-200"
            />

            <div>
              <p className="text-sm font-medium text-rose-100">
                Proposals could not
                be loaded
              </p>

              <p className="mt-1 text-xs leading-5 text-rose-200/60">
                {getErrorMessage(
                  error,
                  "Unable to load proposals for this lead."
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            Try again
          </button>
        </div>
      ) : null}

      {/* EMPTY */}

      {!isLoading &&
      !isError &&
      proposals.length ===
        0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/10 px-5 py-8 text-center">
          <FileText
            size={22}
            className="mx-auto text-white/20"
          />

          <p className="mt-3 text-sm font-medium text-white/60">
            No proposals yet
          </p>

          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-white/30">
            Create a proposal from
            this lead when you are
            ready to present the
            solution, scope and
            pricing.
          </p>
        </div>
      ) : null}

      {/* PROPOSALS */}

      {!isLoading &&
      !isError &&
      proposals.length >
        0 ? (
        <div className="mt-5 space-y-3">
          {proposals.map(
            (proposal) => {
              const status =
                proposal.status ||
                "draft";

              const currency =
                proposal
                  ?.pricingOverview
                  ?.currency ||
                lead?.currency ||
                "GHS";

              const amount =
                proposal
                  ?.pricingOverview
                  ?.estimatedAmount ??
                0;

              return (
                <button
                  key={
                    proposal._id
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      `/proposals/${proposal._id}`
                    )
                  }
                  className="group w-full rounded-2xl border border-white/[0.07] bg-black/10 p-4 text-left transition hover:border-indigo-400/20 hover:bg-white/[0.035]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${
                            statusClasses[
                              status
                            ] ||
                            statusClasses
                              .draft
                          }`}
                        >
                          {status}
                        </span>

                        <span className="text-[11px] text-white/30">
                          {proposal.proposalNumber ||
                            "Proposal"}
                        </span>
                      </div>

                      <p className="mt-3 break-words text-sm font-semibold text-white transition group-hover:text-indigo-100">
                        {proposal.title ||
                          "Untitled proposal"}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        Updated{" "}
                        {formatDateTime(
                          proposal.updatedAt
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                          Value
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white/70">
                          {formatCurrency(
                            amount,
                            currency
                          )}
                        </p>
                      </div>

                      <ArrowRight
                        size={16}
                        className="text-white/25 transition group-hover:translate-x-0.5 group-hover:text-indigo-200"
                      />
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>
      ) : null}

      {isFetching &&
      !isLoading ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-white/30">
          <Loader2
            size={13}
            className="animate-spin"
          />

          Updating proposals...
        </div>
      ) : null}
    </section>
  );
};

export default LeadProposalWorkspace;