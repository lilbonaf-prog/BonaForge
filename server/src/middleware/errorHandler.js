const errorHandler = (
  err,
  req,
  res,
  next
) => {
  console.error(err.stack);

  // ==============================
  // MULTER FILE SIZE ERROR
  // ==============================

  if (
    err.name === "MulterError" &&
    err.code === "LIMIT_FILE_SIZE"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Avatar image cannot exceed 5 MB",
    });
  }

  // ==============================
  // INVALID MONGODB OBJECT ID
  // ==============================

  if (
    err.name === "CastError" &&
    err.kind === "ObjectId"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid resource ID",
    });
  }

  // ==============================
  // MONGOOSE VALIDATION ERRORS
  // ==============================

  if (
    err.name ===
    "ValidationError"
  ) {
    const messages =
      Object.values(
        err.errors
      ).map(
        (error) =>
          error.message
      );

    return res.status(400).json({
      success: false,
      message:
        messages.join(", "),
    });
  }

  // ==============================
  // MONGODB DUPLICATE KEY ERROR
  // ==============================

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message:
        "A record with this value already exists",
    });
  }

  // ==============================
  // GENERAL APPLICATION ERRORS
  // ==============================

  const statusCode =
    err.statusCode || 500;

  return res
    .status(statusCode)
    .json({
      success: false,

      message:
        statusCode === 500
          ? "Internal server error"
          : err.message,
    });
};

module.exports = errorHandler;