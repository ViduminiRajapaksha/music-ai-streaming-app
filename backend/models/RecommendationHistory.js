const mongoose = require("mongoose");

const recommendationTrackSchema = new mongoose.Schema(
    {
        youtubeId: { type: String, default: "" },
        title: { type: String, default: "" },
        artist: { type: String, default: "" },
        reason: { type: String, default: "" },
        source: { type: String, default: "" },
        score: { type: Number, default: 0 },
        songId: { type: mongoose.Schema.Types.ObjectId, ref: "Song" }
    },
    { _id: false }
);

const recommendationHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ["mood", "personalized", "natural-language", "playlist-generation", "genre"],
            required: true
        },
        prompt: {
            type: String,
            default: ""
        },
        mood: {
            type: String,
            default: ""
        },
        recommendations: {
            type: [recommendationTrackSchema],
            default: []
        },
        youtubeResults: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("RecommendationHistory", recommendationHistorySchema);
