const bcrypt = require("bcrypt");
const User = require("../models/User");
const Favorite = require("../models/Favorite");
const Playlist = require("../models/Playlist");
const ChatHistory = require("../models/ChatHistory");
const AIHistory = require("../models/AIHistory");
const ListeningHistory = require("../models/ListeningHistory");
const Download = require("../models/Download");
const Recommendation = require("../models/Recommendation");
const RecommendationHistory = require("../models/RecommendationHistory");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new ApiError(400, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        token: generateToken(user._id),
        user
    });
});

/**
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (user.status === "suspended") {
        throw new ApiError(403, "Your account is suspended");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
        success: true,
        message: "Login successful",
        token: generateToken(user._id),
        user: userResponse
    });
});

/**
 * GET /api/auth/profile
 */
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.json({
        success: true,
        user
    });
});

/**
 * PUT /api/auth/profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const { username, profileImage, favoriteGenres, country, subscription, preferredLanguage } = req.body;

    const updates = {};
    if (username !== undefined) updates.username = username.trim();
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (favoriteGenres !== undefined) updates.favoriteGenres = favoriteGenres;
    if (country !== undefined) updates.country = country;
    if (subscription !== undefined) updates.subscription = subscription;
    if (preferredLanguage !== undefined) updates.preferredLanguage = preferredLanguage;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
        new: true,
        runValidators: true
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.json({
        success: true,
        message: "Profile updated successfully",
        user
    });
});

/**
 * PUT /api/auth/change-password
 */
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select("+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    res.json({
        success: true,
        message: "Password changed successfully"
    });
});

/**
 * DELETE /api/auth/delete-account
 */
exports.deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.userId;

    await Promise.all([
        Favorite.deleteMany({ userId }),
        Playlist.deleteMany({ user: userId }),
        ChatHistory.deleteMany({ userId }),
        AIHistory.deleteMany({ user: userId }),
        ListeningHistory.deleteMany({ userId }),
        Download.deleteMany({ user: userId }),
        Recommendation.deleteMany({ user: userId }),
        RecommendationHistory.deleteMany({ userId })
    ]);

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.json({
        success: true,
        message: "Account deleted successfully"
    });
});

/**
 * POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: "Logged out successfully"
    });
});

/**
 * POST /api/auth/profile/image
 */
exports.uploadProfileImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const user = await User.findById(req.userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
        success: true,
        message: "Profile image uploaded successfully",
        profileImage: user.profileImage
    });
});
