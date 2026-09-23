const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  updateAvatar,
  removeAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  logoutUser,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  loginLimiter,
  authActionLimiter,
} = require("../middleware/authRateLimiter");

const uploadAvatar = require(
  "../middleware/uploadAvatar"
);

const router = express.Router();

// ==============================
// PUBLIC AUTH ROUTES
// ==============================

router.post(
  "/register",
  authActionLimiter,
  registerUser
);

router.post(
  "/login",
  loginLimiter,
  loginUser
);

router.post(
  "/forgot-password",
  authActionLimiter,
  forgotPassword
);

router.patch(
  "/reset-password/:token",
  authActionLimiter,
  resetPassword
);

router.get(
  "/verify-email/:token",
  verifyEmail
);

// ==============================
// PROTECTED AUTH ROUTES
// ==============================

router.get(
  "/me",
  protect,
  getCurrentUser
);

router.patch(
  "/profile",
  protect,
  updateProfile
);

// ==============================
// AVATAR
// ==============================

router.patch(
  "/avatar",
  protect,
  uploadAvatar.single("avatar"),
  updateAvatar
);

router.delete(
  "/avatar",
  protect,
  removeAvatar
);

// ==============================
// PASSWORD
// ==============================

router.patch(
  "/change-password",
  authActionLimiter,
  protect,
  changePassword
);

// ==============================
// EMAIL VERIFICATION
// ==============================

router.post(
  "/resend-verification",
  authActionLimiter,
  protect,
  resendEmailVerification
);

// ==============================
// LOGOUT
// ==============================

router.post(
  "/logout",
  protect,
  logoutUser
);

module.exports = router;