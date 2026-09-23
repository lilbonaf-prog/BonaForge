require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const testInvalidAvatarType = async () => {
  const testEmail =
    "invalid-avatar-type-test@bonaforge.test";

  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    await User.deleteOne({
      email: testEmail,
    });

    const user = await User.create({
      name: "Invalid Avatar Type Test",
      email: testEmail,
      password: "AvatarTypeTest123!",
    });

    const token = generateToken(
      user._id,
      user.tokenVersion || 0
    );

    const form = new FormData();

    form.append(
      "avatar",
      new Blob(
        ["This is not an image"],
        {
          type: "text/plain",
        }
      ),
      "not-an-image.txt"
    );

    const response = await fetch(
      "http://localhost:5000/api/auth/avatar",
      {
        method: "PATCH",
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
        body: form,
      }
    );

    const data = await response.json();

    console.log(
      "Invalid type status:",
      response.status
    );

    console.log(
      "Invalid type rejected:",
      response.status === 400
    );

    console.log(
      "Message:",
      data.message
    );

    if (
      response.status !== 400 ||
      data.success !== false ||
      data.message !==
        "Only JPG, PNG and WEBP images are allowed"
    ) {
      throw new Error(
        "Invalid avatar type test failed"
      );
    }

    console.log(
      "Invalid avatar type test PASSED"
    );
  } catch (error) {
    console.error(
      "Invalid avatar type test FAILED:"
    );

    console.error(error.message);
  } finally {
    await User.deleteOne({
      email: testEmail,
    });

    await mongoose.connection.close();
  }
};

testInvalidAvatarType();