import {
  useState,
} from "react";

import {
  AlertCircle,
  ChevronRight,
  FilePlus2,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import useLeadQuotations from "./useLeadQuotations";
import useCreateQuotation from "./useCreateQuotation";

const statusClasses = {
  draft:
    "border-white/10 bg-white/[0.04] text-white/55",

  sent:
    "border-sky-400/20 bg-sky-400/10 text-sky-200",

  accepted:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",

  rejected:
    "border-rose-400/20 bg-rose-400/10 text-rose-200",

  expired:
    "border-amber-400/20 bg-amber-400/10 text-amber-200",
};

const formatCurrency = (
  amount,
  currency = "GHS"
) =>
  new Intl.NumberFormat(
    "en-GH",
    {
      style: "currency",
      currency:
        currency || "GHS",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(amount) || 0
  );

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data
    ?.message ||
  error?.message ||
  fallback;

const LeadQuotationWorkspace = ({
  leadId,
  lead,
}) => {
  const navigate =
    useNavigate();

  const [
    showCreate,
    setShowCreate,
  ] = useState(false);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
  } = useLeadQuotations(
    leadId
  );

  const createMutation =
    useCreateQuotation();

  const quotations =
    data?.quotations || [];

  const handleOpen = (
    quotationId
  ) => {
    if (!quotationId) {
      return;
    }

    navigate(
      `/quotations/${quotationId}`
    );
  };

  const startCreate = () => {
    setLocalError("");

    setTitle(
      lead?.name
        ? `${lead.name} Quotation`
        : "New Quotation"
    );

    setShowCreate(true);
  };

  const cancelCreate = () => {
    setShowCreate(false);
    setTitle("");
    setLocalError("");
  };

  const handleCreate =
    async () => {
      const cleanTitle =
        title.trim();

      if (!cleanTitle) {
        setLocalError(
          "Quotation title is required."
        );

        return;
      }

      if (!leadId) {
        setLocalError(
          "Lead information is missing."
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

        const quotationId =
          result?.quotation?._id;

        setShowCreate(false);
        setTitle("");

        if (quotationId) {
          navigate(
            `/quotations/${quotationId}`
          );
        }
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to create quotation."
          )
        );
      }
    };

  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText
              size={17}
              className="text-indigo-200"
            />

            <h2 className="text-base font-semibold text-white">
              Quotations
            </h2>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/30">
            Create and track
            pricing documents
            for this lead.
          </p>
        </div>

        {!showCreate ? (
          <button
            type="button"
            onClick={
              startCreate
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/10 px-4 py-2.5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-400/15"
          >
            <Plus size={16} />

            New quotation
          </button>
        ) : null}
      </div>

      {showCreate ? (
        <div className="mt-5 rounded-2xl border border-indigo-400/15 bg-indigo-400/[0.04] p-4">
          <div className="flex items-center gap-2">
            <FilePlus2
              size={17}
              className="text-indigo-200"
            />

            <p className="text-sm font-semibold text-white">
              Create quotation
            </p>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-white/35">
              Quotation title
            </label>

            <input
              value={title}
              onChange={(
                event
              ) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Quotation title"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-indigo-400/30 focus:ring-2 focus:ring-indigo-400/10"
            />
          </div>

          {localError ? (
            <div className="mt-3 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-3 py-2.5 text-sm text-rose-100">
              {localError}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                cancelCreate
              }
              disabled={
                createMutation.isPending
              }
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/[0.08] disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleCreate
              }
              disabled={
                createMutation.isPending
              }
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/15 px-4 py-2.5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-400/20 disabled:opacity-40"
            >
              {createMutation.isPending ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <FilePlus2
                  size={15}
                />
              )}

              Create quotation
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-5 text-sm text-white/35">
          <Loader2
            size={16}
            className="animate-spin"
          />

          Loading quotations...
        </div>
      ) : null}

      {isError ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 text-rose-300"
          />

          <div>
            <p className="text-sm font-semibold text-rose-100">
              Unable to load quotations
            </p>

            <p className="mt-1 text-xs leading-5 text-rose-100/55">
              {getErrorMessage(
                error,
                "Please try again."
              )}
            </p>
          </div>
        </div>
      ) : null}

      {!isLoading &&
      !isError &&
      quotations.length ===
        0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-8 text-center">
          <FileText
            size={25}
            className="mx-auto text-white/15"
          />

          <p className="mt-3 text-sm font-medium text-white/50">
            No quotations yet
          </p>

          <p className="mt-1 text-xs text-white/25">
            Create the first
            quotation for this
            lead.
          </p>
        </div>
      ) : null}

      {!isLoading &&
      !isError &&
      quotations.length >
        0 ? (
        <div className="mt-5 space-y-3">
          {quotations.map(
            (quotation) => (
              <button
                key={
                  quotation._id
                }
                type="button"
                onClick={() =>
                  handleOpen(
                    quotation._id
                  )
                }
                className="group flex w-full flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-left transition hover:border-indigo-400/15 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${
                        statusClasses[
                          quotation.status
                        ] ||
                        statusClasses.draft
                      }`}
                    >
                      {quotation.status}
                    </span>

                    <span className="text-[11px] text-white/25">
                      {
                        quotation.quotationNumber
                      }
                    </span>
                  </div>

                  <p className="mt-3 truncate text-sm font-semibold text-white/75">
                    {quotation.title}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {formatCurrency(
                      quotation.total,
                      quotation.currency
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-white/30 transition group-hover:text-indigo-200">
                  Open

                  <ChevronRight
                    size={14}
                  />
                </div>
              </button>
            )
          )}
        </div>
      ) : null}
    </section>
  );
};

export default LeadQuotationWorkspace;