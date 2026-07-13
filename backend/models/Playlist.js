const mongoose = require("mongoose");

const playlistSongSchema = new mongoose.Schema(
    {
        songId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song"
        },
        youtubeId: {
            type: String,
            default: ""
        },
        title: {
            type: String,
            required: true
        },
        artist: {
            type: String,
            default: ""
        },
        album: {
            type: String,
            default: ""
        },
        image: {
            type: String,
            default: ""
        },
        previewUrl: {
            type: String,
            default: ""
        },
        durationMs: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

const playlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        name: {
            type: String,
            required: [true, "Playlist name is required"],
            trim: true,
            maxlength: [100, "Playlist name cannot exceed 100 characters"]
        },
        description: {
            type: String,
            default: "",
            maxlength: 500
        },
        songs: [playlistSongSchema],
        isPublic: {
            type: Boolean,
            default: false
        },
        shareCode: {
            type: String,
            unique: true,
            sparse: true
        },
        collaborators: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Playlist", playlistSchema);
