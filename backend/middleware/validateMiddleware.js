const ApiError = require("../utils/ApiError");

/**
 * Runs validation rules and returns 400 on failure.
 * Each rule is (body) => string | null (error message).
 */
const validate = (rules) => (req, res, next) => {
    const errors = [];

    for (const rule of rules) {
        const message = rule(req.body, req.query, req.params);
        if (message) errors.push(message);
    }

    if (errors.length > 0) {
        return next(new ApiError(400, errors.join("; ")));
    }

    next();
};

module.exports = validate;
