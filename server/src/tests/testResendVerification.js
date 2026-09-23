require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const testResendVerification = async () => {
  const testEmail =
    "resend-verification-test@bonaforge.test";

  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    await User.deleteOne({
      email: testEmail,
    });

    // Register temporary unverified user.
    const registerResponse = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Resend Verification Test",
          email: testEmail,
          password: "ResendTest123!",
          confirmPassword: "ResendTest123!",
        }),
      }
    );

    const registerData =
      await registerResponse.json();

    if (
      registerResponse.status !== 201 ||
      !registerData.token
    ) {
      throw new Error(
        "Temporary test user registration failed"
      );
    }

    const userBefore =
      await User.findOne({
        email: testEmail,
      }).select(
        "+emailVerificationToken +emailVerificationExpires"
      );

    const oldToken =
      userBefore.emailVerificationToken;

    console.log(
      "Initial verification token exists:",
      Boolean(oldToken)
    );

    // Request a new verification token.
    const resendResponse = await fetch(
      "http://localhost:5000/api/auth/resend-verification",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${registerData.token}`,
          "Content-Type":
            "application/json",
        },
      }
    );

    const resendData =
      await resendResponse.json();

    console.log(
      "Resend status:",
      resendResponse.status
    );

    console.log(
      "Resend success:",
      resendData.success
    );

    console.log(
      "Message:",
      resendData.message
    );

    const userAfter =
      await User.findOne({
        email: testEmail,
      }).select(
        "+emailVerificationToken +emailVerificationExpires"
      );

    console.log(
      "New verification token exists:",
      Boolean(
        userAfter.emailVerificationToken
      )
    );

    console.log(
      "Verification token changed:",
      oldToken !==
        userAfter.emailVerificationToken
    );

    console.log(
      "New expiry is in future:",
      userAfter.emailVerificationExpires >
        Date.now()
    );

    if (
      resendResponse.status !== 200 ||
      resendData.success !== true ||
      !userAfter.emailVerificationToken ||
      oldToken ===
        userAfter.emailVerificationToken ||
      userAfter.emailVerificationExpires <=
        Date.now()
    ) {
      throw new Error(
        "Resend verification test failed"
      );
    }

    console.log(
      "Resend verification test PASSED"
    );
  } catch (error) {
    console.error(
      "Resend verification test FAILED:"
    );

    console.error(error.message);
  } finally {
    await User.deleteOne({
      email: testEmail,
    });

    await mongoose.connection.close();
  }
};

testResendVerification();