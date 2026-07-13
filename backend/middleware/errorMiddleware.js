const ApiError = require("../utils/ApiError");

/**
 * Centralized Express error handler.
 */
const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `${field} already exists`;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (String(process.env.DEBUG_ERRORS).toLowerCase() === "true") {
        console.error(err.stack || err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(String(process.env.DEBUG_ERRORS).toLowerCase() === "true" && err.stack
            ? { stack: err.stack }
            : {})
    });
};

module.exports = errorMiddleware;
