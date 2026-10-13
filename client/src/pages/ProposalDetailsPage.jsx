import {
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileCheck2,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import useProposal from "../features/proposals/useProposal";
import useUpdateProposal from "../features/proposals/useUpdateProposal";
import useSendProposal from "../features/proposals/useSendProposal";
import useAcceptProposal from "../features/proposals/useAcceptProposal";
import useRejectProposal from "../features/proposals/useRejectProposal";
import useExpireProposal from "../features/proposals/useExpireProposal";
import useReopenProposal from "../features/proposals/useReopenProposal";
import useDeleteProposal from "../features/proposals/useDeleteProposal";
import printProposal from "../utils/proposalPrint";

const statusConfig = {
  draft: {
    label: "Draft",
    className:
      "border-slate-500/20 bg-slate-500/10 text-slate-300",
  },

  sent: {
    label: "Sent",
    className:
      "border-sky-500/20 bg-sky-500/10 text-sky-300",
  },

  accepted: {
    label: "Accepted",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  },

  rejected: {
    label: "Rejected",
    className:
      "border-rose-500/20 bg-rose-500/10 text-rose-300",
  },

  expired: {
    label: "Expired",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
  },
};

const formatDate = (
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

const formatCurrency = (
  value,
  currency = "GHS"
) => {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount
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
    ).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(
      "en-GH"
    )}`;
  }
};

const toDateInputValue = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
};

const createEmptyScopeItem =
  () => ({
    title: "",
    description: "",
    deliverables: [],
  });

const normaliseProposalToForm =
  (proposal) => ({
    title:
      proposal?.title || "",

    summary:
      proposal?.summary || "",

    clientProblem:
      proposal?.clientProblem ||
      "",

    proposedSolution:
      proposal?.proposedSolution ||
      "",

    objectives:
      Array.isArray(
        proposal?.objectives
      )
        ? [...proposal.objectives]
        : [],

    scopeOfWork:
      Array.isArray(
        proposal?.scopeOfWork
      )
        ? proposal.scopeOfWork.map(
            (item) => ({
              _id:
                item._id,

              title:
                item.title ||
                "",

              description:
                item.description ||
                "",

              deliverables:
                Array.isArray(
                  item.deliverables
                )
                  ? [
                      ...item.deliverables,
                    ]
                  : [],
            })
          )
        : [],

    timeline: {
      estimatedDuration:
        proposal?.timeline
          ?.estimatedDuration ||
        "",

      startDate:
        toDateInputValue(
          proposal?.timeline
            ?.startDate
        ),

      endDate:
        toDateInputValue(
          proposal?.timeline
            ?.endDate
        ),
    },

    pricingOverview: {
      currency:
        proposal
          ?.pricingOverview
          ?.currency ||
        "GHS",

      estimatedAmount:
        proposal
          ?.pricingOverview
          ?.estimatedAmount ??
        0,

      note:
        proposal
          ?.pricingOverview
          ?.note ||
        "",
    },

    termsAndConditions:
      proposal
        ?.termsAndConditions ||
      "",

    notes:
      proposal?.notes || "",

    validUntil:
      toDateInputValue(
        proposal?.validUntil
      ),
  });

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data
    ?.message ||
  error?.message ||
  fallback;

const ProposalDetailsPage =
  () => {
    const {
      proposalId,
    } = useParams();

    const navigate =
      useNavigate();

    const [
      isEditing,
      setIsEditing,
    ] = useState(false);

    const [
      form,
      setForm,
    ] = useState(null);

    const [
      localError,
      setLocalError,
    ] = useState("");

    const [
      notice,
      setNotice,
    ] = useState("");

    const {
      data,
      isLoading,
      isFetching,
      isError,
      error,
      refetch,
    } = useProposal(
      proposalId
    );

    const updateMutation =
      useUpdateProposal();

    const sendMutation =
      useSendProposal();

    const acceptMutation =
      useAcceptProposal();

    const rejectMutation =
      useRejectProposal();

    const expireMutation =
      useExpireProposal();

    const reopenMutation =
      useReopenProposal();

    const deleteMutation =
      useDeleteProposal();

    const proposal =
      data?.proposal ||
      null;

    const lead =
      proposal?.lead ||
      null;

    const business =
      proposal?.business ||
      null;

    const status =
      proposal?.status ||
      "draft";

    const statusStyle =
      statusConfig[status] ||
      statusConfig.draft;

    const canEdit =
      ["draft", "sent"].includes(
        status
      );

    const isBusy =
      updateMutation.isPending ||
      sendMutation.isPending ||
      acceptMutation.isPending ||
      rejectMutation.isPending ||
      expireMutation.isPending ||
      reopenMutation.isPending ||
      deleteMutation.isPending;

    const clearMessages =
      () => {
        setLocalError("");
        setNotice("");
      };

    const handleBeginEdit =
      () => {
        if (
          !proposal ||
          !canEdit
        ) {
          return;
        }

        setForm(
          normaliseProposalToForm(
            proposal
          )
        );

        clearMessages();
        setIsEditing(true);
      };

    const handleCancelEdit =
      () => {
        setForm(
          normaliseProposalToForm(
            proposal
          )
        );

        clearMessages();
        setIsEditing(false);
      };

    const setField = (
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,
          [field]: value,
        })
      );
    };

    const setTimelineField = (
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          timeline: {
            ...current.timeline,
            [field]: value,
          },
        })
      );
    };

    const setPricingField = (
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          pricingOverview: {
            ...current
              .pricingOverview,
            [field]: value,
          },
        })
      );
    };

    const addObjective =
      () => {
        setForm(
          (current) => ({
            ...current,

            objectives: [
              ...current.objectives,
              "",
            ],
          })
        );
      };

    const updateObjective = (
      index,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          objectives:
            current.objectives.map(
              (
                objective,
                objectiveIndex
              ) =>
                objectiveIndex ===
                index
                  ? value
                  : objective
            ),
        })
      );
    };

    const removeObjective = (
      index
    ) => {
      setForm(
        (current) => ({
          ...current,

          objectives:
            current.objectives.filter(
              (
                _objective,
                objectiveIndex
              ) =>
                objectiveIndex !==
                index
            ),
        })
      );
    };

    const addScopeItem =
      () => {
        setForm(
          (current) => ({
            ...current,

            scopeOfWork: [
              ...current.scopeOfWork,
              createEmptyScopeItem(),
            ],
          })
        );
      };

    const updateScopeItem = (
      index,
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          scopeOfWork:
            current.scopeOfWork.map(
              (
                item,
                itemIndex
              ) =>
                itemIndex ===
                index
                  ? {
                      ...item,
                      [field]:
                        value,
                    }
                  : item
            ),
        })
      );
    };

    const removeScopeItem = (
      index
    ) => {
      setForm(
        (current) => ({
          ...current,

          scopeOfWork:
            current.scopeOfWork.filter(
              (
                _item,
                itemIndex
              ) =>
                itemIndex !==
                index
            ),
        })
      );
    };

    const addDeliverable = (
      scopeIndex
    ) => {
      setForm(
        (current) => ({
          ...current,

          scopeOfWork:
            current.scopeOfWork.map(
              (
                item,
                itemIndex
              ) =>
                itemIndex ===
                scopeIndex
                  ? {
                      ...item,

                      deliverables: [
                        ...item.deliverables,
                        "",
                      ],
                    }
                  : item
            ),
        })
      );
    };

    const updateDeliverable = (
      scopeIndex,
      deliverableIndex,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          scopeOfWork:
            current.scopeOfWork.map(
              (
                item,
                itemIndex
              ) =>
                itemIndex ===
                scopeIndex
                  ? {
                      ...item,

                      deliverables:
                        item.deliverables.map(
                          (
                            deliverable,
                            currentIndex
                          ) =>
                            currentIndex ===
                            deliverableIndex
                              ? value
                              : deliverable
                        ),
                    }
                  : item
            ),
        })
      );
    };

    const removeDeliverable = (
      scopeIndex,
      deliverableIndex
    ) => {
      setForm(
        (current) => ({
          ...current,

          scopeOfWork:
            current.scopeOfWork.map(
              (
                item,
                itemIndex
              ) =>
                itemIndex ===
                scopeIndex
                  ? {
                      ...item,

                      deliverables:
                        item.deliverables.filter(
                          (
                            _deliverable,
                            currentIndex
                          ) =>
                            currentIndex !==
                            deliverableIndex
                        ),
                    }
                  : item
            ),
        })
      );
    };

    const handleSave =
      async () => {
        if (
          !proposal?._id ||
          !form
        ) {
          return;
        }

        clearMessages();

        if (
          !form.title.trim()
        ) {
          setLocalError(
            "Proposal title is required."
          );

          return;
        }

        const invalidScope =
          form.scopeOfWork.find(
            (item) =>
              !item.title.trim() &&
              (
                item.description.trim() ||
                item.deliverables.some(
                  (deliverable) =>
                    deliverable.trim()
                )
              )
          );

        if (invalidScope) {
          setLocalError(
            "Every scope item with details must have a title."
          );

          return;
        }

        const payload = {
          title:
            form.title.trim(),

          summary:
            form.summary.trim(),

          clientProblem:
            form.clientProblem.trim(),

          proposedSolution:
            form.proposedSolution.trim(),

          objectives:
            form.objectives
              .map(
                (objective) =>
                  objective.trim()
              )
              .filter(Boolean),

          scopeOfWork:
            form.scopeOfWork
              .filter(
                (item) =>
                  item.title.trim()
              )
              .map(
                (item) => ({
                  title:
                    item.title.trim(),

                  description:
                    item.description.trim(),

                  deliverables:
                    item.deliverables
                      .map(
                        (
                          deliverable
                        ) =>
                          deliverable.trim()
                      )
                      .filter(
                        Boolean
                      ),
                })
              ),

          timeline: {
            estimatedDuration:
              form.timeline
                .estimatedDuration
                .trim(),

            startDate:
              form.timeline
                .startDate ||
              null,

            endDate:
              form.timeline
                .endDate ||
              null,
          },

          pricingOverview: {
            currency:
              form
                .pricingOverview
                .currency
                .trim() ||
              "GHS",

            estimatedAmount:
              Number(
                form
                  .pricingOverview
                  .estimatedAmount
              ) || 0,

            note:
              form
                .pricingOverview
                .note
                .trim(),
          },

          termsAndConditions:
            form
              .termsAndConditions
              .trim(),

          notes:
            form.notes.trim(),

          validUntil:
            form.validUntil ||
            null,
        };

        try {
          const result =
            await updateMutation.mutateAsync(
              {
                proposalId:
                  proposal._id,

                leadId:
                  lead?._id,

                payload,
              }
            );

          setNotice(
            result?.message ||
              "Proposal saved successfully."
          );

          setIsEditing(false);
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not save the proposal."
            )
          );
        }
      };

    const handleSend =
      async () => {
        if (!proposal?._id) {
          return;
        }

        clearMessages();

        try {
          const result =
            await sendMutation.mutateAsync(
              proposal._id
            );

          setNotice(
            result?.message ||
              "Proposal marked as sent."
          );

          setIsEditing(false);
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not send the proposal."
            )
          );
        }
      };

    const handleAccept =
      async () => {
        if (!proposal?._id) {
          return;
        }

        const confirmed =
          window.confirm(
            "Mark this proposal as accepted?"
          );

        if (!confirmed) {
          return;
        }

        clearMessages();

        try {
          const result =
            await acceptMutation.mutateAsync(
              proposal._id
            );

          setNotice(
            result?.message ||
              "Proposal accepted successfully."
          );
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not accept the proposal."
            )
          );
        }
      };

    const handleReject =
      async () => {
        if (!proposal?._id) {
          return;
        }

        const confirmed =
          window.confirm(
            "Mark this proposal as rejected?"
          );

        if (!confirmed) {
          return;
        }

        clearMessages();

        try {
          const result =
            await rejectMutation.mutateAsync(
              proposal._id
            );

          setNotice(
            result?.message ||
              "Proposal rejected successfully."
          );
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not reject the proposal."
            )
          );
        }
      };

    const handleExpire =
      async () => {
        if (!proposal?._id) {
          return;
        }

        const confirmed =
          window.confirm(
            "Mark this proposal as expired?"
          );

        if (!confirmed) {
          return;
        }

        clearMessages();

        try {
          const result =
            await expireMutation.mutateAsync(
              proposal._id
            );

          setNotice(
            result?.message ||
              "Proposal marked as expired."
          );

          setIsEditing(false);
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not expire the proposal."
            )
          );
        }
      };

    const handleReopen =
      async () => {
        if (!proposal?._id) {
          return;
        }

        clearMessages();

        try {
          const result =
            await reopenMutation.mutateAsync(
              proposal._id
            );

          setNotice(
            result?.message ||
              "Proposal reopened successfully."
          );
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not reopen the proposal."
            )
          );
        }
      };

    const handlePrintProposal =
      () => {
        if (!proposal) {
          return;
        }

        clearMessages();

        const result =
          printProposal(
            proposal
          );

        if (!result.success) {
          setLocalError(
            result.message
          );
        }
      };

    const handleDelete =
      async () => {
        if (!proposal?._id) {
          return;
        }

        const confirmed =
          window.confirm(
            `Delete ${
              proposal.proposalNumber ||
              "this proposal"
            }? This cannot be undone.`
          );

        if (!confirmed) {
          return;
        }

        clearMessages();

        try {
          await deleteMutation.mutateAsync(
            proposal._id
          );

          navigate(
            "/proposals",
            {
              replace: true,
            }
          );
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not delete the proposal."
            )
          );
        }
      };

    if (isLoading) {
      return (
        <div className="flex min-h-[520px] items-center justify-center rounded-[28px] border border-white/10 bg-slate-950/60">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-indigo-300" />

            <p className="mt-3 text-sm text-slate-400">
              Loading proposal...
            </p>
          </div>
        </div>
      );
    }

    if (
      isError ||
      !proposal
    ) {
      return (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/proposals"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Proposals
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />

              <div>
                <h2 className="font-semibold text-red-200">
                  Could not load
                  proposal
                </h2>

                <p className="mt-1 text-sm text-red-200/70">
                  {getErrorMessage(
                    error,
                    "Proposal not found."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 md:p-6 lg:p-8">
        {/* TOP NAVIGATION */}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/proposals"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Proposals
          </button>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            disabled={
              isFetching
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* HERO */}

        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle.className}`}
                  >
                    {
                      statusStyle.label
                    }
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
                    {
                      proposal.proposalNumber
                    }
                  </span>
                </div>

                {isEditing ? (
                  <input
                    value={
                      form?.title ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "title",
                        event.target
                          .value
                      )
                    }
                    className="mt-5 w-full max-w-4xl rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-2xl font-semibold text-white outline-none focus:border-indigo-500/40"
                  />
                ) : (
                  <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                    {
                      proposal.title
                    }
                  </h1>
                )}

                <p className="mt-3 text-sm text-slate-500">
                  {lead?.name ||
                    business?.name ||
                    "Unknown client"}
                </p>

                {lead?.jobTitle ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {
                      lead.jobTitle
                    }
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={
                      handlePrintProposal
                    }
                    disabled={
                      isBusy
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <Printer
                      size={16}
                    />

                    Print / PDF
                  </button>
                ) : null}

                {!isEditing &&
                canEdit ? (
                  <button
                    type="button"
                    onClick={
                      handleBeginEdit
                    }
                    disabled={
                      isBusy
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/15 disabled:opacity-50"
                  >
                    <Pencil
                      size={16}
                    />

                    Edit proposal
                  </button>
                ) : null}

                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={
                        handleCancelEdit
                      }
                      disabled={
                        isBusy
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      <X
                        size={16}
                      />

                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSave
                      }
                      disabled={
                        isBusy
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      {updateMutation
                        .isPending ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Save
                          size={16}
                        />
                      )}

                      Save proposal
                    </button>
                  </>
                ) : null}

                {status ===
                "draft" ? (
                  <button
                    type="button"
                    onClick={
                      handleSend
                    }
                    disabled={
                      isBusy ||
                      isEditing
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/15 disabled:opacity-50"
                  >
                    {sendMutation
                      .isPending ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Send
                        size={16}
                      />
                    )}

                    Mark sent
                  </button>
                ) : null}

                {status ===
                "sent" ? (
                  <>
                    <button
                      type="button"
                      onClick={
                        handleAccept
                      }
                      disabled={
                        isBusy ||
                        isEditing
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15 disabled:opacity-50"
                    >
                      <CheckCircle2
                        size={16}
                      />

                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleReject
                      }
                      disabled={
                        isBusy ||
                        isEditing
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15 disabled:opacity-50"
                    >
                      <XCircle
                        size={16}
                      />

                      Reject
                    </button>
                  </>
                ) : null}

                {[
                  "draft",
                  "sent",
                ].includes(
                  status
                ) ? (
                  <button
                    type="button"
                    onClick={
                      handleExpire
                    }
                    disabled={
                      isBusy ||
                      isEditing
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15 disabled:opacity-50"
                  >
                    <Clock3
                      size={16}
                    />

                    Expire
                  </button>
                ) : null}

                {[
                  "rejected",
                  "expired",
                ].includes(
                  status
                ) ? (
                  <button
                    type="button"
                    onClick={
                      handleReopen
                    }
                    disabled={
                      isBusy
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15 disabled:opacity-50"
                  >
                    <RotateCcw
                      size={16}
                    />

                    Reopen
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={
                    handleDelete
                  }
                  disabled={
                    isBusy
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/15 bg-red-500/[0.05] px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2
                    size={16}
                  />

                  Delete
                </button>
              </div>
            </div>

            {localError ? (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

                <p className="text-sm text-red-200">
                  {localError}
                </p>
              </div>
            ) : null}

            {notice ? (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

                <p className="text-sm text-emerald-200">
                  {notice}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {/* METRICS */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Estimated value"
            value={formatCurrency(
              proposal
                .pricingOverview
                ?.estimatedAmount,
              proposal
                .pricingOverview
                ?.currency
            )}
            icon={DollarSign}
          />

          <MetricCard
            label="Scope items"
            value={
              proposal.scopeOfWork
                ?.length || 0
            }
            icon={FileCheck2}
          />

          <MetricCard
            label="Objectives"
            value={
              proposal.objectives
                ?.length || 0
            }
            icon={CheckCircle2}
          />

          <MetricCard
            label="Valid until"
            value={
              proposal.validUntil
                ? formatDate(
                    proposal.validUntil
                  )
                : "Not set"
            }
            icon={CalendarDays}
            compact
          />
        </section>

        {/* CLIENT */}

        <SectionCard
          title="Client"
          icon={FileText}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem
              label="Lead"
              value={
                lead?.name ||
                "Not set"
              }
            />

            <InfoItem
              label="Company"
              value={
                lead?.companyName ||
                business?.name ||
                "Not set"
              }
            />

            <InfoItem
              label="Email"
              value={
                lead?.email ||
                "Not set"
              }
            />

            <InfoItem
              label="Phone"
              value={
                lead?.phone ||
                "Not set"
              }
            />
          </div>
        </SectionCard>

        {/* SUMMARY */}

        <EditableTextSection
          title="Proposal summary"
          description="A concise overview of the opportunity and proposed engagement."
          value={
            proposal.summary
          }
          editing={
            isEditing
          }
          editValue={
            form?.summary ||
            ""
          }
          onChange={(
            value
          ) =>
            setField(
              "summary",
              value
            )
          }
          placeholder="Summarize the proposal..."
        />

        {/* CLIENT PROBLEM */}

        <EditableTextSection
          title="Client problem"
          description="Describe the business problem, pain point or opportunity this proposal addresses."
          value={
            proposal.clientProblem
          }
          editing={
            isEditing
          }
          editValue={
            form?.clientProblem ||
            ""
          }
          onChange={(
            value
          ) =>
            setField(
              "clientProblem",
              value
            )
          }
          placeholder="Describe the client's current problem..."
        />

        {/* SOLUTION */}

        <EditableTextSection
          title="Proposed solution"
          description="Explain how the proposed work will solve the client's problem."
          value={
            proposal.proposedSolution
          }
          editing={
            isEditing
          }
          editValue={
            form?.proposedSolution ||
            ""
          }
          onChange={(
            value
          ) =>
            setField(
              "proposedSolution",
              value
            )
          }
          placeholder="Describe the proposed solution..."
        />

        {/* OBJECTIVES */}

        <SectionCard
          title="Objectives"
          icon={CheckCircle2}
          action={
            isEditing ? (
              <button
                type="button"
                onClick={
                  addObjective
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
              >
                <Plus
                  size={14}
                />

                Add objective
              </button>
            ) : null
          }
        >
          {isEditing ? (
            <div className="space-y-3">
              {form?.objectives
                ?.length ? (
                form.objectives.map(
                  (
                    objective,
                    index
                  ) => (
                    <div
                      key={`objective-${index}`}
                      className="flex gap-2"
                    >
                      <input
                        value={
                          objective
                        }
                        onChange={(
                          event
                        ) =>
                          updateObjective(
                            index,
                            event.target
                              .value
                          )
                        }
                        placeholder="Proposal objective..."
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500/40"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeObjective(
                            index
                          )
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-500/[0.05] text-red-300 transition hover:bg-red-500/10"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-slate-600">
                  No objectives
                  added yet.
                </p>
              )}
            </div>
          ) : proposal
              .objectives
              ?.length ? (
            <div className="space-y-3">
              {proposal.objectives.map(
                (
                  objective,
                  index
                ) => (
                  <div
                    key={`${objective}-${index}`}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-300"
                    />

                    <p className="text-sm leading-6 text-slate-400">
                      {objective}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No objectives have
              been added.
            </p>
          )}
        </SectionCard>

        {/* SCOPE */}

        <SectionCard
          title="Scope of work"
          icon={FileCheck2}
          action={
            isEditing ? (
              <button
                type="button"
                onClick={
                  addScopeItem
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
              >
                <Plus
                  size={14}
                />

                Add scope item
              </button>
            ) : null
          }
        >
          {isEditing ? (
            <div className="space-y-5">
              {form?.scopeOfWork
                ?.length ? (
                form.scopeOfWork.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item._id ||
                        `scope-${index}`
                      }
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-300">
                          Scope item{" "}
                          {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeScopeItem(
                              index
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/15 bg-red-500/[0.05] text-red-300 transition hover:bg-red-500/10"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>
                      </div>

                      <input
                        value={
                          item.title
                        }
                        onChange={(
                          event
                        ) =>
                          updateScopeItem(
                            index,
                            "title",
                            event.target
                              .value
                          )
                        }
                        placeholder="Scope title"
                        className="mt-4 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500/40"
                      />

                      <textarea
                        rows={4}
                        value={
                          item.description
                        }
                        onChange={(
                          event
                        ) =>
                          updateScopeItem(
                            index,
                            "description",
                            event.target
                              .value
                          )
                        }
                        placeholder="Describe this part of the work..."
                        className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500/40"
                      />

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Deliverables
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            addDeliverable(
                              index
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/10"
                        >
                          <Plus
                            size={13}
                          />

                          Add
                        </button>
                      </div>

                      <div className="mt-3 space-y-2">
                        {item
                          .deliverables
                          .map(
                            (
                              deliverable,
                              deliverableIndex
                            ) => (
                              <div
                                key={`deliverable-${index}-${deliverableIndex}`}
                                className="flex gap-2"
                              >
                                <input
                                  value={
                                    deliverable
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateDeliverable(
                                      index,
                                      deliverableIndex,
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  placeholder="Deliverable..."
                                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500/40"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeDeliverable(
                                      index,
                                      deliverableIndex
                                    )
                                  }
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-500/[0.05] text-red-300"
                                >
                                  <X
                                    size={14}
                                  />
                                </button>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-slate-600">
                  No scope items
                  added.
                </p>
              )}
            </div>
          ) : proposal
              .scopeOfWork
              ?.length ? (
            <div className="space-y-4">
              {proposal.scopeOfWork.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item._id ||
                      `${item.title}-${index}`
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <h3 className="font-semibold text-white">
                      {item.title}
                    </h3>

                    {item.description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                        {
                          item.description
                        }
                      </p>
                    ) : null}

                    {item.deliverables
                      ?.length ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Deliverables
                        </p>

                        <div className="mt-3 space-y-2">
                          {item.deliverables.map(
                            (
                              deliverable,
                              deliverableIndex
                            ) => (
                              <div
                                key={`${deliverable}-${deliverableIndex}`}
                                className="flex gap-2 text-sm text-slate-400"
                              >
                                <CheckCircle2
                                  size={14}
                                  className="mt-0.5 shrink-0 text-indigo-300"
                                />

                                {
                                  deliverable
                                }
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No scope of work has
              been defined.
            </p>
          )}
        </SectionCard>

        {/* TIMELINE */}

        <SectionCard
          title="Timeline"
          icon={CalendarDays}
        >
          {isEditing ? (
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                label="Estimated duration"
              >
                <input
                  value={
                    form?.timeline
                      ?.estimatedDuration ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    setTimelineField(
                      "estimatedDuration",
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. 4 weeks"
                  className="input-base"
                />
              </FormField>

              <FormField
                label="Start date"
              >
                <input
                  type="date"
                  value={
                    form?.timeline
                      ?.startDate ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    setTimelineField(
                      "startDate",
                      event.target
                        .value
                    )
                  }
                  className="input-base"
                />
              </FormField>

              <FormField
                label="End date"
              >
                <input
                  type="date"
                  value={
                    form?.timeline
                      ?.endDate ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    setTimelineField(
                      "endDate",
                      event.target
                        .value
                    )
                  }
                  className="input-base"
                />
              </FormField>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <InfoItem
                label="Estimated duration"
                value={
                  proposal.timeline
                    ?.estimatedDuration ||
                  "Not set"
                }
              />

              <InfoItem
                label="Start date"
                value={
                  proposal.timeline
                    ?.startDate
                    ? formatDate(
                        proposal
                          .timeline
                          .startDate
                      )
                    : "Not set"
                }
              />

              <InfoItem
                label="End date"
                value={
                  proposal.timeline
                    ?.endDate
                    ? formatDate(
                        proposal
                          .timeline
                          .endDate
                      )
                    : "Not set"
                }
              />
            </div>
          )}
        </SectionCard>

        {/* PRICING */}

        <SectionCard
          title="Pricing overview"
          icon={DollarSign}
        >
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Currency"
                >
                  <input
                    value={
                      form
                        ?.pricingOverview
                        ?.currency ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      setPricingField(
                        "currency",
                        event.target
                          .value
                          .toUpperCase()
                      )
                    }
                    placeholder="GHS"
                    className="input-base"
                  />
                </FormField>

                <FormField
                  label="Estimated amount"
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form
                        ?.pricingOverview
                        ?.estimatedAmount ??
                      0
                    }
                    onChange={(
                      event
                    ) =>
                      setPricingField(
                        "estimatedAmount",
                        event.target
                          .value
                      )
                    }
                    className="input-base"
                  />
                </FormField>
              </div>

              <FormField
                label="Pricing note"
              >
                <textarea
                  rows={4}
                  value={
                    form
                      ?.pricingOverview
                      ?.note ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    setPricingField(
                      "note",
                      event.target
                        .value
                    )
                  }
                  placeholder="Add pricing assumptions or notes..."
                  className="textarea-base"
                />
              </FormField>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem
                  label="Currency"
                  value={
                    proposal
                      .pricingOverview
                      ?.currency ||
                    "GHS"
                  }
                />

                <InfoItem
                  label="Estimated amount"
                  value={formatCurrency(
                    proposal
                      .pricingOverview
                      ?.estimatedAmount,
                    proposal
                      .pricingOverview
                      ?.currency
                  )}
                />
              </div>

              {proposal
                .pricingOverview
                ?.note ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-400">
                  {
                    proposal
                      .pricingOverview
                      .note
                  }
                </p>
              ) : null}
            </div>
          )}
        </SectionCard>

        {/* VALIDITY */}

        <SectionCard
          title="Proposal validity"
          icon={Clock3}
        >
          {isEditing ? (
            <FormField
              label="Valid until"
            >
              <input
                type="date"
                value={
                  form?.validUntil ||
                  ""
                }
                onChange={(
                  event
                ) =>
                  setField(
                    "validUntil",
                    event.target
                      .value
                  )
                }
                className="input-base max-w-sm"
              />
            </FormField>
          ) : (
            <InfoItem
              label="Valid until"
              value={
                proposal.validUntil
                  ? formatDate(
                      proposal.validUntil
                    )
                  : "Not set"
              }
            />
          )}
        </SectionCard>

        {/* TERMS */}

        <EditableTextSection
          title="Terms and conditions"
          description="Commercial terms, responsibilities and conditions for the engagement."
          value={
            proposal
              .termsAndConditions
          }
          editing={
            isEditing
          }
          editValue={
            form
              ?.termsAndConditions ||
            ""
          }
          onChange={(
            value
          ) =>
            setField(
              "termsAndConditions",
              value
            )
          }
          placeholder="Add proposal terms and conditions..."
          rows={7}
        />

        {/* NOTES */}

        <EditableTextSection
          title="Internal notes"
          description="Private notes for your own sales workflow."
          value={
            proposal.notes
          }
          editing={
            isEditing
          }
          editValue={
            form?.notes ||
            ""
          }
          onChange={(
            value
          ) =>
            setField(
              "notes",
              value
            )
          }
          placeholder="Add internal notes..."
          rows={6}
        />

        {/* METADATA */}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoItem
            label="Created"
            value={formatDate(
              proposal.createdAt
            )}
          />

          <InfoItem
            label="Last updated"
            value={formatDate(
              proposal.updatedAt
            )}
          />

          <InfoItem
            label="Sent"
            value={formatDate(
              proposal.sentAt
            )}
          />

          <InfoItem
            label="Accepted"
            value={formatDate(
              proposal.acceptedAt
            )}
          />
        </section>

        <style>{`
          .input-base {
            width: 100%;
            border-radius: 0.75rem;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgb(15 23 42);
            padding: 0.7rem 1rem;
            font-size: 0.875rem;
            color: white;
            outline: none;
          }

          .input-base:focus {
            border-color: rgba(99,102,241,0.45);
          }

          .textarea-base {
            width: 100%;
            resize: vertical;
            border-radius: 0.75rem;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgb(15 23 42);
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            line-height: 1.5rem;
            color: white;
            outline: none;
          }

          .textarea-base:focus {
            border-color: rgba(99,102,241,0.45);
          }
        `}</style>
      </div>
    );
  };

const MetricCard = ({
  label,
  value,
  icon: Icon,
  compact = false,
}) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p
          className={`mt-2 font-semibold text-white ${
            compact
              ? "text-sm"
              : "text-2xl"
          }`}
        >
          {value}
        </p>
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400">
        <Icon
          size={17}
        />
      </div>
    </div>
  </div>
);

const SectionCard = ({
  title,
  icon: Icon,
  action,
  children,
}) => (
  <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon
            size={17}
            className="text-indigo-300"
          />
        ) : null}

        <h2 className="font-semibold text-white">
          {title}
        </h2>
      </div>

      {action}
    </div>

    <div className="mt-5">
      {children}
    </div>
  </section>
);

const EditableTextSection = ({
  title,
  description,
  value,
  editing,
  editValue,
  onChange,
  placeholder,
  rows = 5,
}) => (
  <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
    <h2 className="font-semibold text-white">
      {title}
    </h2>

    {description ? (
      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    ) : null}

    {editing ? (
      <textarea
        rows={rows}
        value={
          editValue
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500/40"
      />
    ) : (
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
        {value ||
          "Not provided yet."}
      </p>
    )}
  </section>
);

const InfoItem = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
    <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
      {label}
    </p>

    <p className="mt-2 break-words text-sm font-medium text-slate-300">
      {value}
    </p>
  </div>
);

const FormField = ({
  label,
  children,
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600">
      {label}
    </span>

    {children}
  </label>
);

export default ProposalDetailsPage;