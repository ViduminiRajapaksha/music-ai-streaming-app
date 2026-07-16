const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        youtubeId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        artist: {
            type: String,
            required: true
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

// Prevent duplicate favorites per user
favoriteSchema.index({ userId: 1, youtubeId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
