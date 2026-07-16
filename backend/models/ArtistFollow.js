const mongoose = require("mongoose");

const artistFollowSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    artistKey: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    artistName: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

artistFollowSchema.index({ follower: 1, artistKey: 1 }, { unique: true });

module.exports = mongoose.model("ArtistFollow", artistFollowSchema);
