require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const testRegistrationVerification =
  async () => {
    const testEmail =
      "registration-verification-test@bonaforge.test";

    try {
      await mongoose.connect(
        process.env.MONGO_URI
      );

      // Remove an old copy if a previous test exists.
      await User.deleteOne({
        email: testEmail,
      });

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: "Registration Verification Test",
            email: testEmail,
            password:
              "VerificationTest123!",
            confirmPassword:
              "VerificationTest123!",
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Registration status:",
        response.status
      );

      console.log(
        "Registration success:",
        data.success
      );

      const user = await User.findOne({
        email: testEmail,
      }).select(
        "+emailVerificationToken +emailVerificationExpires"
      );

      if (!user) {
        throw new Error(
          "Registered test user was not found"
        );
      }

      console.log(
        "Email starts unverified:",
        user.isEmailVerified === false
      );

      console.log(
        "Verification token stored:",
        Boolean(
          user.emailVerificationToken
        )
      );

      console.log(
        "Verification expiry stored:",
        Boolean(
          user.emailVerificationExpires
        )
      );

      console.log(
        "Verification expiry is future:",
        user.emailVerificationExpires >
          Date.now()
      );

      if (
        response.status !== 201 ||
        data.success !== true ||
        user.isEmailVerified !== false ||
        !user.emailVerificationToken ||
        !user.emailVerificationExpires ||
        user.emailVerificationExpires <=
          Date.now()
      ) {
        throw new Error(
          "Registration verification test failed"
        );
      }

      console.log(
        "Registration verification test PASSED"
      );
    } catch (error) {
      console.error(
        "Registration verification test FAILED:"
      );

      console.error(error.message);
    } finally {
      await User.deleteOne({
        email: testEmail,
      });

      await mongoose.connection.close();
    }
  };

testRegistrationVerification();