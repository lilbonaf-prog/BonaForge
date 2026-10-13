const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    const authorizationHeader =
      req.headers.authorization;

    // Read Bearer token
    if (
      authorizationHeader &&
      authorizationHeader.startsWith("Bearer ")
    ) {
      token =
        authorizationHeader.split(" ")[1];
    }

    if (!token) {
      const error = new Error(
        "Authentication required"
      );

      error.statusCode = 401;
      throw error;
    }

    // Verify JWT signature and expiry
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find the user belonging to the token
    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      const error = new Error(
        "User belonging to this token no longer exists"
      );

      error.statusCode = 401;
      throw error;
    }

    // ==============================
    // TOKEN VERSION CHECK
    // ==============================

    const currentTokenVersion =
      user.tokenVersion || 0;

    if (
      decoded.tokenVersion !==
      currentTokenVersion
    ) {
      const error = new Error(
        "Authentication session is no longer valid. Please log in again"
      );

      error.statusCode = 401;
      throw error;
    }

    // ==============================
    // PASSWORD CHANGE CHECK
    // ==============================

    if (user.passwordChangedAt) {
      const passwordChangedTimestamp =
        Math.floor(
          user.passwordChangedAt.getTime() /
            1000
        );

      if (
        passwordChangedTimestamp >
        decoded.iat
      ) {
        const error = new Error(
          "Password was changed recently. Please log in again"
        );

        error.statusCode = 401;
        throw error;
      }
    }

    // ==============================
    // ADMIN-ONLY ACCESS
    // ==============================

    if (user.role !== "admin") {
      const error = new Error(
        "Administrator access required"
      );

      error.statusCode = 403;
      throw error;
    }

    // Make the authenticated admin available
    // to the next controller.
    req.user = user;

    next();
  } catch (error) {
    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      error.message =
        "Invalid authentication token";

      error.statusCode = 401;
    }

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      error.message =
        "Authentication token has expired";

      error.statusCode = 401;
    }

    next(error);
  }
};

module.exports = {
  protect,
};