require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");

const testAvatarRemoval = async () => {
  const testEmail =
    "avatar-removal-test@bonaforge.test";

  let uploadedPublicId;

  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    await User.deleteOne({
      email: testEmail,
    });

    const user = await User.create({
      name: "Avatar Removal Test",
      email: testEmail,
      password: "AvatarRemovalTest123!",
    });

    const token = generateToken(
      user._id,
      user.tokenVersion || 0
    );

    const imageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=",
      "base64"
    );

    const form = new FormData();

    form.append(
      "avatar",
      new Blob(
        [imageBuffer],
        {
          type: "image/png",
        }
      ),
      "avatar-removal-test.png"
    );

    // ==============================
    // UPLOAD AVATAR
    // ==============================

    const uploadResponse = await fetch(
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

    const uploadData =
      await uploadResponse.json();

    if (
      uploadResponse.status !== 200 ||
      !uploadData.avatar?.publicId
    ) {
      throw new Error(
        `Avatar upload failed: ${
          uploadData.message ||
          "Unknown error"
        }`
      );
    }

    uploadedPublicId =
      uploadData.avatar.publicId;

    console.log(
      "Avatar uploaded:",
      true
    );

    // ==============================
    // REMOVE AVATAR
    // ==============================

    const removeResponse = await fetch(
      "http://localhost:5000/api/auth/avatar",
      {
        method: "DELETE",
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const removeData =
      await removeResponse.json();

    console.log(
      "Removal status:",
      removeResponse.status
    );

    console.log(
      "Removal success:",
      removeData.success
    );

    console.log(
      "Message:",
      removeData.message
    );

    // ==============================
    // VERIFY DATABASE
    // ==============================

    const updatedUser =
      await User.findById(user._id);

    const databaseCleared =
      updatedUser.avatar.url === "" &&
      updatedUser.avatar.publicId === "";

    console.log(
      "Database avatar cleared:",
      databaseCleared
    );

    // ==============================
    // VERIFY CLOUDINARY
    // ==============================

    let cloudinaryDeleted = false;

    try {
      await cloudinary.api.resource(
        uploadedPublicId
      );
    } catch (error) {
      const statusCode =
        error?.http_code ||
        error?.error?.http_code;

      if (statusCode === 404) {
        cloudinaryDeleted = true;
      } else {
        throw error;
      }
    }

    console.log(
      "Cloudinary avatar deleted:",
      cloudinaryDeleted
    );

    // The controller already deleted it.
    uploadedPublicId = null;

    if (
      removeResponse.status !== 200 ||
      removeData.success !== true ||
      !databaseCleared ||
      !cloudinaryDeleted
    ) {
      throw new Error(
        "Avatar removal test failed"
      );
    }

    console.log(
      "Avatar removal test PASSED"
    );
  } catch (error) {
    console.error(
      "Avatar removal test FAILED:"
    );

    console.error(error.message);
  } finally {
    // Safety cleanup if the test failed
    // before avatar removal completed.
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(
          uploadedPublicId
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

testAvatarRemoval();