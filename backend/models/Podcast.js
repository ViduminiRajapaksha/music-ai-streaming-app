const mongoose = require("mongoose");

const podcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Podcast title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    artist: {
      type: String,
      required: [true, "Artist name is required"],
      trim: true,
      maxlength: [100, "Artist name cannot exceed 100 characters"]
    },
    episode: {
      type: String,
      trim: true,
      default: ""
    },
    genre: {
      type: String,
      enum: ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop", "EDM", "Sinhala", "Tamil", "English", "Instrumental"],
      default: "English"
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
    description: {
      type: String,
      maxlength: 2000,
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
    plays: {
      type: Number,
      default: 0
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  { timestamps: true }
);

podcastSchema.index({ title: "text", artist: "text", episode: "text", genre: 1, mood: 1 });

module.exports = mongoose.model("Podcast", podcastSchema);
