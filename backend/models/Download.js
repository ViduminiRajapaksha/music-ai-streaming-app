const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema(
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
        downloadedAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    { timestamps: true }
);

downloadSchema.index({ user: 1, song: 1 }, { unique: true });
downloadSchema.index({ user: 1, downloadedAt: -1 });

module.exports = mongoose.model("Download", downloadSchema);
