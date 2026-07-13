const User = require("../models/User");
const ApiError = require("../utils/ApiError");

/**
 * Check if user has required role
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (!roles.includes(user.role)) {
        throw new ApiError(403, "Not authorized to access this resource");
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is admin
 */
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role !== "admin") {
      throw new ApiError(403, "Admin access required");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is artist or admin
 */
const isArtistOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!["artist", "admin"].includes(user.role)) {
      throw new ApiError(403, "Artist or admin access required");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorize,
  isAdmin,
  isArtistOrAdmin
};
