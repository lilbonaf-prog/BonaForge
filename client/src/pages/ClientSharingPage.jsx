import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Unlink,
  WalletCards,
} from "lucide-react";

import {
  createProposalShareLink,
  getProposals,
  revokeProposalShareLink,
} from "../services/proposalService";

import {
  createQuotationShareLink,
  getQuotations,
  revokeQuotationShareLink,
} from "../services/quotationService";

import {
  createInvoiceShareLink,
  getInvoices,
  revokeInvoiceShareLink,
} from "../services/invoiceService";

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
  partially_paid:
    "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
};

const buildFullShareUrl = (
  path
) => {
  if (!path) {
    return "";
  }

  return `${window.location.origin}${path}`;
};

const getDocumentKey = (
  type,
  id
) => `${type}:${id}`;

function ClientSharingPage() {
  const queryClient =
    useQueryClient();

  const [
    activeType,
    setActiveType,
  ] = useState(
    "proposals"
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    generatedLinks,
    setGeneratedLinks,
  ] = useState({});

  const [
    copiedKey,
    setCopiedKey,
  ] = useState("");

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");

  // ==============================
  // PROPOSALS
  // ==============================

  const {
    data: proposalData,
    isLoading:
      proposalsLoading,
    isError:
      proposalsError,
    error:
      proposalError,
  } = useQuery({
    queryKey: [
      "proposals",
      "client-sharing",
    ],

    queryFn: () =>
      getProposals({
        limit: 100,
      }),
  });

  // ==============================
  // QUOTATIONS
  // ==============================

  const {
    data: quotationData,
    isLoading:
      quotationsLoading,
    isError:
      quotationsError,
    error:
      quotationError,
  } = useQuery({
    queryKey: [
      "quotations",
      "client-sharing",
    ],

    queryFn: () =>
      getQuotations({
        limit: 100,
      }),
  });

  // ==============================
  // INVOICES
  // ==============================

  const {
    data: invoiceData,
    isLoading:
      invoicesLoading,
    isError:
      invoicesError,
    error:
      invoiceError,
  } = useQuery({
    queryKey: [
      "invoices",
      "client-sharing",
    ],

    queryFn: () =>
      getInvoices({
        limit: 100,
      }),
  });

  // ==============================
  // FILTERED DOCUMENTS
  // ==============================

  const documents =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      const source =
        activeType ===
        "proposals"
          ? proposalData
              ?.proposals ||
            []
          : activeType ===
              "quotations"
            ? quotationData
                ?.quotations ||
              []
            : invoiceData
                ?.invoices ||
              [];

      if (
        !normalizedSearch
      ) {
        return source;
      }

      return source.filter(
        (document) => {
          const businessName =
            document.business
              ?.name || "";

          const leadName =
            document.lead
              ?.name || "";

          const companyName =
            document.lead
              ?.companyName || "";

          const number =
            activeType ===
            "proposals"
              ? document
                  .proposalNumber
              : activeType ===
                  "quotations"
                ? document
                    .quotationNumber
                : document
                    .invoiceNumber;

          const haystack = [
            number,
            document.title,
            document.status,
            businessName,
            leadName,
            companyName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            normalizedSearch
          );
        }
      );
    }, [
      activeType,
      invoiceData?.invoices,
      proposalData?.proposals,
      quotationData
        ?.quotations,
      search,
    ]);

  // ==============================
  // PROPOSAL SHARE
  // ==============================

  const proposalShareMutation =
    useMutation({
      mutationFn:
        ({
          proposalId,
        }) =>
          createProposalShareLink({
            proposalId,
            expiresInDays: 30,
          }),

      onSuccess:
        (
          response,
          variables
        ) => {
          const key =
            getDocumentKey(
              "proposal",
              variables.proposalId
            );

          const fullUrl =
            buildFullShareUrl(
              response?.share
                ?.path
            );

          setGeneratedLinks(
            (current) => ({
              ...current,

              [key]: {
                url: fullUrl,

                expiresAt:
                  response?.share
                    ?.expiresAt ||
                  null,
              },
            })
          );

          setActionMessage(
            "Secure proposal link created successfully."
          );

          queryClient.invalidateQueries({
            queryKey: [
              "proposals",
            ],
          });
        },

      onError:
        (
          mutationError
        ) => {
          setActionMessage(
            mutationError
              ?.response?.data
              ?.message ||
              "Unable to create the proposal share link."
          );
        },
    });

  // ==============================
  // PROPOSAL REVOKE
  // ==============================

  const proposalRevokeMutation =
    useMutation({
      mutationFn:
        revokeProposalShareLink,

      onSuccess:
        (
          _response,
          proposalId
        ) => {
          const key =
            getDocumentKey(
              "proposal",
              proposalId
            );

          setGeneratedLinks(
            (current) => {
              const next = {
                ...current,
              };

              delete next[
                key
              ];

              return next;
            }
          );

          setActionMessage(
            "Proposal client link revoked successfully."
          );

          queryClient.invalidateQueries({
            queryKey: [
              "proposals",
            ],
          });
        },

      onError:
        (
          mutationError
        ) => {
          setActionMessage(
            mutationError
              ?.response?.data
              ?.message ||
              "Unable to revoke the proposal share link."
          );
        },
    });

  // ==============================
  // QUOTATION SHARE
  // ==============================

  const quotationShareMutation =
    useMutation({
      mutationFn:
        ({
          quotationId,
        }) =>
          createQuotationShareLink({
            quotationId,
            expiresInDays: 30,
          }),

      onSuccess:
        (
          response,
          variables
        ) => {
          const key =
            getDocumentKey(
              "quotation",
              variables.quotationId
            );

          const fullUrl =
            buildFullShareUrl(
              response?.share
                ?.path
            );

          setGeneratedLinks(
            (current) => ({
              ...current,

              [key]: {
                url: fullUrl,

                expiresAt:
                  response?.share
                    ?.expiresAt ||
                  null,
              },
            })
          );

          setActionMessage(
            "Secure quotation link created successfully."
          );

          queryClient.invalidateQueries({
            queryKey: [
              "quotations",
            ],
          });
        },

      onError:
        (
          mutationError
        ) => {
          setActionMessage(
            mutationError
              ?.response?.data
              ?.message ||
              "Unable to create the quotation share link."
          );
        },
    });

  // ==============================
  // QUOTATION REVOKE
  // ==============================

  const quotationRevokeMutation =
    useMutation({
      mutationFn:
        revokeQuotationShareLink,

      onSuccess:
        (
          _response,
          quotationId
        ) => {
          const key =
            getDocumentKey(
              "quotation",
              quotationId
            );

          setGeneratedLinks(
            (current) => {
              const next = {
                ...current,
              };

              delete next[
                key
              ];

              return next;
            }
          );

          setActionMessage(
            "Quotation client link revoked successfully."
          );

          queryClient.invalidateQueries({
            queryKey: [
              "quotations",
            ],
          });
        },

      onError:
        (
          mutationError
        ) => {
          setActionMessage(
            mutationError
              ?.response?.data
              ?.message ||
              "Unable to revoke the quotation share link."
          );
        },
    });

  // ==============================
  // INVOICE SHARE
  // ==============================

  const invoiceShareMutation =
    useMutation({
      mutationFn:
        ({
          invoiceId,
        }) =>
          createInvoiceShareLink({
            invoiceId,
            expiresInDays: 30,
          }),

      onSuccess:
        (
          response,
          variables
        ) => {
          const key =
            getDocumentKey(
              "invoice",
              variables.invoiceId
            );

          const fullUrl =
            buildFullShareUrl(
              response?.share
                ?.path
            );

          setGeneratedLinks(
            (current) => ({
              ...current,

              [key]: {
                url: fullUrl,

                expiresAt:
                  response?.share
                    ?.expiresAt ||
                  null,
              },
            })
          );

          setActionMessage(
            "Secure invoice link created successfully."
          );

          queryClient.invalidateQueries({
            queryKey: [
              "invoices",
            ],
          });
        },

      onError:
        (
          mutationError
        ) => {
          setActionMessage(
            mutationError
              ?.response?.data
              ?.message ||
              "Unable to create the invoice share link."
          );
        },
    });

  // ==============================
  // INVOICE REVOKE
  // ==============================

  const invoiceRevokeMutation =
    useMutation({
      mutationFn:
        revokeInvoiceShareLink,

      onSuccess:
        (
          _response,
          invoiceId
        ) => {
          const key =
            getDocumentKey(
              "invoice",
              invoiceId
            );

          setGeneratedLinks(
            (current) => {
              const next = {
                ...current,
              };

              delete next[
                key
              ];

              return next;
            }
          );

          setActionMessage(
            "Invoice client link revoked successfully."
          );

          queryClient.invalidateQueries({
            queryKey: [
              "invoices",
            ],
          });
        },

      onError:
        (
          mutationError
        ) => {
          setActionMessage(
            mutationError
              ?.response?.data
              ?.message ||
              "Unable to revoke the invoice share link."
          );
        },
    });

  // ==============================
  // COPY LINK
  // ==============================

  const handleCopy =
    async (
      key,
      url
    ) => {
      if (!url) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          url
        );

        setCopiedKey(
          key
        );

        setActionMessage(
          "Client link copied to clipboard."
        );

        window.setTimeout(
          () => {
            setCopiedKey(
              ""
            );
          },
          1800
        );
      } catch {
        setActionMessage(
          "Could not copy automatically. Please select and copy the link manually."
        );
      }
    };

  // ==============================
  // CURRENT VIEW STATE
  // ==============================

  const isProposalView =
    activeType ===
    "proposals";

  const isQuotationView =
    activeType ===
    "quotations";

  const isLoading =
    isProposalView
      ? proposalsLoading
      : isQuotationView
        ? quotationsLoading
        : invoicesLoading;

  const isError =
    isProposalView
      ? proposalsError
      : isQuotationView
        ? quotationsError
        : invoicesError;

  const currentError =
    isProposalView
      ? proposalError
      : isQuotationView
        ? quotationError
        : invoiceError;

  const documentLabel =
    isProposalView
      ? "proposal"
      : isQuotationView
        ? "quotation"
        : "invoice";

  const DocumentIcon =
    isProposalView
      ? FileText
      : isQuotationView
        ? ReceiptText
        : WalletCards;

  return (
    <div className="space-y-6">
      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}

      <section className="rounded-[26px] border border-[var(--border-primary)] bg-white/[0.025] p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5 text-xs font-medium text-emerald-200">
              <ShieldCheck
                size={13}
              />

              Secure client access
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
              Client Sharing
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
              Generate secure,
              read-only proposal,
              quotation and invoice
              links without giving
              clients access to your
              private BonaForge
              workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border-primary)] bg-black/10 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Security
            </p>

            <p className="mt-2 text-sm font-medium text-white">
              30-day secure links
            </p>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Regenerate or revoke
              access at any time.
            </p>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* MESSAGE */}
      {/* ============================== */}

      {actionMessage ? (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-indigo-400/15 bg-indigo-400/[0.045] px-4 py-3">
          <p className="text-sm text-indigo-100">
            {
              actionMessage
            }
          </p>

          <button
            type="button"
            onClick={() =>
              setActionMessage(
                ""
              )
            }
            className="shrink-0 text-xs text-indigo-200/60 transition hover:text-indigo-100"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* ============================== */}
      {/* DOCUMENT TYPE TABS */}
      {/* ============================== */}

      <section className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.02] p-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveType(
                "proposals"
              );

              setSearch("");

              setActionMessage(
                ""
              );
            }}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
              activeType ===
              "proposals"
                ? "border border-indigo-400/20 bg-indigo-400/[0.09] text-indigo-100"
                : "border border-transparent text-[var(--text-muted)] hover:bg-white/[0.035] hover:text-white"
            }`}
          >
            <FileText
              size={16}
            />

            <span className="hidden sm:inline">
              Proposals
            </span>

            <span className="sm:hidden">
              Proposal
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveType(
                "quotations"
              );

              setSearch("");

              setActionMessage(
                ""
              );
            }}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
              activeType ===
              "quotations"
                ? "border border-indigo-400/20 bg-indigo-400/[0.09] text-indigo-100"
                : "border border-transparent text-[var(--text-muted)] hover:bg-white/[0.035] hover:text-white"
            }`}
          >
            <ReceiptText
              size={16}
            />

            <span className="hidden sm:inline">
              Quotations
            </span>

            <span className="sm:hidden">
              Quote
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveType(
                "invoices"
              );

              setSearch("");

              setActionMessage(
                ""
              );
            }}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
              activeType ===
              "invoices"
                ? "border border-indigo-400/20 bg-indigo-400/[0.09] text-indigo-100"
                : "border border-transparent text-[var(--text-muted)] hover:bg-white/[0.035] hover:text-white"
            }`}
          >
            <WalletCards
              size={16}
            />

            <span className="hidden sm:inline">
              Invoices
            </span>

            <span className="sm:hidden">
              Invoice
            </span>
          </button>
        </div>
      </section>

      {/* ============================== */}
      {/* SEARCH */}
      {/* ============================== */}

      <section className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.02] p-4">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />

          <input
            type="text"
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder={`Search ${activeType}, businesses or clients...`}
            className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-black/10 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400/30"
          />
        </div>
      </section>

      {/* ============================== */}
      {/* LOADING */}
      {/* ============================== */}

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[var(--border-primary)] bg-white/[0.02]">
          <div className="text-center">
            <Loader2
              size={26}
              className="mx-auto animate-spin text-indigo-300"
            />

            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Loading{" "}
              {activeType}
              ...
            </p>
          </div>
        </div>
      ) : null}

      {/* ============================== */}
      {/* ERROR */}
      {/* ============================== */}

      {isError ? (
        <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-6">
          <p className="text-sm font-medium text-red-200">
            Unable to load{" "}
            {activeType}.
          </p>

          <p className="mt-2 text-xs text-red-200/60">
            {currentError
              ?.response?.data
              ?.message ||
              "Please try again."}
          </p>
        </div>
      ) : null}

      {/* ============================== */}
      {/* DOCUMENT LIST */}
      {/* ============================== */}

      {!isLoading &&
      !isError ? (
        <section className="space-y-4">
          {documents.map(
            (document) => {
              const isProposal =
                activeType ===
                "proposals";

              const isQuotation =
                activeType ===
                "quotations";

              const type =
                isProposal
                  ? "proposal"
                  : isQuotation
                    ? "quotation"
                    : "invoice";

              const id =
                document._id;

              const key =
                getDocumentKey(
                  type,
                  id
                );

              const number =
                isProposal
                  ? document
                      .proposalNumber
                  : isQuotation
                    ? document
                        .quotationNumber
                    : document
                        .invoiceNumber;

              const generated =
                generatedLinks[
                  key
                ];

              const sharingEnabled =
                Boolean(
                  document
                    .shareAccess
                    ?.enabled
                );

              const clientName =
                document.business
                  ?.name ||
                document.lead
                  ?.companyName ||
                document.lead
                  ?.name ||
                "Client";

              const isCreating =
                isProposal
                  ? proposalShareMutation
                      .isPending &&
                    proposalShareMutation
                      .variables
                      ?.proposalId ===
                      id
                  : isQuotation
                    ? quotationShareMutation
                        .isPending &&
                      quotationShareMutation
                        .variables
                        ?.quotationId ===
                        id
                    : invoiceShareMutation
                        .isPending &&
                      invoiceShareMutation
                        .variables
                        ?.invoiceId ===
                        id;

              const isRevoking =
                isProposal
                  ? proposalRevokeMutation
                      .isPending &&
                    proposalRevokeMutation
                      .variables ===
                      id
                  : isQuotation
                    ? quotationRevokeMutation
                        .isPending &&
                      quotationRevokeMutation
                        .variables ===
                        id
                    : invoiceRevokeMutation
                        .isPending &&
                      invoiceRevokeMutation
                        .variables ===
                        id;

              const handleCreate =
                () => {
                  setActionMessage(
                    ""
                  );

                  if (
                    isProposal
                  ) {
                    proposalShareMutation.mutate(
                      {
                        proposalId:
                          id,
                      }
                    );

                    return;
                  }

                  if (
                    isQuotation
                  ) {
                    quotationShareMutation.mutate(
                      {
                        quotationId:
                          id,
                      }
                    );

                    return;
                  }

                  invoiceShareMutation.mutate(
                    {
                      invoiceId:
                        id,
                    }
                  );
                };

              const handleRevoke =
                () => {
                  setActionMessage(
                    ""
                  );

                  if (
                    isProposal
                  ) {
                    proposalRevokeMutation.mutate(
                      id
                    );

                    return;
                  }

                  if (
                    isQuotation
                  ) {
                    quotationRevokeMutation.mutate(
                      id
                    );

                    return;
                  }

                  invoiceRevokeMutation.mutate(
                    id
                  );
                };

              const CardIcon =
                isProposal
                  ? FileText
                  : isQuotation
                    ? ReceiptText
                    : WalletCards;

              return (
                <article
                  key={
                    key
                  }
                  className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                          <CardIcon
                            size={11}
                          />

                          {number}
                        </span>

                        <span className="rounded-full border border-indigo-400/15 bg-indigo-400/[0.05] px-2.5 py-1 text-[11px] font-semibold text-indigo-200">
                          {statusLabels[
                            document.status
                          ] ||
                            document.status}
                        </span>

                        {sharingEnabled ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                            <Link2
                              size={11}
                            />

                            Sharing active
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-3 truncate text-base font-semibold text-white sm:text-lg">
                        {
                          document.title
                        }
                      </h2>

                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {
                          clientName
                        }
                      </p>

                      {sharingEnabled ? (
                        <p className="mt-3 text-xs text-[var(--text-muted)]">
                          Expires{" "}
                          {formatDate(
                            document
                              .shareAccess
                              ?.expiresAt
                          )}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {document.status ===
                      "draft" ? (
                        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2 text-xs text-amber-200">
                          Send the{" "}
                          {
                            documentLabel
                          }{" "}
                          before sharing.
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={
                            isCreating
                          }
                          onClick={
                            handleCreate
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/[0.08] px-4 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-400/[0.13] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isCreating ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : sharingEnabled ? (
                            <RefreshCw
                              size={14}
                            />
                          ) : (
                            <Link2
                              size={14}
                            />
                          )}

                          {sharingEnabled
                            ? "Regenerate link"
                            : "Create link"}
                        </button>
                      )}

                      {sharingEnabled ? (
                        <button
                          type="button"
                          disabled={
                            isRevoking
                          }
                          onClick={
                            handleRevoke
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.045] px-4 text-xs font-semibold text-red-200 transition hover:bg-red-400/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRevoking ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Unlink
                              size={14}
                            />
                          )}

                          Revoke
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* ============================== */}
                  {/* NEWLY GENERATED LINK */}
                  {/* ============================== */}

                  {generated?.url ? (
                    <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          size={14}
                          className="text-emerald-300"
                        />

                        <p className="text-xs font-semibold text-emerald-200">
                          Secure link ready
                        </p>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                        Copy this link now.
                        BonaForge stores only
                        the secure token hash,
                        so the complete link
                        cannot be recovered
                        later.
                      </p>

                      <div className="mt-3 flex flex-col gap-2 lg:flex-row">
                        <input
                          readOnly
                          value={
                            generated.url
                          }
                          className="h-10 min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-black/15 px-3 text-xs text-[var(--text-secondary)] outline-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              key,
                              generated.url
                            )
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/90"
                        >
                          {copiedKey ===
                          key ? (
                            <Check
                              size={14}
                            />
                          ) : (
                            <Copy
                              size={14}
                            />
                          )}

                          {copiedKey ===
                          key
                            ? "Copied"
                            : "Copy link"}
                        </button>

                        <a
                          href={
                            generated.url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 text-xs font-semibold text-white transition hover:bg-white/[0.07]"
                        >
                          <ExternalLink
                            size={14}
                          />

                          Preview
                        </a>
                      </div>
                    </div>
                  ) : sharingEnabled ? (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <CardIcon
                        size={16}
                        className="mt-0.5 shrink-0 text-[var(--text-muted)]"
                      />

                      <p className="text-xs leading-5 text-[var(--text-muted)]">
                        A secure link is
                        currently active,
                        but the original
                        full token is not
                        stored. Choose
                        <span className="font-semibold text-[var(--text-secondary)]">
                          {" "}
                          Regenerate link{" "}
                        </span>
                        to create a new
                        link you can copy.
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            }
          )}

          {/* ============================== */}
          {/* EMPTY STATE */}
          {/* ============================== */}

          {documents.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-primary)] bg-white/[0.015] p-10 text-center">
              <DocumentIcon
                size={24}
                className="mx-auto text-[var(--text-muted)]"
              />

              <p className="mt-3 text-sm font-medium text-white">
                No{" "}
                {activeType}{" "}
                found
              </p>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Try a different
                search.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export default ClientSharingPage;