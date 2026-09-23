const jwt = require("jsonwebtoken");

const generateToken = (
  userId,
  tokenVersion = 0
) => {
  return jwt.sign(
    {
      userId,
      tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;
