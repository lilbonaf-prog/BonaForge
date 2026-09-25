import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";

function DeleteBusinessModal({
  isOpen,
  onClose,
  onConfirm,
  business,
  isPending = false,
  serverError = "",
}) {
  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (isPending) {
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-business-title"
    >
      <button
        type="button"
        aria-label="Close delete confirmation"
        onClick={handleClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-red-400/15 bg-[#0b0f16] shadow-2xl shadow-black/50">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-primary)] px-5 py-5 sm:px-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.07] text-red-300">
              <AlertTriangle
                size={19}
              />
            </div>

            <div>
              <h2
                id="delete-business-title"
                className="text-lg font-semibold tracking-[-0.025em] text-white"
              >
                Delete business
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                This action cannot be
                undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-primary)] text-[var(--text-muted)] transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}

        <div className="px-5 py-6 sm:px-6">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            You are about to delete:
          </p>

          <div className="mt-4 rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-4">
            <p className="break-words text-sm font-semibold text-white">
              {business?.name ||
                "This business"}
            </p>

            {business?.industry && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {
                  business.industry
                }
              </p>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">
            The saved business record
            will be permanently
            removed from BonaForge.
          </p>

          {serverError && (
            <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-xs text-red-200">
              {serverError}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-primary)] bg-[#0b0f16]/95 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="h-11 rounded-xl border border-[var(--border-primary)] px-5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2
              size={15}
            />

            {isPending
              ? "Deleting..."
              : "Delete business"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteBusinessModal;