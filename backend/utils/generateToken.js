const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for the authenticated user.
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

module.exports = generateToken;
