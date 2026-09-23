const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");

const uploadAvatarToCloudinary = (
  buffer,
  userId
) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "bonaforge/avatars",
          public_id: `user-${userId}-${Date.now()}`,
          resource_type: "image",
          transformation: [
            {
              width: 512,
              height: 512,
              crop: "fill",
              gravity: "face",
            },
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

    uploadStream.end(buffer);
  });
};

// ==============================
// REGISTER USER
// ==============================

const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      const error = new Error(
        "Name, email, password and password confirmation are required"
      );

      error.statusCode = 400;
      throw error;
    }

    if (password !== confirmPassword) {
      const error = new Error(
        "Passwords do not match"
      );

      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      const error = new Error(
        "An account with this email already exists"
      );

      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    // Prepare email verification for the new account.
    const verificationToken =
      user.createEmailVerificationToken();

    // The raw token will later be passed
    // to the email delivery service.
    void verificationToken;

    await user.save({
      validateBeforeSave: false,
    });

    const token = generateToken(
      user._id,
      user.tokenVersion || 0
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// LOGIN USER
// ==============================

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error(
        "Email and password are required"
      );

      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      const error = new Error(
        "Invalid email or password"
      );

      error.statusCode = 401;
      throw error;
    }

    const passwordMatches =
      await user.comparePassword(password);

    if (!passwordMatches) {
      const error = new Error(
        "Invalid email or password"
      );

      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(
      user._id,
      user.tokenVersion || 0
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// GET CURRENT USER
// ==============================

const getCurrentUser = async (
  req,
  res,
  next
) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// UPDATE PROFILE
// ==============================

const updateProfile = async (
  req,
  res,
  next
) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      const error = new Error(
        "User account could not be found"
      );

      error.statusCode = 404;
      throw error;
    }

    // Update name if supplied.
    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        const error = new Error(
          "Name cannot be empty"
        );

        error.statusCode = 400;
        throw error;
      }

      user.name = trimmedName;
    }

    // Update email if supplied.
    if (email !== undefined) {
      const normalizedEmail = email
        .trim()
        .toLowerCase();

      if (!normalizedEmail) {
        const error = new Error(
          "Email cannot be empty"
        );

        error.statusCode = 400;
        throw error;
      }

      const emailAlreadyExists =
        await User.findOne({
          email: normalizedEmail,
          _id: {
            $ne: user._id,
          },
        });

      if (emailAlreadyExists) {
        const error = new Error(
          "An account with this email already exists"
        );

        error.statusCode = 409;
        throw error;
      }

      if (normalizedEmail !== user.email) {
        user.email = normalizedEmail;
        user.isEmailVerified = false;

        // Prepare a fresh verification token
        // for the newly changed email address.
        const verificationToken =
          user.createEmailVerificationToken();

        // The raw token will later be passed
        // to the email delivery service.
        void verificationToken;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// UPDATE AVATAR
// ==============================

const updateAvatar = async (
  req,
  res,
  next
) => {
  let uploadedAvatar;

  try {
    if (!req.file) {
      const error = new Error(
        "Please select an avatar image"
      );

      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      const error = new Error(
        "User account could not be found"
      );

      error.statusCode = 404;
      throw error;
    }

    const previousPublicId =
      user.avatar?.publicId;

    uploadedAvatar =
      await uploadAvatarToCloudinary(
        req.file.buffer,
        user._id
      );

    user.avatar = {
      url: uploadedAvatar.secure_url,
      publicId: uploadedAvatar.public_id,
    };

    await user.save({
      validateBeforeSave: false,
    });

    // Remove the previous avatar only after
    // the new avatar has been saved successfully.
    if (
      previousPublicId &&
      previousPublicId !==
        uploadedAvatar.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(
          previousPublicId
        );
      } catch (deleteError) {
        console.error(
          "Previous avatar cleanup failed:",
          deleteError.message
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    // If Cloudinary uploaded the new image but
    // saving the user failed, remove the orphan.
    if (uploadedAvatar?.public_id) {
      try {
        await cloudinary.uploader.destroy(
          uploadedAvatar.public_id
        );
      } catch (cleanupError) {
        console.error(
          "Avatar cleanup failed:",
          cleanupError.message
        );
      }
    }

    next(error);
  }
};

// ==============================
// REMOVE AVATAR
// ==============================

const removeAvatar = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      const error = new Error(
        "User account could not be found"
      );

      error.statusCode = 404;
      throw error;
    }

    const currentPublicId =
      user.avatar?.publicId;

    if (!currentPublicId) {
      const error = new Error(
        "No avatar is currently set"
      );

      error.statusCode = 400;
      throw error;
    }

    await cloudinary.uploader.destroy(
      currentPublicId
    );

    user.avatar = {
      url: "",
      publicId: "",
    };

    await user.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      success: true,
      message: "Avatar removed successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// CHANGE PASSWORD
// ==============================

const changePassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      const error = new Error(
        "Current password, new password and password confirmation are required"
      );

      error.statusCode = 400;
      throw error;
    }

    if (newPassword !== confirmPassword) {
      const error = new Error(
        "New passwords do not match"
      );

      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 8) {
      const error = new Error(
        "New password must be at least 8 characters"
      );

      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(
      req.user._id
    ).select("+password");

    if (!user) {
      const error = new Error(
        "User account could not be found"
      );

      error.statusCode = 404;
      throw error;
    }

    const currentPasswordMatches =
      await user.comparePassword(
        currentPassword
      );

    if (!currentPasswordMatches) {
      const error = new Error(
        "Current password is incorrect"
      );

      error.statusCode = 401;
      throw error;
    }

    user.password = newPassword;

    user.passwordChangedAt = new Date(
      Date.now() - 1000
    );

    await user.save();

    const token = generateToken(
      user._id,
      user.tokenVersion || 0
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      token,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// FORGOT PASSWORD
// ==============================

const forgotPassword = async (
  req,
  res,
  next
) => {
  try {
    const { email } = req.body;

    if (!email) {
      const error = new Error(
        "Email is required"
      );

      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, password reset instructions will be sent",
      });
    }

    const resetToken =
      user.createPasswordResetToken();

    // The raw token will later be passed
    // to the email delivery service.
    void resetToken;

    await user.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, password reset instructions will be sent",
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// RESET PASSWORD
// ==============================

const resetPassword = async (
  req,
  res,
  next
) => {
  try {
    const { token } = req.params;

    const {
      newPassword,
      confirmPassword,
    } = req.body;

    if (!token) {
      const error = new Error(
        "Password reset token is required"
      );

      error.statusCode = 400;
      throw error;
    }

    if (!newPassword || !confirmPassword) {
      const error = new Error(
        "New password and password confirmation are required"
      );

      error.statusCode = 400;
      throw error;
    }

    if (newPassword !== confirmPassword) {
      const error = new Error(
        "New passwords do not match"
      );

      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 8) {
      const error = new Error(
        "New password must be at least 8 characters"
      );

      error.statusCode = 400;
      throw error;
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    if (!user) {
      const error = new Error(
        "Password reset token is invalid or has expired"
      );

      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;

    user.passwordChangedAt = new Date(
      Date.now() - 1000
    );

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const newAuthToken = generateToken(
      user._id,
      user.tokenVersion || 0
    );

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      token: newAuthToken,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// VERIFY EMAIL
// ==============================

const verifyEmail = async (
  req,
  res,
  next
) => {
  try {
    const { token } = req.params;

    if (!token) {
      const error = new Error(
        "Email verification token is required"
      );

      error.statusCode = 400;
      throw error;
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: {
        $gt: Date.now(),
      },
    }).select(
      "+emailVerificationToken +emailVerificationExpires"
    );

    if (!user) {
      const error = new Error(
        "Email verification token is invalid or has expired"
      );

      error.statusCode = 400;
      throw error;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified:
          user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// RESEND EMAIL VERIFICATION
// ==============================

const resendEmailVerification = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      const error = new Error(
        "User account could not be found"
      );

      error.statusCode = 404;
      throw error;
    }

    if (user.isEmailVerified) {
      const error = new Error(
        "Email address is already verified"
      );

      error.statusCode = 400;
      throw error;
    }

    const verificationToken =
      user.createEmailVerificationToken();

    // The raw token will later be passed
    // to the email delivery service.
    void verificationToken;

    await user.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      success: true,
      message:
        "A new email verification link has been prepared",
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// LOGOUT USER
// ==============================

const logoutUser = async (
  req,
  res,
  next
) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          tokenVersion: 1,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  updateAvatar,
  removeAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  logoutUser,
};