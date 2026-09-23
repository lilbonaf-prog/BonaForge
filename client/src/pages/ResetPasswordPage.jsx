import { useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  useForm,
  useWatch,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import { z } from "zod";

import { motion } from "motion/react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  resetPassword,
} from "../services/authService";

import {
  useAuth,
} from "../features/auth/authContext";

// ==============================
// VALIDATION
// ==============================

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters"
      ),

    confirmPassword: z
      .string()
      .min(
        1,
        "Please confirm your password"
      ),
  })
  .refine(
    (values) =>
      values.newPassword ===
      values.confirmPassword,
    {
      message:
        "Passwords do not match",
      path: [
        "confirmPassword",
      ],
    }
  );

function ResetPasswordPage() {
  const { token } =
    useParams();

  const navigate =
    useNavigate();

  const {
    saveSession,
  } = useAuth();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  // ==============================
  // FORM
  // ==============================

  const {
    register,
    handleSubmit,
    control,
    formState: {
      errors,
    },
  } = useForm({
    resolver: zodResolver(
      resetPasswordSchema
    ),

    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({
    control,
    name: "newPassword",
    defaultValue: "",
  });

  // ==============================
  // RESET PASSWORD MUTATION
  // ==============================

  const resetMutation =
    useMutation({
      mutationFn: (payload) =>
        resetPassword(
          token,
          payload
        ),

      onSuccess: (data) => {
        if (data.token) {
          saveSession(
            data.token
          );
        }

        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );
      },
    });

  const onSubmit = (
    values
  ) => {
    resetMutation.mutate(
      values
    );
  };

  const apiError =
    resetMutation.error
      ?.response?.data
      ?.message ||
    (resetMutation.isError
      ? "Unable to reset your password. The link may be invalid or expired."
      : "");

  return (
    <div className="w-full">
      {/* ============================== */}
      {/* BACK LINK */}
      {/* ============================== */}

      <Link
        to="/login"
        className="mb-8 inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-white"
      >
        <ArrowLeft
          size={14}
        />

        Back to sign in
      </Link>

      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}

      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <ShieldCheck
            size={13}
            className="text-[var(--brand-accent)]"
          />

          Secure password reset
        </div>

        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-[2.15rem]">
          Create a new password
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          Choose a secure password for
          your BonaForge account.
        </p>
      </div>

      {/* ============================== */}
      {/* API ERROR */}
      {/* ============================== */}

      {apiError && (
        <motion.div
          initial={{
            opacity: 0,
            y: -6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-5 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm leading-6 text-red-200"
        >
          {apiError}
        </motion.div>
      )}

      {/* ============================== */}
      {/* RESET PASSWORD FORM */}
      {/* ============================== */}

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="space-y-5"
      >
        {/* NEW PASSWORD */}

        <div>
          <label
            htmlFor="newPassword"
            className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
          >
            New password
          </label>

          <div className="relative">
            <LockKeyhole
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />

            <input
              id="newPassword"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              placeholder="Enter new password"
              {...register(
                "newPassword"
              )}
              className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-12 text-sm text-white outline-none transition duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]/60 focus:bg-white/[0.045] focus:ring-4 focus:ring-[var(--brand-primary)]/10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) =>
                    !current
                )
              }
              className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-[var(--text-muted)] transition-colors hover:text-white"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff
                  size={17}
                />
              ) : (
                <Eye
                  size={17}
                />
              )}
            </button>
          </div>

          {errors.newPassword && (
            <p className="mt-2 text-xs text-red-300">
              {
                errors
                  .newPassword
                  .message
              }
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                password.length >= 8
                  ? "border-[var(--brand-accent)]/30 bg-[var(--brand-accent)]/10 text-[var(--brand-accent)]"
                  : "border-[var(--border-primary)] text-[var(--text-muted)]"
              }`}
            >
              {password.length >=
                8 && (
                <Check
                  size={10}
                />
              )}
            </span>

            <span
              className={
                password.length >=
                8
                  ? "text-[var(--text-secondary)]"
                  : "text-[var(--text-muted)]"
              }
            >
              Minimum 8 characters
            </span>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
          >
            Confirm new password
          </label>

          <div className="relative">
            <LockKeyhole
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />

            <input
              id="confirmPassword"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              placeholder="Repeat new password"
              {...register(
                "confirmPassword"
              )}
              className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none transition duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]/60 focus:bg-white/[0.045] focus:ring-4 focus:ring-[var(--brand-primary)]/10"
            />
          </div>

          {errors.confirmPassword && (
            <p className="mt-2 text-xs text-red-300">
              {
                errors
                  .confirmPassword
                  .message
              }
            </p>
          )}
        </div>

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={
            resetMutation
              .isPending
          }
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetMutation
            .isPending
            ? "Resetting password..."
            : "Reset password"}

          {!resetMutation
            .isPending && (
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          )}
        </button>
      </form>

      {/* ============================== */}
      {/* SECURITY NOTE */}
      {/* ============================== */}

      <div className="mt-7 rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-4">
        <p className="text-center text-xs leading-5 text-[var(--text-muted)]">
          After your password changes,
          older authentication sessions
          are no longer valid.
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;