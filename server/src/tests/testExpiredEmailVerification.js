require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const testExpiredEmailVerification =
  async () => {
    const testEmail =
      "expired-verification-test@bonaforge.test";

    try {
      await mongoose.connect(
        process.env.MONGO_URI
      );

      await User.deleteOne({
        email: testEmail,
      });

      const user = await User.create({
        name: "Expired Verification Test",
        email: testEmail,
        password: "ExpiredTest123!",
      });

      const rawToken =
        user.createEmailVerificationToken();

      // Force the token to be expired.
      user.emailVerificationExpires =
        new Date(Date.now() - 60 * 1000);

      await user.save({
        validateBeforeSave: false,
      });

      const response = await fetch(
        `http://localhost:5000/api/auth/verify-email/${rawToken}`
      );

      const data = await response.json();

      console.log(
        "Expired token status:",
        response.status
      );

      console.log(
        "Expired token rejected:",
        response.status === 400
      );

      console.log(
        "Message:",
        data.message
      );

      if (
        response.status !== 400 ||
        data.success !== false
      ) {
        throw new Error(
          "Expired verification token was not rejected"
        );
      }

      console.log(
        "Expired email verification test PASSED"
      );
    } catch (error) {
      console.error(
        "Expired email verification test FAILED:"
      );

      console.error(error.message);
    } finally {
      await User.deleteOne({
        email: testEmail,
      });

      await mongoose.connection.close();
    }
  };

testExpiredEmailVerification();