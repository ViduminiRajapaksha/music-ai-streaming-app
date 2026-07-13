const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Song title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    artist: {
      type: String,
      required: [true, "Artist name is required"],
      trim: true,
      maxlength: [100, "Artist name cannot exceed 100 characters"]
    },
    album: {
      type: String,
      trim: true,
      default: ""
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      enum: ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop", "EDM", "Sinhala", "Tamil", "English", "Instrumental"]
    },
    mood: {
      type: String,
      enum: ["Happy", "Sad", "Energetic", "Calm", "Romantic", "Focus", "Party", "Chill", ""],
      default: ""
    },
    audioURL: {
      type: String,
      required: [true, "Audio URL is required"]
    },
    coverImage: {
      type: String,
      default: ""
    },
    lyrics: {
      type: String,
      default: ""
    },
    duration: {
      type: Number,
      default: 0
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    plays: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    isPremium: {
      type: Boolean,
      default: false
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
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    dislikedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  { timestamps: true }
);

// Index for search functionality
songSchema.index({ title: "text", artist: "text", album: "text", genre: 1, mood: 1 });

module.exports = mongoose.model("Song", songSchema);
