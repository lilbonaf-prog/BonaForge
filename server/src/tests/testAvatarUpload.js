require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");

const testAvatarUpload = async () => {
  const testEmail =
    "avatar-upload-test@bonaforge.test";

  let user;
  let uploadedPublicId;

  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    await User.deleteOne({
      email: testEmail,
    });

    user = await User.create({
      name: "Avatar Upload Test",
      email: testEmail,
      password: "AvatarTest123!",
    });

    const token = generateToken(
      user._id,
      user.tokenVersion || 0
    );

    // Tiny valid PNG image.
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=",
      "base64"
    );

    const form = new FormData();

    form.append(
      "avatar",
      new Blob(
        [pngBuffer],
        {
          type: "image/png",
        }
      ),
      "avatar-test.png"
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
      "Upload status:",
      response.status
    );

    console.log(
      "Upload success:",
      data.success
    );

    console.log(
      "Message:",
      data.message
    );

    console.log(
      "Avatar URL returned:",
      Boolean(data.avatar?.url)
    );

    console.log(
      "Public ID returned:",
      Boolean(
        data.avatar?.publicId
      )
    );

    const updatedUser =
      await User.findById(user._id);

    console.log(
      "Avatar URL saved in database:",
      Boolean(
        updatedUser.avatar?.url
      )
    );

    console.log(
      "Public ID saved in database:",
      Boolean(
        updatedUser.avatar?.publicId
      )
    );

    uploadedPublicId =
      updatedUser.avatar?.publicId;

    if (
      response.status !== 200 ||
      data.success !== true ||
      !updatedUser.avatar?.url ||
      !updatedUser.avatar?.publicId
    ) {
      throw new Error(
        "Avatar upload test failed"
      );
    }

    console.log(
      "Avatar upload test PASSED"
    );
  } catch (error) {
    console.error(
      "Avatar upload test FAILED:"
    );

    console.error(error.message);
  } finally {
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(
          uploadedPublicId
        );

        console.log(
          "Cloudinary test image cleaned up"
        );
      } catch (error) {
        console.error(
          "Cloudinary cleanup failed:",
          error.message
        );
      }
    }

    await User.deleteOne({
      email: testEmail,
    });

    await mongoose.connection.close();
  }
};

testAvatarUpload();