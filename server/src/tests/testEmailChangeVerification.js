require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const testEmailChangeVerification = async () => {
  const originalEmail =
    "email-change-test@bonaforge.test";

  const newEmail =
    "email-change-new@bonaforge.test";

  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    // Clean up any previous test copies.
    await User.deleteMany({
      email: {
        $in: [originalEmail, newEmail],
      },
    });

    // Create a verified temporary user.
    const user = await User.create({
      name: "Email Change Test",
      email: originalEmail,
      password: "EmailChangeTest123!",
      isEmailVerified: true,
    });

    console.log(
      "Starts verified:",
      user.isEmailVerified
    );

    const token = generateToken(
      user._id,
      user.tokenVersion || 0
    );

    // Change the email through the real API.
    const response = await fetch(
      "http://localhost:5000/api/auth/profile",
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newEmail,
        }),
      }
    );

    const data = await response.json();

    console.log(
      "Profile update status:",
      response.status
    );

    console.log(
      "Profile update success:",
      data.success
    );

    const updatedUser =
      await User.findById(
        user._id
      ).select(
        "+emailVerificationToken +emailVerificationExpires"
      );

    console.log(
      "New email saved:",
      updatedUser.email === newEmail
    );

    console.log(
      "Email becomes unverified:",
      updatedUser.isEmailVerified === false
    );

    console.log(
      "New verification token exists:",
      Boolean(
        updatedUser.emailVerificationToken
      )
    );

    console.log(
      "New verification expiry exists:",
      Boolean(
        updatedUser.emailVerificationExpires
      )
    );

    console.log(
      "Verification expiry is future:",
      updatedUser.emailVerificationExpires >
        Date.now()
    );

    if (
      response.status !== 200 ||
      data.success !== true ||
      updatedUser.email !== newEmail ||
      updatedUser.isEmailVerified !== false ||
      !updatedUser.emailVerificationToken ||
      !updatedUser.emailVerificationExpires ||
      updatedUser.emailVerificationExpires <=
        Date.now()
    ) {
      throw new Error(
        "Email change verification test failed"
      );
    }

    console.log(
      "Email change verification test PASSED"
    );
  } catch (error) {
    console.error(
      "Email change verification test FAILED:"
    );

    console.error(error.message);
  } finally {
    await User.deleteMany({
      email: {
        $in: [originalEmail, newEmail],
      },
    });

    await mongoose.connection.close();
  }
};

testEmailChangeVerification();
