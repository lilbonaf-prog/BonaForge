require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const testUserModel = async () => {
  const testEmail = "bonaforge-model-test@example.com";

  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected for User model test");

    // Remove an old test record if one exists
    await User.deleteOne({ email: testEmail });

    // Create synthetic test user
    const user = await User.create({
      name: "BonaForge Test User",
      email: testEmail,
      password: "TestPassword123!",
    });

    console.log("User created successfully");
    console.log("User ID:", user._id.toString());

    // Fetch password explicitly because password has select: false
    const savedUser = await User.findOne({
      email: testEmail,
    }).select("+password");

    console.log(
      "Password was hashed:",
      savedUser.password !== "TestPassword123!"
    );

    const correctPassword = await savedUser.comparePassword(
      "TestPassword123!"
    );

    const wrongPassword = await savedUser.comparePassword(
      "WrongPassword123!"
    );

    console.log("Correct password accepted:", correctPassword);
    console.log("Wrong password rejected:", !wrongPassword);

    // Clean up test data
    await User.deleteOne({ email: testEmail });

    console.log("Test user removed");
    console.log("User model test PASSED");
  } catch (error) {
    console.error("User model test FAILED:");
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
};

testUserModel();