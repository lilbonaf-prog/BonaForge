require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const testEmailVerificationReuse = async () => {
  const testEmail =
    "verification-reuse-test@bonaforge.test";

  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    await User.deleteOne({
      email: testEmail,
    });

    const user = await User.create({
      name: "Verification Reuse Test",
      email: testEmail,
      password: "ReuseTest123!",
    });

    const rawToken =
      user.createEmailVerificationToken();

    await user.save({
      validateBeforeSave: false,
    });

    // First use — should succeed.
    const firstResponse = await fetch(
      `http://localhost:5000/api/auth/verify-email/${rawToken}`
    );

    const firstData =
      await firstResponse.json();

    console.log(
      "First verification status:",
      firstResponse.status
    );

    console.log(
      "First verification success:",
      firstData.success
    );

    // Second use of the exact same token — must fail.
    const secondResponse = await fetch(
      `http://localhost:5000/api/auth/verify-email/${rawToken}`
    );

    const secondData =
      await secondResponse.json();

    console.log(
      "Reused token status:",
      secondResponse.status
    );

    console.log(
      "Reused token rejected:",
      secondResponse.status === 400
    );

    console.log(
      "Message:",
      secondData.message
    );

    if (
      firstResponse.status !== 200 ||
      firstData.success !== true ||
      secondResponse.status !== 400 ||
      secondData.success !== false
    ) {
      throw new Error(
        "Verification token reuse test failed"
      );
    }

    console.log(
      "Email verification reuse test PASSED"
    );
  } catch (error) {
    console.error(
      "Email verification reuse test FAILED:"
    );

    console.error(error.message);
  } finally {
    await User.deleteOne({
      email: testEmail,
    });

    await mongoose.connection.close();
  }
};

testEmailVerificationReuse();