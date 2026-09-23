require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const testAvatarFileSize = async () => {
  const testEmail =
    "avatar-size-test@bonaforge.test";

  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    await User.deleteOne({
      email: testEmail,
    });

    const user = await User.create({
      name: "Avatar Size Test",
      email: testEmail,
      password: "AvatarSizeTest123!",
    });

    const token = generateToken(
      user._id,
      user.tokenVersion || 0
    );

    // Create a buffer slightly larger than 5 MB.
    const oversizedBuffer = Buffer.alloc(
      5 * 1024 * 1024 + 1024
    );

    const form = new FormData();

    form.append(
      "avatar",
      new Blob(
        [oversizedBuffer],
        {
          type: "image/png",
        }
      ),
      "oversized-avatar.png"
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
      "Oversized status:",
      response.status
    );

    console.log(
      "Oversized rejected:",
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
        "Avatar image cannot exceed 5 MB"
    ) {
      throw new Error(
        "Avatar size limit test failed"
      );
    }

    console.log(
      "Avatar size limit test PASSED"
    );
  } catch (error) {
    console.error(
      "Avatar size limit test FAILED:"
    );

    console.error(error.message);
  } finally {
    await User.deleteOne({
      email: testEmail,
    });

    await mongoose.connection.close();
  }
};

testAvatarFileSize();
