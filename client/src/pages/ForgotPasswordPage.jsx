import { Link } from "react-router-dom";
import {
  useMutation,
} from "@tanstack/react-query";
import {
  useForm,
} from "react-hook-form";
import {
  zodResolver,
} from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Mail,
} from "lucide-react";

import {
  forgotPassword,
} from "../services/authService";

const forgotPasswordSchema =
  z.object({
    email: z
      .string()
      .trim()
      .min(
        1,
        "Email is required"
      )
      .email(
        "Enter a valid email address"
      ),
  });

function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm({
    resolver: zodResolver(
      forgotPasswordSchema
    ),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation =
    useMutation({
      mutationFn:
        forgotPassword,
    });

  const onSubmit = (values) => {
    forgotPasswordMutation.mutate(
      values
    );
  };

  const apiError =
    forgotPasswordMutation.error
      ?.response?.data?.message ||
    (forgotPasswordMutation.isError
      ? "Unable to process your request. Please try again."
      : "");

  const successMessage =
    forgotPasswordMutation.data
      ?.message;

  return (
    <div className="w-full">
      <Link
        to="/login"
        className="mb-8 inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>

      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <KeyRound
            size={13}
            className="text-[var(--brand-accent)]"
          />

          Account recovery
        </div>

        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-[2.15rem]">
          Reset your password
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          Enter the email connected to
          your BonaForge account. If the
          account exists, password reset
          instructions will be prepared.
        </p>
      </div>

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
          className="mb-5 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200"
        >
          {apiError}
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{
            opacity: 0,
            y: -6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-5 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-sm leading-6 text-emerald-200"
        >
          {successMessage}
        </motion.div>
      )}

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
          >
            Email address
          </label>

          <div className="relative">
            <Mail
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register(
                "email"
              )}
              className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none transition duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]/60 focus:bg-white/[0.045] focus:ring-4 focus:ring-[var(--brand-primary)]/10"
            />
          </div>

          {errors.email && (
            <p className="mt-2 text-xs text-red-300">
              {
                errors.email
                  .message
              }
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            forgotPasswordMutation
              .isPending
          }
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {forgotPasswordMutation
            .isPending
            ? "Processing..."
            : "Continue"}

          {!forgotPasswordMutation
            .isPending && (
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          )}
        </button>
      </form>

      <div className="mt-7 rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-4">
        <p className="text-center text-xs leading-5 text-[var(--text-muted)]">
          For security, BonaForge gives
          the same response whether an
          email address exists in the
          system or not.
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;