const multer = require("multer");

// Keep uploaded images in memory temporarily.
// We will send the buffer directly to Cloudinary.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error(
      "Only JPG, PNG and WEBP images are allowed"
    );

    error.statusCode = 400;

    return cb(error, false);
  }

  cb(null, true);
};

const uploadAvatar = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
});

module.exports = uploadAvatar;