const User = require("../models/User");
const ListeningHistory = require("../models/ListeningHistory");
const RecommendationHistory = require("../models/RecommendationHistory");
const Song = require("../models/Song");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const MAX_RECENTLY_PLAYED = 20;

/**
 * Record a track in listening history and recently played.
 */
exports.recordListening = asyncHandler(async (req, res) => {
    const {
        youtubeId,
        title,
        artist,
        album,
        image,
        previewUrl,
        durationMs
    } = req.body;

    if (!youtubeId || !title) {
        throw new ApiError(400, "youtubeId and title are required");
    }

    const track = {
        youtubeId,
        title,
        artist: artist || "",
        album: album || "",
        image: image || "",
        previewUrl: previewUrl || "",
        durationMs: durationMs || 0
    };

    const localSong = await Song.findById(youtubeId).catch(() => null);

    const historyEntry = await ListeningHistory.create({
        userId: req.userId,
        song: localSong?._id,
        ...track
    });

    const user = await User.findById(req.userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Keep recently played unique and capped
    user.recentlyPlayed = [
        track,
        ...user.recentlyPlayed.filter((t) => t.youtubeId !== youtubeId)
    ].slice(0, MAX_RECENTLY_PLAYED);

    await user.save();

    res.status(201).json({
        success: true,
        message: "Listening history recorded",
        history: historyEntry,
        recentlyPlayed: user.recentlyPlayed
    });
});

/**
 * GET /api/users/listening-history
 */
exports.getListeningHistory = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
        ListeningHistory.find({ userId: req.userId })
            .populate("song")
            .sort({ playedAt: -1 })
            .skip(skip)
            .limit(limit),
        ListeningHistory.countDocuments({ userId: req.userId })
    ]);

    res.json({
        success: true,
        page,
        limit,
        total,
        history
    });
});

/**
 * GET /api/users/most-played
 */
exports.getMostPlayed = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const tracks = await ListeningHistory.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
        {
            $group: {
                _id: "$youtubeId",
                song: { $first: "$song" },
                title: { $first: "$title" },
                artist: { $first: "$artist" },
                album: { $first: "$album" },
                image: { $first: "$image" },
                previewUrl: { $first: "$previewUrl" },
                durationMs: { $first: "$durationMs" },
                plays: { $sum: 1 },
                lastPlayedAt: { $max: "$playedAt" }
            }
        },
        { $sort: { plays: -1, lastPlayedAt: -1 } },
        { $limit: limit }
    ]);

    res.json({
        success: true,
        tracks
    });
});

/**
 * GET /api/users/continue-listening
 */
exports.getContinueListening = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 25);
    const history = await ListeningHistory.find({ userId: req.userId })
        .populate("song")
        .sort({ playedAt: -1 })
        .limit(limit);

    res.json({
        success: true,
        tracks: history
    });
});

/**
 * GET /api/users/recently-played
 */
exports.getRecentlyPlayed = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.json({
        success: true,
        recentlyPlayed: user.recentlyPlayed
    });
});

/**
 * PUT /api/users/favorite-genres
 */
exports.updateFavoriteGenres = asyncHandler(async (req, res) => {
    const { genres } = req.body;

    if (!Array.isArray(genres)) {
        throw new ApiError(400, "genres must be an array");
    }

    const user = await User.findByIdAndUpdate(
        req.userId,
        { favoriteGenres: genres },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: "Favorite genres updated",
        favoriteGenres: user.favoriteGenres
    });
});

/**
 * GET /api/users/chat-history
 */
exports.getChatHistory = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    const history = await require("../models/ChatHistory")
        .find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(limit);

    res.json({
        success: true,
        history: history.reverse()
    });
});

/**
 * GET /api/users/recommendation-history
 */
exports.getRecommendationHistory = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const history = await RecommendationHistory.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(limit);

    res.json({
        success: true,
        history
    });
});

/**
 * DELETE /api/users/recommendation-history/:id
 */
exports.deleteRecommendationHistory = asyncHandler(async (req, res) => {
    const history = await RecommendationHistory.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId
    });

    if (!history) {
        throw new ApiError(404, "Recommendation history entry not found");
    }

    res.json({
        success: true,
        message: "Recommendation history entry deleted"
    });
});
