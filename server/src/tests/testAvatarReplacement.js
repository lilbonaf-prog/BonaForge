require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");

const testAvatarReplacement = async () => {
  const testEmail =
    "avatar-replacement-test@bonaforge.test";

  let firstPublicId;
  let latestPublicId;

  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    // Remove any previous test user.
    await User.deleteOne({
      email: testEmail,
    });

    // Create temporary test user.
    const user = await User.create({
      name: "Avatar Replacement Test",
      email: testEmail,
      password: "AvatarReplaceTest123!",
    });

    const token = generateToken(
      user._id,
      user.tokenVersion || 0
    );

    // Helper for uploading an avatar
    // through the real BonaForge API.
    const uploadAvatar = async (
      imageBuffer,
      filename
    ) => {
      const form = new FormData();

      form.append(
        "avatar",
        new Blob(
          [imageBuffer],
          {
            type: "image/png",
          }
        ),
        filename
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

      return {
        response,
        data,
      };
    };

    // ==============================
    // FIRST TEST IMAGE
    // ==============================

    const firstImage = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=",
      "base64"
    );

    // ==============================
    // SECOND TEST IMAGE
    // ==============================

    const secondImage = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGNk+M/wn4GBgYGJAQoAHhgCAu/QjeYAAAAASUVORK5CYII=",
      "base64"
    );

    // ==============================
    // FIRST AVATAR UPLOAD
    // ==============================

    const firstUpload =
      await uploadAvatar(
        firstImage,
        "first-avatar.png"
      );

    if (
      firstUpload.response.status !== 200
    ) {
      throw new Error(
        `First avatar upload failed: ${
          firstUpload.data.message ||
          "Unknown error"
        }`
      );
    }

    firstPublicId =
      firstUpload.data.avatar?.publicId;

    console.log(
      "First avatar uploaded:",
      Boolean(firstPublicId)
    );

    if (!firstPublicId) {
      throw new Error(
        "First avatar public ID was not returned"
      );
    }

    // ==============================
    // SECOND AVATAR UPLOAD
    // ==============================

    const secondUpload =
      await uploadAvatar(
        secondImage,
        "second-avatar.png"
      );

    if (
      secondUpload.response.status !== 200
    ) {
      throw new Error(
        `Second avatar upload failed: ${
          secondUpload.data.message ||
          "Unknown error"
        }`
      );
    }

    const secondPublicId =
      secondUpload.data.avatar?.publicId;

    latestPublicId = secondPublicId;

    console.log(
      "Second avatar uploaded:",
      Boolean(secondPublicId)
    );

    if (!secondPublicId) {
      throw new Error(
        "Second avatar public ID was not returned"
      );
    }

    // ==============================
    // VERIFY PUBLIC ID CHANGED
    // ==============================

    const publicIdChanged =
      firstPublicId !== secondPublicId;

    console.log(
      "Avatar public ID changed:",
      publicIdChanged
    );

    // ==============================
    // VERIFY DATABASE UPDATED
    // ==============================

    const updatedUser =
      await User.findById(user._id);

    const databaseUsesNewAvatar =
      updatedUser?.avatar?.publicId ===
      secondPublicId;

    console.log(
      "Database uses new avatar:",
      databaseUsesNewAvatar
    );

    // ==============================
    // VERIFY OLD CLOUDINARY IMAGE
    // WAS DELETED
    // ==============================

    let oldAvatarDeleted = false;

    try {
      await cloudinary.api.resource(
        firstPublicId
      );

      // If Cloudinary still finds the resource,
      // then the previous avatar was not deleted.
      oldAvatarDeleted = false;
    } catch (error) {
      const statusCode =
        error?.http_code ||
        error?.error?.http_code;

      if (statusCode === 404) {
        oldAvatarDeleted = true;
      } else {
        throw error;
      }
    }

    console.log(
      "Previous Cloudinary avatar deleted:",
      oldAvatarDeleted
    );

    // ==============================
    // FINAL ASSERTION
    // ==============================

    if (
      !publicIdChanged ||
      !databaseUsesNewAvatar ||
      !oldAvatarDeleted
    ) {
      throw new Error(
        "Avatar replacement test failed"
      );
    }

    console.log(
      "Avatar replacement test PASSED"
    );
  } catch (error) {
    console.error(
      "Avatar replacement test FAILED:"
    );

    console.error(error.message);
  } finally {
    // Clean up the newest avatar created
    // by this test.
    if (latestPublicId) {
      try {
        await cloudinary.uploader.destroy(
          latestPublicId
        );

        console.log(
          "Latest Cloudinary test image cleaned up"
        );
      } catch (error) {
        console.error(
          "Latest Cloudinary cleanup failed:",
          error.message
        );
      }
    }

    // Safety cleanup in case the test failed
    // before the backend removed the first avatar.
    if (
      firstPublicId &&
      firstPublicId !== latestPublicId
    ) {
      try {
        await cloudinary.uploader.destroy(
          firstPublicId
        );
      } catch (error) {
        console.error(
          "First Cloudinary cleanup failed:",
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

testAvatarReplacement();