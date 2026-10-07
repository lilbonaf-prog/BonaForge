import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarClock,
  Check,
  Clock3,
  RefreshCcw,
  TimerReset,
  X,
} from "lucide-react";

import useCancelLeadFollowUp from "../features/leadActivities/useCancelLeadFollowUp";
import useCompleteLeadFollowUp from "../features/leadActivities/useCompleteLeadFollowUp";
import useFollowUps from "../features/leadActivities/useFollowUps";

const viewOptions = [
  {
    value: "all",
    label: "All pending",
  },
  {
    value: "overdue",
    label: "Overdue",
  },
  {
    value: "today",
    label: "Due today",
  },
  {
    value: "upcoming",
    label: "Upcoming",
  },
];

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

const FollowUpsPage = () => {
  const [
    activeView,
    setActiveView,
  ] = useState("all");

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
  } = useFollowUps({
    view: activeView,
    page: 1,
    limit: 100,
  });

  const completeMutation =
    useCompleteLeadFollowUp();

  const cancelMutation =
    useCancelLeadFollowUp();

  const followUps =
    useMemo(
      () =>
        data?.followUps ||
        [],
      [data?.followUps]
    );

  const stats = {
    pending:
      data?.stats?.pending ??
      0,

    overdue:
      data?.stats?.overdue ??
      0,

    dueToday:
      data?.stats?.dueToday ??
      0,

    upcoming:
      data?.stats?.upcoming ??
      0,
  };

  const isActionPending =
    completeMutation.isPending ||
    cancelMutation.isPending;

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

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      {/* HERO */}

      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.13),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.09),transparent_32%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-amber-200/60">
              <CalendarClock
                size={14}
              />

              Sales follow-up
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Follow-Up workspace
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              Keep every prospect
              moving by tracking
              overdue, due-today and
              upcoming sales
              follow-ups.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            <RefreshCcw
              size={15}
            />

            {isFetching
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </section>

      {/* METRICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Pending"
          value={
            stats.pending
          }
          icon={CalendarClock}
        />

        <MetricCard
          label="Overdue"
          value={
            stats.overdue
          }
          icon={AlertCircle}
        />

        <MetricCard
          label="Due today"
          value={
            stats.dueToday
          }
          icon={Clock3}
        />

        <MetricCard
          label="Upcoming"
          value={
            stats.upcoming
          }
          icon={TimerReset}
        />
      </div>

      {/* FILTERS */}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap gap-2">
          {viewOptions.map(
            (option) => {
              const isActive =
                activeView ===
                option.value;

              return (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onClick={() =>
                    setActiveView(
                      option.value
                    )
                  }
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "border-indigo-400/20 bg-indigo-500/15 text-indigo-100"
                      : "border-white/10 bg-white/[0.025] text-white/45 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            }
          )}
        </div>
      </section>

      {actionError ? (
        <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-200">
          {actionError}
        </div>
      ) : null}

      {/* CONTENT */}

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={
            error?.response?.data
              ?.message ||
            error?.message ||
            "Unable to load follow-ups."
          }
          onRetry={() =>
            refetch()
          }
        />
      ) : followUps.length ===
        0 ? (
        <EmptyState
          activeView={
            activeView
          }
        />
      ) : (
        <div className="space-y-4">
          {followUps.map(
            (followUp) => (
              <FollowUpCard
                key={
                  followUp._id
                }
                followUp={
                  followUp
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
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  icon: Icon,
}) => (
  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/30">
          {label}
        </p>

        <p className="mt-2 text-3xl font-semibold text-white">
          {value}
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const FollowUpCard = ({
  followUp,
  disabled,
  onComplete,
  onCancel,
}) => {
  const lead =
    followUp.lead;

  return (
    <article className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-400/15 bg-amber-400/[0.06] px-2.5 py-1 text-[11px] font-semibold text-amber-200">
              Pending follow-up
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/45">
              {activityLabels[
                followUp.type
              ] ||
                followUp.type}
            </span>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-white">
            {lead?.name ||
              "Unknown lead"}
          </h2>

          <p className="mt-1 text-sm text-white/40">
            {lead?.companyName ||
              "Independent prospect"}
          </p>

          {followUp.subject ? (
            <p className="mt-4 text-sm font-medium text-white/70">
              {followUp.subject}
            </p>
          ) : null}

          {followUp.followUpNote ? (
            <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-white/45">
              {
                followUp.followUpNote
              }
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoItem
              label="Scheduled"
              value={formatDateTime(
                followUp.nextFollowUpAt
              )}
            />

            <InfoItem
              label="Preferred contact"
              value={
                lead?.preferredContactMethod ||
                "Not set"
              }
            />

            <InfoItem
              label="Lead status"
              value={
                lead?.status ||
                "Not set"
              }
            />

            <InfoItem
              label="Priority"
              value={
                lead?.priority ||
                "Not set"
              }
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={
              disabled
            }
            onClick={() =>
              onComplete(
                followUp._id
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 text-sm font-medium text-emerald-200/80 transition hover:bg-emerald-400/[0.11] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={15} />
            Complete
          </button>

          <button
            type="button"
            disabled={
              disabled
            }
            onClick={() =>
              onCancel(
                followUp._id
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] px-4 text-sm font-medium text-amber-200/75 transition hover:bg-amber-400/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={15} />
            Cancel
          </button>
        </div>
      </div>
    </article>
  );
};

const InfoItem = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-white/[0.07] bg-black/10 px-4 py-3">
    <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
      {label}
    </p>

    <p className="mt-1.5 break-words text-sm font-medium text-white/60">
      {value}
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(
      (item) => (
        <div
          key={item}
          className="h-44 animate-pulse rounded-[26px] border border-white/[0.07] bg-white/[0.025]"
        />
      )
    )}
  </div>
);

const ErrorState = ({
  message,
  onRetry,
}) => (
  <div className="rounded-[26px] border border-rose-400/15 bg-rose-400/[0.04] p-8 text-center">
    <AlertCircle
      size={24}
      className="mx-auto text-rose-200/60"
    />

    <h2 className="mt-4 text-lg font-semibold text-white">
      Follow-ups could not
      be loaded
    </h2>

    <p className="mx-auto mt-2 max-w-xl text-sm text-white/45">
      {message}
    </p>

    <button
      type="button"
      onClick={onRetry}
      className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.09] hover:text-white"
    >
      Try again
    </button>
  </div>
);

const EmptyState = ({
  activeView,
}) => (
  <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
    <CalendarClock
      size={25}
      className="mx-auto text-white/25"
    />

    <h2 className="mt-4 text-base font-semibold text-white">
      No follow-ups here
    </h2>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
      There are currently no{" "}
      {activeView === "all"
        ? "pending"
        : activeView}{" "}
      follow-ups. New scheduled
      follow-ups will appear here
      automatically.
    </p>
  </div>
);

export default FollowUpsPage;
