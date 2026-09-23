require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const testResetPasswordEndpoint = async () => {
  const email = "bonaforge-register-test2@example.com";
  const newPassword = "ResetTestPassword123!";

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({
      email,
    }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    if (!user) {
      throw new Error("Test user not found");
    }

    // Generate real reset token.
    // We deliberately never print the raw token.
    const rawResetToken =
      user.createPasswordResetToken();

    await user.save({
      validateBeforeSave: false,
    });

    console.log("Reset token generated: true");

    // Call the real BonaForge reset-password endpoint
    const resetResponse = await fetch(
      `http://localhost:5000/api/auth/reset-password/${rawResetToken}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword,
          confirmPassword: newPassword,
        }),
      }
    );

    const resetData = await resetResponse.json();

    console.log(
      "Reset status:",
      resetResponse.status
    );

    console.log(
      "Reset success:",
      resetData.success
    );

    console.log(
      "Reset message:",
      resetData.message
    );

    console.log(
      "New auth token created:",
      Boolean(resetData.token)
    );

    // Verify reset token was removed from MongoDB
    const updatedUser = await User.findOne({
      email,
    }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    console.log(
      "Reset token cleared:",
      !updatedUser.passwordResetToken
    );

    console.log(
      "Reset expiry cleared:",
      !updatedUser.passwordResetExpires
    );

    // Verify login with the new password
    const loginResponse = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: newPassword,
        }),
      }
    );

    const loginData = await loginResponse.json();

    console.log(
      "Login with new password:",
      loginData.success
    );

    console.log(
      "Reset Password endpoint test PASSED"
    );
  } catch (error) {
    console.error(
      "Reset Password endpoint test FAILED:"
    );

    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
};

testResetPasswordEndpoint();