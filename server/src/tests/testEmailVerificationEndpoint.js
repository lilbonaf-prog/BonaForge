require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const testEmailVerificationEndpoint =
  async () => {
    try {
      await mongoose.connect(
        process.env.MONGO_URI
      );

      const user = await User.findOne({
        email:
          "bonaforge-register-test2@example.com",
      }).select(
        "+emailVerificationToken +emailVerificationExpires"
      );

      if (!user) {
        throw new Error(
          "Test user not found"
        );
      }

      // Reset verification state for this test.
      user.isEmailVerified = false;

      const rawToken =
        user.createEmailVerificationToken();

      await user.save({
        validateBeforeSave: false,
      });

      console.log(
        "Verification token created: true"
      );

      const response = await fetch(
        `http://localhost:5000/api/auth/verify-email/${rawToken}`
      );

      const data = await response.json();

      console.log(
        "Endpoint status:",
        response.status
      );

      console.log(
        "Endpoint success:",
        data.success
      );

      console.log(
        "Message:",
        data.message
      );

      const updatedUser =
        await User.findById(
          user._id
        ).select(
          "+emailVerificationToken +emailVerificationExpires"
        );

      console.log(
        "Email verified:",
        updatedUser.isEmailVerified
      );

      console.log(
        "Verification token cleared:",
        !updatedUser.emailVerificationToken
      );

      console.log(
        "Verification expiry cleared:",
        !updatedUser.emailVerificationExpires
      );

      if (
        response.status !== 200 ||
        data.success !== true ||
        updatedUser.isEmailVerified !== true ||
        updatedUser.emailVerificationToken ||
        updatedUser.emailVerificationExpires
      ) {
        throw new Error(
          "Email verification endpoint test failed"
        );
      }

      console.log(
        "Email verification endpoint test PASSED"
      );
    } catch (error) {
      console.error(
        "Email verification endpoint test FAILED:"
      );

      console.error(error.message);
    } finally {
      await mongoose.connection.close();
    }
  };

testEmailVerificationEndpoint();