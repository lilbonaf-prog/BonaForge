import {
  FileText,
  Loader2,
  Plus,
  ReceiptText,
  ChevronRight,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import useProjectInvoices from "./useProjectInvoices";
import useCreateInvoice from "./useCreateInvoice";

const formatCurrency = (
  amount,
  currency = "GHS"
) => {
  try {
    return new Intl.NumberFormat(
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
  } catch {
    return `${currency || "GHS"} ${(
      Number(amount) || 0
    ).toLocaleString()}`;
  }
};

const statusClasses = {
  draft:
    "border-white/10 bg-white/[0.04] text-white/50",

  sent:
    "border-sky-400/20 bg-sky-400/10 text-sky-200",

  partially_paid:
    "border-amber-400/20 bg-amber-400/10 text-amber-200",

  paid:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",

  overdue:
    "border-rose-400/20 bg-rose-400/10 text-rose-200",

  cancelled:
    "border-white/10 bg-white/[0.03] text-white/35",
};

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  partially_paid:
    "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data
    ?.message ||
  error?.message ||
  fallback;

const ProjectInvoiceWorkspace = ({
  project,
}) => {
  const navigate =
    useNavigate();

  const projectId =
    project?._id;

  const {
    data,
    isLoading,
    isError,
    error,
  } = useProjectInvoices(
    projectId
  );

  const createMutation =
    useCreateInvoice();

  const invoices =
    data?.invoices || [];

  const createInvoice =
    async () => {
      if (
        !projectId ||
        createMutation.isPending
      ) {
        return;
      }

      try {
        const result =
          await createMutation.mutateAsync(
            {
              projectId,

              payload: {
                title: `${project.name} Invoice`,
              },
            }
          );

        const invoice =
          result?.invoice;

        if (
          invoice?._id
        ) {
          navigate(
            `/invoices/${invoice._id}`
          );
        }
      } catch {
        // Error is displayed
        // from mutation state below.
      }
    };

  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText
              size={18}
              className="text-indigo-300"
            />

            <h2 className="text-base font-semibold text-white">
              Invoices
            </h2>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/30">
            Create and track
            invoices for this
            client project.
          </p>
        </div>

        <button
          type="button"
          onClick={
            createInvoice
          }
          disabled={
            createMutation.isPending ||
            project?.status ===
              "cancelled"
          }
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-400/25 bg-indigo-400/15 px-4 py-2.5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {createMutation.isPending ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Plus
              size={16}
            />
          )}

          Create invoice
        </button>
      </div>

      {project?.status ===
      "cancelled" ? (
        <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3 text-sm text-amber-100/70">
          Reopen the project
          before creating a new
          invoice.
        </div>
      ) : null}

      {createMutation.isError ? (
        <div className="mt-4 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-100/80">
          {getErrorMessage(
            createMutation.error,
            "Unable to create invoice."
          )}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-black/10 p-4 text-sm text-white/35">
          <Loader2
            size={16}
            className="animate-spin"
          />

          Loading invoices...
        </div>
      ) : null}

      {isError ? (
        <div className="mt-5 rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-100/70">
          {getErrorMessage(
            error,
            "Unable to load project invoices."
          )}
        </div>
      ) : null}

      {!isLoading &&
      !isError &&
      invoices.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/10 px-5 py-8 text-center">
          <FileText
            size={25}
            className="mx-auto text-white/15"
          />

          <p className="mt-3 text-sm font-medium text-white/45">
            No invoices yet
          </p>

          <p className="mt-1 text-xs text-white/25">
            Create the first
            invoice for this
            project.
          </p>
        </div>
      ) : null}

      {!isLoading &&
      !isError &&
      invoices.length > 0 ? (
        <div className="mt-5 space-y-3">
          {invoices.map(
            (invoice) => {
              const status =
                invoice.status ||
                "draft";

              return (
                <button
                  key={
                    invoice._id
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      `/invoices/${invoice._id}`
                    )
                  }
                  className="group flex w-full flex-col gap-4 rounded-2xl border border-white/[0.07] bg-black/10 p-4 text-left transition hover:border-indigo-400/15 hover:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                          statusClasses[
                            status
                          ] ||
                          statusClasses.draft
                        }`}
                      >
                        {statusLabels[
                          status
                        ] || status}
                      </span>

                      <span className="text-xs text-white/25">
                        {
                          invoice.invoiceNumber
                        }
                      </span>
                    </div>

                    <p className="mt-2 truncate text-sm font-semibold text-white/70">
                      {
                        invoice.title
                      }
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/30">
                      <span>
                        Total:{" "}
                        {formatCurrency(
                          invoice.total,
                          invoice.currency
                        )}
                      </span>

                      <span>
                        Paid:{" "}
                        {formatCurrency(
                          invoice.amountPaid,
                          invoice.currency
                        )}
                      </span>

                      <span>
                        Balance:{" "}
                        {formatCurrency(
                          invoice.balanceDue,
                          invoice.currency
                        )}
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className="shrink-0 text-white/20 transition group-hover:text-indigo-200"
                  />
                </button>
              );
            }
          )}
        </div>
      ) : null}
    </section>
  );
};

export default ProjectInvoiceWorkspace;