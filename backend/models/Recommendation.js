const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        song: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
            required: true,
            index: true
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        reason: {
            type: String,
            default: ""
        },
        source: {
            type: String,
            default: "ai",
            enum: ["ai", "mood", "history", "genre", "search", "lyrics"]
        }
    },
    { timestamps: true }
);

recommendationSchema.index({ user: 1, score: -1, createdAt: -1 });
recommendationSchema.index({ user: 1, song: 1 }, { unique: true });

module.exports = mongoose.model("Recommendation", recommendationSchema);
