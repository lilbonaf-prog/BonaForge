require("dotenv").config();

const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

const testToken = () => {
  try {
    const fakeUserId = "64b123456789abcdef123456";

    const token = generateToken(fakeUserId);

    console.log("Token generated:", Boolean(token));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Token verified:", Boolean(decoded));
    console.log("User ID matches:", decoded.userId === fakeUserId);
    console.log("JWT test PASSED");
  } catch (error) {
    console.error("JWT test FAILED:");
    console.error(error.message);
  }
};

testToken();