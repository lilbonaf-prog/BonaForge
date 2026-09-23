const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Used to invalidate JWTs after logout.
    tokenVersion: {
      type: Number,
      default: 0,
    },

    avatar: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },
    },

    // ==============================
    // EMAIL VERIFICATION
    // ==============================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // ==============================
    // PASSWORD SECURITY
    // ==============================

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==============================
// PASSWORD HASHING
// ==============================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(
    this.password,
    12
  );
});

// ==============================
// PASSWORD COMPARISON
// ==============================

userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return bcrypt.compare(
    candidatePassword,
    this.password
  );
};

// ==============================
// PASSWORD RESET TOKEN
// ==============================

userSchema.methods.createPasswordResetToken =
  function () {
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Store only the hashed reset token.
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Reset token expires after 10 minutes.
    this.passwordResetExpires =
      Date.now() + 10 * 60 * 1000;

    // Return the raw token so it can eventually
    // be sent to the user by email.
    return resetToken;
  };

  // ==============================
// EMAIL VERIFICATION TOKEN
// ==============================

userSchema.methods.createEmailVerificationToken =
  function () {
    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    this.emailVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Verification token expires after 24 hours.
    this.emailVerificationExpires =
      Date.now() + 24 * 60 * 60 * 1000;

    return verificationToken;
  };

const User = mongoose.model(
  "User",
  userSchema
);

module.exports = User;