const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        sessionId: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString()
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
