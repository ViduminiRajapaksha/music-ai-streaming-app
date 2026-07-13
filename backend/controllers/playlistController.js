const Playlist = require("../models/Playlist");
const Song = require("../models/Song");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const crypto = require("crypto");

/**
 * POST /api/playlists
 */
exports.createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const playlist = await Playlist.create({
        user: req.userId,
        name: name.trim(),
        description: description || "",
        songs: []
    });

    res.status(201).json({
        success: true,
        message: "Playlist created successfully",
        playlist
    });
});

/**
 * GET /api/playlists
 */
exports.getPlaylists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.find({ user: req.userId }).sort({
        updatedAt: -1
    });

    res.json({
        success: true,
        count: playlists.length,
        playlists
    });
});

/**
 * GET /api/playlists/:id
 */
exports.getPlaylistById = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findOne({
        _id: req.params.id,
        user: req.userId
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.json({
        success: true,
        playlist
    });
});

/**
 * PUT /api/playlists/:id — rename or update description
 */
exports.updatePlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description;

    const playlist = await Playlist.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        updates,
        { new: true, runValidators: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.json({
        success: true,
        message: "Playlist updated successfully",
        playlist
    });
});

/**
 * DELETE /api/playlists/:id
 */
exports.deletePlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findOneAndDelete({
        _id: req.params.id,
        user: req.userId
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.json({
        success: true,
        message: "Playlist deleted successfully"
    });
});

/**
 * POST /api/playlists/:id/add-song
 */
exports.addSongToPlaylist = asyncHandler(async (req, res) => {
    const {
        songId,
        youtubeId,
        title,
        artist,
        album,
        image,
        previewUrl,
        durationMs
    } = req.body;

    const playlist = await Playlist.findOne({
        _id: req.params.id,
        user: req.userId
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    let songPayload = {
        songId,
        youtubeId,
        title,
        artist: artist || "",
        album: album || "",
        image: image || "",
        previewUrl: previewUrl || "",
        durationMs: durationMs || 0
    };

    if (songId) {
        const song = await Song.findById(songId);
        if (!song) {
            throw new ApiError(404, "Song not found");
        }

        songPayload = {
            songId: song._id,
            youtubeId: song._id.toString(),
            title: song.title,
            artist: song.artist || "",
            album: song.album || "",
            image: song.coverImage || "",
            previewUrl: song.audioURL || "",
            durationMs: (song.duration || 0) * 1000
        };
    }

    const alreadyAdded = playlist.songs.some((song) => {
        if (songPayload.songId && song.songId) {
            return song.songId.toString() === songPayload.songId.toString();
        }
        return song.youtubeId && song.youtubeId === songPayload.youtubeId;
    });

    if (alreadyAdded) {
        throw new ApiError(400, "Song is already in this playlist");
    }

    playlist.songs.push(songPayload);

    await playlist.save();

    res.json({
        success: true,
        message: "Song added to playlist",
        playlist
    });
});

/**
 * DELETE /api/playlists/:id/remove-song/:songId
 */
exports.removeSongFromPlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findOne({
        _id: req.params.id,
        user: req.userId
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    const initialLength = playlist.songs.length;
    playlist.songs = playlist.songs.filter(
        (song) => song._id.toString() !== req.params.songId
    );

    if (playlist.songs.length === initialLength) {
        throw new ApiError(404, "Song not found in playlist");
    }

    await playlist.save();

    res.json({
        success: true,
        message: "Song removed from playlist",
        playlist
    });
});

/**
 * POST /api/playlists/:id/share
 */
exports.sharePlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findOne({
        _id: req.params.id,
        user: req.userId
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.shareCode) {
        playlist.shareCode = crypto.randomBytes(6).toString("hex");
    }
    playlist.isPublic = true;
    await playlist.save();

    res.json({
        success: true,
        message: "Playlist sharing enabled",
        shareCode: playlist.shareCode,
        playlist
    });
});

/**
 * GET /api/playlists/shared/:shareCode
 */
exports.getSharedPlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findOne({
        shareCode: req.params.shareCode,
        isPublic: true
    }).populate("user", "username profileImage");

    if (!playlist) {
        throw new ApiError(404, "Shared playlist not found");
    }

    res.json({
        success: true,
        playlist
    });
});

/**
 * POST /api/playlists/:id/collaborators
 */
exports.addCollaborator = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const collaborator = await User.findById(userId);
    if (!collaborator) {
        throw new ApiError(404, "Collaborator not found");
    }

    const playlist = await Playlist.findOne({
        _id: req.params.id,
        user: req.userId
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.collaborators.some((id) => id.toString() === userId)) {
        playlist.collaborators.push(userId);
        await playlist.save();
    }

    res.json({
        success: true,
        message: "Collaborator added",
        playlist
    });
});

/**
 * DELETE /api/playlists/:id/collaborators/:userId
 */
exports.removeCollaborator = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findOne({
        _id: req.params.id,
        user: req.userId
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.collaborators = playlist.collaborators.filter(
        (id) => id.toString() !== req.params.userId
    );
    await playlist.save();

    res.json({
        success: true,
        message: "Collaborator removed",
        playlist
    });
});
