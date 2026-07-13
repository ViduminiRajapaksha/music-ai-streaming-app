const Favorite = require("../models/Favorite");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * POST /api/favorites
 */
exports.addFavorite = asyncHandler(async (req, res) => {
    const {
        youtubeId,
        title,
        artist,
        album,
        image,
        previewUrl,
        durationMs
    } = req.body;

    const existing = await Favorite.findOne({
        userId: req.userId,
        youtubeId
    });

    if (existing) {
        throw new ApiError(400, "Song is already in favorites");
    }

    const favorite = await Favorite.create({
        userId: req.userId,
        youtubeId,
        title,
        artist,
        album: album || "",
        image: image || "",
        previewUrl: previewUrl || "",
        durationMs: durationMs || 0
    });

    res.status(201).json({
        success: true,
        message: "Song added to favorites",
        favorite
    });
});

/**
 * GET /api/favorites
 */
exports.getFavorites = asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({ userId: req.userId }).sort({
        createdAt: -1
    });

    res.json({
        success: true,
        count: favorites.length,
        favorites
    });
});

/**
 * DELETE /api/favorites/:id
 */
exports.removeFavorite = asyncHandler(async (req, res) => {
    const favorite = await Favorite.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId
    });

    if (!favorite) {
        throw new ApiError(404, "Favorite not found");
    }

    res.json({
        success: true,
        message: "Favorite removed successfully"
    });
});
