const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Album title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    artist: {
      type: String,
      required: [true, "Artist name is required"],
      trim: true,
      maxlength: [100, "Artist name cannot exceed 100 characters"]
    },
    cover: {
      type: String,
      default: ""
    },
    genre: {
      type: String,
      enum: ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop", "EDM", "Sinhala", "Tamil", "English", "Instrumental", ""],
      default: ""
    },
    songs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song"
    }],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    releaseDate: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      maxlength: 1000,
      default: ""
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: "approved",
      enum: ["pending", "approved", "rejected"]
    },
    rejectionReason: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Index for search functionality
albumSchema.index({ title: "text", artist: "text", genre: 1 });

module.exports = mongoose.model("Album", albumSchema);
