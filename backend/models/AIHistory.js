const mongoose = require("mongoose");

const aiHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        prompt: {
            type: String,
            required: true,
            trim: true
        },
        response: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        intent: {
            type: String,
            default: "chat",
            enum: ["chat", "mood", "recommendation", "smart-search", "lyrics", "playlist"]
        }
    },
    { timestamps: true }
);

aiHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("AIHistory", aiHistorySchema);
