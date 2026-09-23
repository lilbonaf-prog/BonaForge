import { useState } from "react";

import {
  Link,
  useNavigate,
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
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  WandSparkles,
} from "lucide-react";

import {
  register as registerAccount,
} from "../services/authService";

import {
  useAuth,
} from "../features/auth/authContext";

// ==============================
// VALIDATION
// ==============================

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must be at least 2 characters"
      )
      .max(
        60,
        "Name cannot exceed 60 characters"
      ),

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

    password: z
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
      values.password ===
      values.confirmPassword,
    {
      message:
        "Passwords do not match",
      path: [
        "confirmPassword",
      ],
    }
  );

const passwordChecks = [
  "Minimum 8 characters",
  "Use a password you do not reuse elsewhere",
];

function RegisterPage() {
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
      registerSchema
    ),

    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  // ==============================
  // REGISTER MUTATION
  // ==============================

  const registerMutation =
    useMutation({
      mutationFn:
        registerAccount,

      onSuccess: (data) => {
        saveSession(
          data.token,
          data.user
        );

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
    registerMutation.mutate(
      values
    );
  };

  const apiError =
    registerMutation.error
      ?.response?.data
      ?.message ||
    (registerMutation.isError
      ? "Unable to create your account. Please try again."
      : "");

  return (
    <div className="w-full">
      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}

      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <WandSparkles
            size={13}
            className="text-[var(--brand-accent)]"
          />

          Create your workspace
        </div>

        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-[2.15rem]">
          Start building your pipeline
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          Create your BonaForge account
          and turn opportunities into
          organized client work.
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
          className="mb-5 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200"
        >
          {apiError}
        </motion.div>
      )}

      {/* ============================== */}
      {/* REGISTER FORM */}
      {/* ============================== */}

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="space-y-5"
      >
        {/* NAME */}

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
          >
            Full name
          </label>

          <div className="relative">
            <UserRound
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />

            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              {...register(
                "name"
              )}
              className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none transition duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]/60 focus:bg-white/[0.045] focus:ring-4 focus:ring-[var(--brand-primary)]/10"
            />
          </div>

          {errors.name && (
            <p className="mt-2 text-xs text-red-300">
              {
                errors.name
                  .message
              }
            </p>
          )}
        </div>

        {/* EMAIL */}

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

        {/* PASSWORD */}

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
          >
            Password
          </label>

          <div className="relative">
            <LockKeyhole
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />

            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              placeholder="Create a secure password"
              {...register(
                "password"
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

          {errors.password && (
            <p className="mt-2 text-xs text-red-300">
              {
                errors.password
                  .message
              }
            </p>
          )}

          <div className="mt-3 space-y-1.5">
            {passwordChecks.map(
              (
                item,
                index
              ) => {
                const passed =
                  index === 0
                    ? password.length >=
                      8
                    : password.length >=
                      8;

                return (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-[11px]"
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        passed
                          ? "border-[var(--brand-accent)]/30 bg-[var(--brand-accent)]/10 text-[var(--brand-accent)]"
                          : "border-[var(--border-primary)] text-[var(--text-muted)]"
                      }`}
                    >
                      {passed && (
                        <Check
                          size={
                            10
                          }
                        />
                      )}
                    </span>

                    <span
                      className={
                        passed
                          ? "text-[var(--text-secondary)]"
                          : "text-[var(--text-muted)]"
                      }
                    >
                      {item}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* CONFIRM PASSWORD */}

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
          >
            Confirm password
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
              placeholder="Repeat your password"
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
            registerMutation
              .isPending
          }
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {registerMutation
            .isPending
            ? "Creating account..."
            : "Create account"}

          {!registerMutation
            .isPending && (
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          )}
        </button>
      </form>

      {/* ============================== */}
      {/* LOGIN LINK */}
      {/* ============================== */}

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--border-primary)]" />

        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Already registered
        </span>

        <div className="h-px flex-1 bg-[var(--border-primary)]" />
      </div>

      <div className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          Already have a BonaForge
          account?{" "}
          <Link
            to="/login"
            className="font-semibold text-white transition-colors hover:text-[var(--brand-secondary)]"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-7 text-center text-[11px] leading-5 text-[var(--text-muted)]">
        By creating an account, you
        agree to keep your BonaForge
        workspace credentials secure.
      </p>
    </div>
  );
}

export default RegisterPage;