import {
  useRef,
  useState,
} from "react";

import {
  Link,
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
  BadgeCheck,
  Camera,
  Check,
  CircleAlert,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  changePassword,
  removeAvatar,
  resendVerification,
  updateAvatar,
  updateProfile,
} from "../services/authService";

import {
  useAuth,
} from "../features/auth/authContext";

// ==============================
// PROFILE VALIDATION
// ==============================

const profileSchema = z.object({
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
});

// ==============================
// PASSWORD VALIDATION
// ==============================

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(
        1,
        "Current password is required"
      ),

    newPassword: z
      .string()
      .min(
        8,
        "New password must be at least 8 characters"
      ),

    confirmPassword: z
      .string()
      .min(
        1,
        "Please confirm your new password"
      ),
  })
  .refine(
    (values) =>
      values.newPassword ===
      values.confirmPassword,
    {
      message:
        "New passwords do not match",
      path: [
        "confirmPassword",
      ],
    }
  );

function AccountPage() {
  const {
    user,
    refreshUser,
    saveSession,
  } = useAuth();

  const avatarInputRef =
    useRef(null);

  const [
    avatarError,
    setAvatarError,
  ] = useState("");

  const [
    avatarSuccess,
    setAvatarSuccess,
  ] = useState("");

  // ==============================
  // PROFILE FORM
  // ==============================

  const {
    register: registerProfile,
    handleSubmit:
      handleProfileSubmit,
    formState: {
      errors: profileErrors,
    },
  } = useForm({
    resolver: zodResolver(
      profileSchema
    ),

    values: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // ==============================
  // PASSWORD FORM
  // ==============================

  const {
    register: registerPassword,
    handleSubmit:
      handlePasswordSubmit,
    reset: resetPasswordForm,
    control: passwordControl,
    formState: {
      errors: passwordErrors,
    },
  } = useForm({
    resolver: zodResolver(
      passwordSchema
    ),

    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = useWatch({
    control: passwordControl,
    name: "newPassword",
    defaultValue: "",
  });

  // ==============================
  // PROFILE UPDATE
  // ==============================

  const profileMutation =
    useMutation({
      mutationFn:
        updateProfile,

      onSuccess: async () => {
        await refreshUser();
      },
    });

  const onProfileSubmit =
    (values) => {
      profileMutation.mutate(
        values
      );
    };

  // ==============================
  // AVATAR UPLOAD
  // ==============================

  const avatarMutation =
    useMutation({
      mutationFn:
        updateAvatar,

      onSuccess: async () => {
        setAvatarError("");

        setAvatarSuccess(
          "Profile image updated successfully"
        );

        await refreshUser();
      },

      onError: (error) => {
        setAvatarSuccess("");

        setAvatarError(
          error?.response?.data
            ?.message ||
            "Unable to upload profile image"
        );
      },
    });

  const handleAvatarChange =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      setAvatarError("");
      setAvatarSuccess("");

      avatarMutation.mutate(
        file
      );

      event.target.value = "";
    };

  // ==============================
  // AVATAR REMOVAL
  // ==============================

  const removeAvatarMutation =
    useMutation({
      mutationFn:
        removeAvatar,

      onSuccess: async () => {
        setAvatarError("");

        setAvatarSuccess(
          "Profile image removed successfully"
        );

        await refreshUser();
      },

      onError: (error) => {
        setAvatarSuccess("");

        setAvatarError(
          error?.response?.data
            ?.message ||
            "Unable to remove profile image"
        );
      },
    });

  // ==============================
  // PASSWORD CHANGE
  // ==============================

  const passwordMutation =
    useMutation({
      mutationFn:
        changePassword,

      onSuccess: (data) => {
        if (data.token) {
          saveSession(
            data.token
          );
        }

        resetPasswordForm();
      },
    });

  const onPasswordSubmit =
    (values) => {
      passwordMutation.mutate(
        values
      );
    };

  // ==============================
  // RESEND VERIFICATION
  // ==============================

  const verificationMutation =
    useMutation({
      mutationFn:
        resendVerification,
    });

  // ==============================
  // HELPERS
  // ==============================

  const initials =
    user?.name
      ?.split(" ")
      .map((part) =>
        part.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase() || "BF";

  const profileApiError =
    profileMutation.error
      ?.response?.data
      ?.message;

  const passwordApiError =
    passwordMutation.error
      ?.response?.data
      ?.message;

  const verificationError =
    verificationMutation.error
      ?.response?.data
      ?.message;

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-white">
      {/* ============================== */}
      {/* BACKGROUND */}
      {/* ============================== */}

      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
      >
        <div className="absolute left-[-10rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[var(--brand-primary)]/10 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize:
              "52px 52px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        {/* ============================== */}
        {/* HEADER */}
        {/* ============================== */}

        <div className="mb-10 flex flex-col gap-5 border-b border-[var(--border-primary)] pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] transition hover:text-white"
            >
              <ArrowLeft
                size={14}
              />

              Back to workspace
            </Link>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Account settings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Manage your identity,
              security and BonaForge
              account preferences.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-primary)] bg-white/[0.025] px-3 py-2 text-xs text-[var(--text-secondary)]">
            <ShieldCheck
              size={14}
              className="text-[var(--brand-accent)]"
            />

            Secure account
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          {/* ============================== */}
          {/* LEFT COLUMN */}
          {/* ============================== */}

          <div className="space-y-6">
            {/* ============================== */}
            {/* AVATAR CARD */}
            {/* ============================== */}

            <motion.section
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-soft)]"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Profile image
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Your identity
                </h2>
              </div>

              <div className="mt-7 flex flex-col items-center text-center">
                <div className="relative">
                  {user?.avatar?.url ? (
                    <img
                      src={
                        user.avatar
                          .url
                      }
                      alt={
                        user.name
                      }
                      className="h-28 w-28 rounded-3xl border border-[var(--border-primary)] object-cover shadow-2xl"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-[var(--border-primary)] bg-gradient-to-br from-[var(--brand-primary)]/25 to-[var(--brand-secondary)]/10 text-3xl font-semibold">
                      {initials}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      avatarInputRef
                        .current
                        ?.click()
                    }
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[#111722] text-white shadow-lg transition hover:bg-[#182130]"
                    aria-label="Change profile image"
                  >
                    <Camera
                      size={17}
                    />
                  </button>
                </div>

                <input
                  ref={
                    avatarInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={
                    handleAvatarChange
                  }
                />

                <p className="mt-5 font-semibold">
                  {user?.name}
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {user?.email}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      avatarInputRef
                        .current
                        ?.click()
                    }
                    disabled={
                      avatarMutation
                        .isPending
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                  >
                    {avatarMutation
                      .isPending ? (
                      <LoaderCircle
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Camera
                        size={14}
                      />
                    )}

                    Change photo
                  </button>

                  {user?.avatar
                    ?.publicId && (
                    <button
                      type="button"
                      onClick={() =>
                        removeAvatarMutation.mutate()
                      }
                      disabled={
                        removeAvatarMutation
                          .isPending
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 text-xs font-semibold text-red-200 transition hover:bg-red-400/[0.09] disabled:opacity-50"
                    >
                      <Trash2
                        size={14}
                      />

                      Remove
                    </button>
                  )}
                </div>

                <p className="mt-4 text-[11px] leading-5 text-[var(--text-muted)]">
                  JPG, PNG or WEBP.
                  Maximum 5 MB.
                </p>

                {avatarError && (
                  <p className="mt-3 text-xs text-red-300">
                    {
                      avatarError
                    }
                  </p>
                )}

                {avatarSuccess && (
                  <p className="mt-3 text-xs text-emerald-300">
                    {
                      avatarSuccess
                    }
                  </p>
                )}
              </div>
            </motion.section>

            {/* ============================== */}
            {/* EMAIL VERIFICATION */}
            {/* ============================== */}

            <section className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                    user
                      ?.isEmailVerified
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                      : "border-amber-400/20 bg-amber-400/10 text-amber-200"
                  }`}
                >
                  {user
                    ?.isEmailVerified ? (
                    <BadgeCheck
                      size={20}
                    />
                  ) : (
                    <CircleAlert
                      size={20}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {user
                      ?.isEmailVerified
                      ? "Email verified"
                      : "Email verification required"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                    {user
                      ?.isEmailVerified
                      ? "Your email address has been verified."
                      : "Verify your email to keep your account identity secure."}
                  </p>

                  {!user
                    ?.isEmailVerified && (
                    <button
                      type="button"
                      onClick={() =>
                        verificationMutation.mutate()
                      }
                      disabled={
                        verificationMutation
                          .isPending
                      }
                      className="mt-4 text-xs font-semibold text-[var(--brand-secondary)] transition hover:text-white disabled:opacity-50"
                    >
                      {verificationMutation
                        .isPending
                        ? "Preparing verification..."
                        : "Resend verification"}
                    </button>
                  )}

                  {verificationMutation
                    .isSuccess && (
                    <p className="mt-3 text-xs leading-5 text-emerald-300">
                      {
                        verificationMutation
                          .data
                          ?.message
                      }
                    </p>
                  )}

                  {verificationError && (
                    <p className="mt-3 text-xs leading-5 text-red-300">
                      {
                        verificationError
                      }
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* ============================== */}
          {/* RIGHT COLUMN */}
          {/* ============================== */}

          <div className="space-y-6">
            {/* ============================== */}
            {/* PROFILE INFORMATION */}
            {/* ============================== */}

            <section className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-white/[0.035]">
                  <UserRound
                    size={17}
                  />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Profile information
                  </h2>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Update your name
                    and email address.
                  </p>
                </div>
              </div>

              {profileApiError && (
                <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-xs text-red-200">
                  {
                    profileApiError
                  }
                </div>
              )}

              {profileMutation
                .isSuccess && (
                <div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-xs text-emerald-200">
                  Profile updated
                  successfully
                </div>
              )}

              <form
                onSubmit={handleProfileSubmit(
                  onProfileSubmit
                )}
                className="mt-6 space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      {...registerProfile(
                        "name"
                      )}
                      className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition focus:border-[var(--brand-primary)]/60 focus:ring-4 focus:ring-[var(--brand-primary)]/10"
                    />
                  </div>

                  {profileErrors
                    .name && (
                    <p className="mt-2 text-xs text-red-300">
                      {
                        profileErrors
                          .name
                          .message
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      type="email"
                      {...registerProfile(
                        "email"
                      )}
                      className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition focus:border-[var(--brand-primary)]/60 focus:ring-4 focus:ring-[var(--brand-primary)]/10"
                    />
                  </div>

                  {profileErrors
                    .email && (
                    <p className="mt-2 text-xs text-red-300">
                      {
                        profileErrors
                          .email
                          .message
                      }
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    profileMutation
                      .isPending
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {profileMutation
                    .isPending ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Save
                      size={15}
                    />
                  )}

                  Save profile
                </button>
              </form>
            </section>

            {/* ============================== */}
            {/* PASSWORD & SECURITY */}
            {/* ============================== */}

            <section className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-white/[0.035]">
                  <KeyRound
                    size={17}
                  />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Password & security
                  </h2>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Change the password
                    protecting your
                    account.
                  </p>
                </div>
              </div>

              {passwordApiError && (
                <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-xs text-red-200">
                  {
                    passwordApiError
                  }
                </div>
              )}

              {passwordMutation
                .isSuccess && (
                <div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-xs text-emerald-200">
                  Password changed
                  successfully
                </div>
              )}

              <form
                onSubmit={handlePasswordSubmit(
                  onPasswordSubmit
                )}
                className="mt-6 space-y-5"
              >
                {/* CURRENT PASSWORD */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Current password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      type="password"
                      autoComplete="current-password"
                      {...registerPassword(
                        "currentPassword"
                      )}
                      className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition focus:border-[var(--brand-primary)]/60 focus:ring-4 focus:ring-[var(--brand-primary)]/10"
                    />
                  </div>

                  {passwordErrors
                    .currentPassword && (
                    <p className="mt-2 text-xs text-red-300">
                      {
                        passwordErrors
                          .currentPassword
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* NEW PASSWORD */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    New password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      type="password"
                      autoComplete="new-password"
                      {...registerPassword(
                        "newPassword"
                      )}
                      className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition focus:border-[var(--brand-primary)]/60 focus:ring-4 focus:ring-[var(--brand-primary)]/10"
                    />
                  </div>

                  {passwordErrors
                    .newPassword && (
                    <p className="mt-2 text-xs text-red-300">
                      {
                        passwordErrors
                          .newPassword
                          .message
                      }
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-[11px]">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        newPassword.length >=
                        8
                          ? "border-[var(--brand-accent)]/30 bg-[var(--brand-accent)]/10 text-[var(--brand-accent)]"
                          : "border-[var(--border-primary)] text-[var(--text-muted)]"
                      }`}
                    >
                      {newPassword.length >=
                        8 && (
                        <Check
                          size={10}
                        />
                      )}
                    </span>

                    <span
                      className={
                        newPassword.length >=
                        8
                          ? "text-[var(--text-secondary)]"
                          : "text-[var(--text-muted)]"
                      }
                    >
                      Minimum 8
                      characters
                    </span>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Confirm new password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      type="password"
                      autoComplete="new-password"
                      {...registerPassword(
                        "confirmPassword"
                      )}
                      className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition focus:border-[var(--brand-primary)]/60 focus:ring-4 focus:ring-[var(--brand-primary)]/10"
                    />
                  </div>

                  {passwordErrors
                    .confirmPassword && (
                    <p className="mt-2 text-xs text-red-300">
                      {
                        passwordErrors
                          .confirmPassword
                          .message
                      }
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    passwordMutation
                      .isPending
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {passwordMutation
                    .isPending ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <ShieldCheck
                      size={15}
                    />
                  )}

                  Change password
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AccountPage;