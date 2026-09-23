const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (
  err.name === "MulterError" &&
  err.code === "LIMIT_FILE_SIZE"
) {
  return res.status(400).json({
    success: false,
    message: "Avatar image cannot exceed 5 MB",
  });
}

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
};

module.exports = errorHandler;