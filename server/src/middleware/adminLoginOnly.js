const User = require("../models/User");

const adminLoginOnly = async (
  req,
  res,
  next
) => {
  try {
    const { email } = req.body;

    // Let the main login controller handle
    // missing email/password validation.
    if (!email) {
      return next();
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await User.findOne({
      email: normalizedEmail,
      role: "admin",
    }).select("_id");

    if (!admin) {
      const error = new Error(
        "Invalid email or password"
      );

      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminLoginOnly;