import {
  useMemo,
  useState,
} from "react";

import {
  CalendarClock,
  Check,
  Clock3,
  Mail,
  MessageCircleMore,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCcw,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";

import LogLeadActivityModal from "./LogLeadActivityModal";
import useCancelLeadFollowUp from "./useCancelLeadFollowUp";
import useCompleteLeadFollowUp from "./useCompleteLeadFollowUp";
import useCreateLeadActivity from "./useCreateLeadActivity";
import useDeleteLeadActivity from "./useDeleteLeadActivity";
import useLeadActivities from "./useLeadActivities";

const activityLabels = {
  phone_call: "Phone call",
  whatsapp: "WhatsApp",
  email: "Email",
  sms: "SMS",
  meeting: "Meeting",
  social_media: "Social media",
  note: "Internal note",
  other: "Other",
};

const outcomeLabels = {
  connected: "Connected",
  no_answer: "No answer",
  left_message: "Left message",
  replied: "Replied",
  interested: "Interested",
  not_interested:
    "Not interested",
  follow_up_required:
    "Follow-up required",
  meeting_scheduled:
    "Meeting scheduled",
  proposal_requested:
    "Proposal requested",
  quotation_requested:
    "Quotation requested",
  won: "Won",
  lost: "Lost",
  other: "Other",
};

const directionLabels = {
  outbound: "Outbound",
  inbound: "Inbound",
  internal: "Internal",
};

const followUpLabels = {
  not_required:
    "No follow-up",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
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

const activityIcons = {
  phone_call: Phone,
  whatsapp: MessageCircleMore,
  email: Mail,
  sms: MessageCircleMore,
  meeting: UsersRound,
  social_media: MessageCircleMore,
  note: MoreHorizontal,
  other: MoreHorizontal,
};

const LeadActivityWorkspace = ({
  leadId,
}) => {
  const [
    isLogOpen,
    setIsLogOpen,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLeadActivities(
    leadId,
    {
      page: 1,
      limit: 100,
    }
  );

  const createMutation =
    useCreateLeadActivity();

  const completeMutation =
    useCompleteLeadFollowUp();

  const cancelMutation =
    useCancelLeadFollowUp();

  const deleteMutation =
    useDeleteLeadActivity();

  const activities =
    useMemo(
      () =>
        data?.activities ||
        [],
      [data?.activities]
    );

  const stats = {
    total:
      data?.stats?.total ??
      data?.total ??
      0,

    pending:
      data?.stats
        ?.pendingFollowUps ??
      0,

    completed:
      data?.stats
        ?.completedFollowUps ??
      0,
  };

  const isActionPending =
    createMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending ||
    deleteMutation.isPending;

  const handleCreate = (
    payload
  ) => {
    if (!leadId) {
      return;
    }

    setActionError("");

    createMutation.mutate(
      {
        leadId,
        payload,
      },
      {
        onSuccess: () => {
          setIsLogOpen(false);
          setActionError("");
        },

        onError: (
          mutationError
        ) => {
          setActionError(
            mutationError
              ?.response?.data
              ?.message ||
              mutationError
                ?.message ||
              "Unable to log this activity."
          );
        },
      }
    );
  };

  const handleComplete = (
    activityId
  ) => {
    if (
      !activityId ||
      isActionPending
    ) {
      return;
    }

    setActionError("");

    completeMutation.mutate(
      activityId,
      {
        onError: (
          mutationError
        ) => {
          setActionError(
            mutationError
              ?.response?.data
              ?.message ||
              mutationError
                ?.message ||
              "Unable to complete this follow-up."
          );
        },
      }
    );
  };

  const handleCancel = (
    activityId
  ) => {
    if (
      !activityId ||
      isActionPending
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Cancel this follow-up?"
      );

    if (!confirmed) {
      return;
    }

    setActionError("");

    cancelMutation.mutate(
      activityId,
      {
        onError: (
          mutationError
        ) => {
          setActionError(
            mutationError
              ?.response?.data
              ?.message ||
              mutationError
                ?.message ||
              "Unable to cancel this follow-up."
          );
        },
      }
    );
  };

  const handleDelete = (
    activityId
  ) => {
    if (
      !activityId ||
      isActionPending
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this activity from the contact history? This cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    setActionError("");

    deleteMutation.mutate(
      activityId,
      {
        onError: (
          mutationError
        ) => {
          setActionError(
            mutationError
              ?.response?.data
              ?.message ||
              mutationError
                ?.message ||
              "Unable to delete this activity."
          );
        },
      }
    );
  };

  if (isLoading) {
    return (
      <section className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-white/[0.05]" />

        <div className="mt-5 space-y-3">
          <div className="h-28 animate-pulse rounded-2xl bg-white/[0.025]" />
          <div className="h-28 animate-pulse rounded-2xl bg-white/[0.025]" />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
        {/* HEADER */}

        <div className="border-b border-white/[0.07] p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07] text-indigo-200/70">
                  <MessageCircleMore
                    size={17}
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">
                    Contact activity
                  </h2>

                  <p className="mt-1 text-xs text-white/35">
                    Calls, messages,
                    meetings and
                    follow-ups
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isFetching ? (
                <span className="text-xs text-white/30">
                  Refreshing...
                </span>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  refetch()
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-medium text-white/55 transition hover:bg-white/[0.07] hover:text-white"
              >
                <RefreshCcw
                  size={15}
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionError("");
                  setIsLogOpen(
                    true
                  );
                }}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/15 px-4 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/25"
              >
                <Plus
                  size={16}
                />

                Log contact
              </button>
            </div>
          </div>

          {/* METRICS */}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Activities"
              value={
                stats.total
              }
            />

            <MetricCard
              label="Pending"
              value={
                stats.pending
              }
            />

            <MetricCard
              label="Completed"
              value={
                stats.completed
              }
            />
          </div>
        </div>

        {/* ERROR */}

        {actionError ? (
          <div className="mx-5 mt-5 rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-200 md:mx-6">
            {actionError}
          </div>
        ) : null}

        {isError ? (
          <div className="p-5 md:p-6">
            <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] p-5">
              <p className="text-sm font-medium text-rose-100">
                Contact history
                could not be loaded.
              </p>

              <p className="mt-2 text-sm text-rose-200/60">
                {error?.response
                  ?.data?.message ||
                  error?.message ||
                  "Unable to load contact activities."}
              </p>

              <button
                type="button"
                onClick={() =>
                  refetch()
                }
                className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Try again
              </button>
            </div>
          </div>
        ) : null}

        {/* TIMELINE */}

        {!isError ? (
          <div className="p-5 md:p-6">
            {activities.length >
            0 ? (
              <div className="space-y-4">
                {activities.map(
                  (
                    activity
                  ) => (
                    <ActivityCard
                      key={
                        activity._id
                      }
                      activity={
                        activity
                      }
                      disabled={
                        isActionPending
                      }
                      onComplete={
                        handleComplete
                      }
                      onCancel={
                        handleCancel
                      }
                      onDelete={
                        handleDelete
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyTimeline
                onCreate={() => {
                  setActionError(
                    ""
                  );
                  setIsLogOpen(
                    true
                  );
                }}
              />
            )}
          </div>
        ) : null}
      </section>

      <LogLeadActivityModal
        key={
          isLogOpen
            ? "open"
            : "closed"
        }
        isOpen={isLogOpen}
        onClose={() =>
          setIsLogOpen(false)
        }
        onSubmit={
          handleCreate
        }
        isPending={
          createMutation
            .isPending
        }
        serverError={
          actionError
        }
      />
    </>
  );
};

const ActivityCard = ({
  activity,
  disabled,
  onComplete,
  onCancel,
  onDelete,
}) => {
  const Icon =
    activityIcons[
      activity.type
    ] || MoreHorizontal;

  const isPending =
    activity.followUpStatus ===
    "pending";

  return (
    <article className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-black/10 p-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-indigo-400/0 via-indigo-400/35 to-indigo-400/0" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/55">
              <Icon
                size={16}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {activityLabels[
                    activity.type
                  ] ||
                    activity.type}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/40">
                  {directionLabels[
                    activity
                      .direction
                  ] ||
                    activity
                      .direction}
                </span>

                <OutcomeBadge
                  outcome={
                    activity.outcome
                  }
                />

                {activity.followUpRequired ? (
                  <FollowUpBadge
                    status={
                      activity.followUpStatus
                    }
                  />
                ) : null}
              </div>

              <p className="mt-2 text-xs text-white/30">
                {formatDateTime(
                  activity.contactedAt
                )}

                {Number(
                  activity.durationMinutes
                ) > 0
                  ? ` • ${activity.durationMinutes} min`
                  : ""}
              </p>
            </div>
          </div>

          {activity.subject ? (
            <h3 className="mt-4 text-sm font-semibold text-white/80">
              {activity.subject}
            </h3>
          ) : null}

          {activity.summary ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/50">
              {activity.summary}
            </p>
          ) : null}

          {activity.notes ? (
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
                Internal notes
              </p>

              <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-white/45">
                {activity.notes}
              </p>
            </div>
          ) : null}

          {activity.followUpRequired ? (
            <div className="mt-4 rounded-2xl border border-amber-400/10 bg-amber-400/[0.035] p-4">
              <div className="flex items-center gap-2 text-amber-200/70">
                <CalendarClock
                  size={14}
                />

                <span className="text-[10px] font-semibold uppercase tracking-[0.13em]">
                  Follow-up
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Scheduled"
                  value={formatDateTime(
                    activity.nextFollowUpAt
                  )}
                />

                <InfoItem
                  label="Status"
                  value={
                    followUpLabels[
                      activity.followUpStatus
                    ] ||
                    activity.followUpStatus
                  }
                />
              </div>

              {activity.followUpNote ? (
                <p className="mt-3 text-xs leading-5 text-white/45">
                  {
                    activity.followUpNote
                  }
                </p>
              ) : null}

              {activity.followUpCompletedAt ? (
                <p className="mt-3 text-[11px] text-emerald-200/55">
                  Completed{" "}
                  {formatDateTime(
                    activity.followUpCompletedAt
                  )}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {isPending ? (
            <>
              <button
                type="button"
                disabled={
                  disabled
                }
                onClick={() =>
                  onComplete(
                    activity._id
                  )
                }
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-3 text-xs font-medium text-emerald-200/80 transition hover:bg-emerald-400/[0.11] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check
                  size={14}
                />

                Complete
              </button>

              <button
                type="button"
                disabled={
                  disabled
                }
                onClick={() =>
                  onCancel(
                    activity._id
                  )
                }
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] px-3 text-xs font-medium text-amber-200/75 transition hover:bg-amber-400/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X
                  size={14}
                />

                Cancel
              </button>
            </>
          ) : null}

          <button
            type="button"
            disabled={
              disabled
            }
            onClick={() =>
              onDelete(
                activity._id
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-400/10 bg-rose-400/[0.035] text-rose-200/45 transition hover:bg-rose-400/[0.09] hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Delete activity"
          >
            <Trash2
              size={14}
            />
          </button>
        </div>
      </div>
    </article>
  );
};

const MetricCard = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-white/[0.07] bg-black/10 px-4 py-3">
    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
      {label}
    </p>

    <p className="mt-1 text-xl font-semibold text-white">
      {value}
    </p>
  </div>
);

const InfoItem = ({
  label,
  value,
}) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
      {label}
    </p>

    <p className="mt-1 text-xs font-medium text-white/55">
      {value}
    </p>
  </div>
);

const OutcomeBadge = ({
  outcome,
}) => {
  const classes = {
    connected:
      "border-sky-400/15 bg-sky-400/[0.06] text-sky-200/75",

    replied:
      "border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-200/75",

    interested:
      "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-200/80",

    follow_up_required:
      "border-amber-400/15 bg-amber-400/[0.06] text-amber-200/80",

    meeting_scheduled:
      "border-violet-400/15 bg-violet-400/[0.06] text-violet-200/80",

    proposal_requested:
      "border-indigo-400/15 bg-indigo-400/[0.06] text-indigo-200/80",

    quotation_requested:
      "border-indigo-400/15 bg-indigo-400/[0.06] text-indigo-200/80",

    won:
      "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-200",

    lost:
      "border-rose-400/20 bg-rose-400/[0.08] text-rose-200",

    not_interested:
      "border-rose-400/15 bg-rose-400/[0.05] text-rose-200/75",
  };

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        classes[outcome] ||
        "border-white/10 bg-white/[0.04] text-white/45"
      }`}
    >
      {outcomeLabels[
        outcome
      ] || outcome}
    </span>
  );
};

const FollowUpBadge = ({
  status,
}) => {
  const classes = {
    pending:
      "border-amber-400/15 bg-amber-400/[0.06] text-amber-200/80",

    completed:
      "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-200/80",

    cancelled:
      "border-white/10 bg-white/[0.04] text-white/40",

    not_required:
      "border-white/10 bg-white/[0.04] text-white/40",
  };

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        classes[status] ||
        classes.not_required
      }`}
    >
      {followUpLabels[
        status
      ] || status}
    </span>
  );
};

const EmptyTimeline = ({
  onCreate,
}) => (
  <div className="rounded-[22px] border border-dashed border-white/10 bg-black/10 px-6 py-12 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-white/35">
      <Clock3
        size={19}
      />
    </div>

    <h3 className="mt-4 text-sm font-semibold text-white">
      No contact activity yet
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
      Log the first call,
      WhatsApp message,
      email or meeting to
      begin building this
      prospect&apos;s sales
      history.
    </p>

    <button
      type="button"
      onClick={onCreate}
      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/15 px-4 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/25"
    >
      <Plus size={15} />
      Log first contact
    </button>
  </div>
);

export default LeadActivityWorkspace;