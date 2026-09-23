require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const testPasswordResetToken = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({
      email: "bonaforge-register-test2@example.com",
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      throw new Error("Test user not found");
    }

    const rawToken = user.createPasswordResetToken();

    await user.save({
      validateBeforeSave: false,
    });

    console.log("Raw token created:", Boolean(rawToken));
    console.log(
      "Hashed token stored:",
      Boolean(user.passwordResetToken)
    );
    console.log(
      "Raw token differs from stored token:",
      rawToken !== user.passwordResetToken
    );
    console.log(
      "Expiry created:",
      Boolean(user.passwordResetExpires)
    );
    console.log(
      "Expiry is in the future:",
      user.passwordResetExpires > Date.now()
    );

    // Clean up test reset fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    console.log("Reset fields cleaned up");
    console.log("Password reset token test PASSED");
  } catch (error) {
    console.error("Password reset token test FAILED:");
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
};

testPasswordResetToken();