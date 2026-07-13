const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

/**
 * Protect routes by verifying the Bearer JWT token.
 */
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiError(401, "Access denied. No token provided."));
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return next(new ApiError(401, "User account no longer exists."));
        }
        if (user.status === "suspended") {
            return next(new ApiError(403, "User account is suspended."));
        }
        req.userId = decoded.userId;
        req.user = user;
        next();
    } catch (error) {
        next(new ApiError(401, "Invalid or expired token."));
    }
};

module.exports = authMiddleware;
