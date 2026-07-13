const mongoose = require("mongoose");

const listeningHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        song: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
            index: true
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
        },
        playedAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    { timestamps: true }
);

listeningHistorySchema.index({ userId: 1, playedAt: -1 });
listeningHistorySchema.index({ userId: 1, song: 1, playedAt: -1 });

module.exports = mongoose.model("ListeningHistory", listeningHistorySchema);
