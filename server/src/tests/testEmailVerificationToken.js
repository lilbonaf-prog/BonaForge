require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const testEmailVerificationToken = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({
      email: "bonaforge-register-test2@example.com",
    }).select(
      "+emailVerificationToken +emailVerificationExpires"
    );

    if (!user) {
      throw new Error("Test user not found");
    }

    const rawToken =
      user.createEmailVerificationToken();

    await user.save({
      validateBeforeSave: false,
    });

    console.log(
      "Raw verification token created:",
      Boolean(rawToken)
    );

    console.log(
      "Hashed verification token stored:",
      Boolean(user.emailVerificationToken)
    );

    console.log(
      "Raw token differs from stored token:",
      rawToken !== user.emailVerificationToken
    );

    console.log(
      "Verification expiry created:",
      Boolean(user.emailVerificationExpires)
    );

    console.log(
      "Verification expiry is in the future:",
      user.emailVerificationExpires > Date.now()
    );

    // Clean up test fields
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    console.log(
      "Verification fields cleaned up"
    );

    console.log(
      "Email verification token test PASSED"
    );
  } catch (error) {
    console.error(
      "Email verification token test FAILED:"
    );

    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
};

testEmailVerificationToken();