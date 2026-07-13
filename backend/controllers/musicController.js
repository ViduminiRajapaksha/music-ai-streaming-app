const youtubeService = require("../services/youtubeService");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const getYoutubeFailureMessage = (err) => {
    const status = err.response?.status;

    if (!process.env.YOUTUBE_API_KEY) {
        return "YouTube API unavailable: missing API key. Showing local library results only.";
    }

    if (status === 429) {
        return "YouTube quota exceeded. Showing local library results only.";
    }

    if (status === 401 || status === 403) {
        return "YouTube API unavailable: check the API key, permissions, or quota. Showing local library results only.";
    }

    return "YouTube recommendations are temporarily unavailable. Showing local library results only.";
};

const shouldUseYoutubeFallback = (err) => Boolean(err.response) || ["ECONNABORTED", "ENOTFOUND", "ECONNRESET"].includes(err.code);

const emptySearchData = {
    tracks: { items: [], total: 0 },
    albums: { items: [], total: 0 },
    artists: { items: [], total: 0 }
};

const emptyReleaseData = {
    albums: { items: [], total: 0 }
};

const emptyRecommendationData = {
    tracks: []
};

/**
 * GET /api/music/search?q=&type=track|artist|album|all
 */
exports.search = asyncHandler(async (req, res) => {
    const { q, type = "track", limit = 20 } = req.query;

    if (!q || !q.trim()) {
        throw new ApiError(400, "Search query (q) is required");
    }

    // Convert app types to YouTube types
    const typeMap = {
        track: "video",
        artist: "channel",
        album: "playlist",
        all: "video,channel,playlist"
    };

    // Handle comma-separated types
    const searchType = type.split(",").map(t => typeMap[t.trim()] || t).join(",");

    let data;
    try {
        data = await youtubeService.search(q.trim(), searchType, Math.min(limit, 50));
    } catch (err) {
        if (!shouldUseYoutubeFallback(err)) throw err;

        return res.json({
            success: true,
            data: {
                ...emptySearchData,
                warning: getYoutubeFailureMessage(err)
            }
        });
    }
    res.json({
        success: true,
        data
    });
});

/**
 * GET /api/music/track/:id
 */
exports.getTrack = asyncHandler(async (req, res) => {
    let data;
    try {
        data = await youtubeService.getTrack(req.params.id);
    } catch (err) {
        if (!shouldUseYoutubeFallback(err)) throw err;
        throw new ApiError(503, getYoutubeFailureMessage(err));
    }

    res.json({
        success: true,
        data
    });
});

/**
 * GET /api/music/artist/:id
 */
exports.getArtist = asyncHandler(async (req, res) => {
    let data;
    try {
        data = await youtubeService.getArtist(req.params.id);
    } catch (err) {
        if (!shouldUseYoutubeFallback(err)) throw err;
        throw new ApiError(503, getYoutubeFailureMessage(err));
    }

    res.json({
        success: true,
        data
    });
});

/**
 * GET /api/music/album/:id
 */
exports.getAlbum = asyncHandler(async (req, res) => {
    let data;
    try {
        data = await youtubeService.getAlbum(req.params.id);
    } catch (err) {
        if (!shouldUseYoutubeFallback(err)) throw err;
        throw new ApiError(503, getYoutubeFailureMessage(err));
    }

    res.json({
        success: true,
        data
    });
});

/**
 * GET /api/music/new-releases
 */
exports.getNewReleases = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const country = req.query.country || "US";

    let data;
    try {
        data = await youtubeService.getNewReleases(limit, country);
    } catch (err) {
        if (!shouldUseYoutubeFallback(err)) throw err;

        return res.json({
            success: true,
            data: {
                ...emptyReleaseData,
                warning: getYoutubeFailureMessage(err)
            }
        });
    }

    res.json({
        success: true,
        data
    });
});

/**
 * GET /api/music/recommendations
 * Supports seed_genres, seed_tracks, seed_artists, or genre query param.
 */
exports.getRecommendations = asyncHandler(async (req, res) => {
    const { genre, seed_genres, seed_tracks, seed_artists, limit = 20 } = req.query;

    let data;

    if (genre) {
        try {
            data = await youtubeService.getRecommendationsByGenre(
                genre.split(","),
                Math.min(parseInt(limit, 10) || 20, 50)
            );
        } catch (err) {
            if (!shouldUseYoutubeFallback(err)) throw err;

            return res.json({
                success: true,
                data: {
                    ...emptyRecommendationData,
                    warning: getYoutubeFailureMessage(err)
                }
            });
        }
    } else {
        const params = { limit: Math.min(parseInt(limit, 10) || 20, 50) };
        if (seed_genres) params.seed_genres = seed_genres;
        if (seed_tracks) params.seed_tracks = seed_tracks;
        if (seed_artists) params.seed_artists = seed_artists;

        if (!params.seed_genres && !params.seed_tracks && !params.seed_artists) {
            params.seed_genres = "pop,rock";
        }

        try {
            data = await youtubeService.getRecommendations(params);
        } catch (err) {
            if (!shouldUseYoutubeFallback(err)) throw err;

            return res.json({
                success: true,
                data: {
                    ...emptyRecommendationData,
                    warning: getYoutubeFailureMessage(err)
                }
            });
        }
    }

    res.json({
        success: true,
        data
    });
});

/**
 * GET /api/music/featured-playlists
 */
exports.getFeaturedPlaylists = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    let data;
    try {
        data = await youtubeService.getFeaturedPlaylists(limit);
    } catch (err) {
        if (!shouldUseYoutubeFallback(err)) throw err;
        return res.json({
            success: true,
            data: {
                playlists: { items: [], total: 0 },
                warning: getYoutubeFailureMessage(err)
            }
        });
    }

    res.json({
        success: true,
        data
    });
});

/**
 * GET /api/music/artist/:id/related
 */
exports.getRelatedArtists = asyncHandler(async (req, res) => {
    let data;
    try {
        data = await youtubeService.getRelatedArtists(req.params.id);
    } catch (err) {
        if (!shouldUseYoutubeFallback(err)) throw err;
        return res.json({
            success: true,
            data: {
                artists: [],
                warning: getYoutubeFailureMessage(err)
            }
        });
    }

    res.json({
        success: true,
        data
    });
});
