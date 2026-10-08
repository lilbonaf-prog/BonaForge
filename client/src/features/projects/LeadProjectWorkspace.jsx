import {
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Loader2,
  LockKeyhole,
  Plus,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import useLeadProject from "./useLeadProject";
import useCreateProject from "./useCreateProject";
import useLeadQuotations from "../quotations/useLeadQuotations";

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

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data
    ?.message ||
  error?.message ||
  fallback;

const LeadProjectWorkspace = ({
  lead,
}) => {
  const navigate =
    useNavigate();

  const leadId =
    lead?._id;

  const {
    data,
    isLoading,
  } = useLeadProject(
    leadId
  );

  const {
    data: quotationsData,
  } = useLeadQuotations(
    leadId
  );

  const createMutation =
    useCreateProject();

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const project =
    data?.project || null;

  const acceptedQuotation =
    useMemo(() => {
      const quotations =
        quotationsData?.quotations ||
        [];

      return (
        quotations.find(
          (quotation) =>
            quotation.status ===
            "accepted"
        ) || null
      );
    }, [
      quotationsData,
    ]);

  const isWon =
    lead?.status === "won";

  const createProject =
    async () => {
      if (
        !leadId ||
        !isWon ||
        createMutation.isPending
      ) {
        return;
      }

      setErrorMessage("");

      try {
        const result =
          await createMutation.mutateAsync(
            {
              leadId,

              payload: {
                name: `${
                  lead?.companyName ||
                  lead?.name ||
                  "Client"
                } Project`,

                quotation:
                  acceptedQuotation?._id ||
                  undefined,
              },
            }
          );

        const createdProject =
          result?.project;

        if (
          createdProject?._id
        ) {
          navigate(
            `/projects/${createdProject._id}`
          );
        }
      } catch (
        error
      ) {
        setErrorMessage(
          getErrorMessage(
            error,
            "Unable to create project."
          )
        );
      }
    };

  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban
              size={18}
              className="text-indigo-300"
            />

            <h2 className="text-base font-semibold text-white">
              Project
            </h2>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/30">
            Convert this won
            lead into active
            client delivery work.
          </p>
        </div>

        {project?._id ? (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/projects/${project._id}`
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
          >
            Open project

            <ArrowRight
              size={15}
            />
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-black/10 p-4 text-sm text-white/35">
          <Loader2
            size={16}
            className="animate-spin"
          />

          Loading project...
        </div>
      ) : null}

      {!isLoading &&
      project ? (
        <div className="mt-5 rounded-2xl border border-indigo-400/15 bg-indigo-400/[0.04] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-200">
                  {project.status
                    ?.replace(
                      "_",
                      " "
                    ) ||
                    "planned"}
                </span>

                <span className="text-xs text-white/25">
                  {
                    project.projectNumber
                  }
                </span>
              </div>

              <h3 className="mt-3 text-base font-semibold text-white">
                {project.name}
              </h3>

              <p className="mt-1 text-sm text-white/35">
                {formatCurrency(
                  project.projectValue,
                  project.currency
                )}
              </p>
            </div>

            <div className="min-w-[180px]">
              <div className="flex items-center justify-between text-xs text-white/30">
                <span>
                  Progress
                </span>

                <span>
                  {project.progress ||
                    0}
                  %
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-indigo-400/70"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        Number(
                          project.progress
                        ) || 0,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!isLoading &&
      !project &&
      !isWon ? (
        <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/[0.06] text-amber-200/70">
              <LockKeyhole
                size={16}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-100/80">
                Project creation
                is locked
              </p>

              <p className="mt-1 text-sm leading-6 text-white/35">
                Mark this lead
                as{" "}
                <span className="font-semibold text-emerald-200">
                  Won
                </span>{" "}
                first. Projects
                should only be
                created after the
                client has been
                successfully
                converted.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!isLoading &&
      !project &&
      isWon ? (
        <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-200/80">
                <CheckCircle2
                  size={16}
                />

                <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                  Lead won
                </span>
              </div>

              <p className="mt-2 text-sm text-white/45">
                This client is
                ready to move into
                project delivery.
              </p>

              {acceptedQuotation ? (
                <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/10 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                    Accepted
                    quotation
                  </p>

                  <p className="mt-1 text-sm font-medium text-white/60">
                    {acceptedQuotation.quotationNumber ||
                      acceptedQuotation.title ||
                      "Accepted quotation"}
                  </p>

                  <p className="mt-0.5 text-xs text-white/30">
                    {formatCurrency(
                      acceptedQuotation.total,
                      acceptedQuotation.currency
                    )}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-white/25">
                  No accepted
                  quotation is
                  linked. The
                  project will use
                  the lead value.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={
                createProject
              }
              disabled={
                createMutation.isPending
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-400/25 bg-indigo-400/15 px-4 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50"
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

              Create project
            </button>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-100/80">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
};

export default LeadProjectWorkspace;