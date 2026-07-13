const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { isArtistOrAdmin } = require("../middleware/roleMiddleware");
const { audioUpload, coverUpload } = require("../middleware/uploadMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const Song = require("../models/Song");
const Download = require("../models/Download");

const hasUserId = (ids, userId) => ids.some((id) => id.toString() === userId.toString());
const removeUserId = (ids, userId) => ids.filter((id) => id.toString() !== userId.toString());

// Upload song with audio and cover
router.post("/upload", authMiddleware, isArtistOrAdmin, audioUpload.single("audio"), asyncHandler(async (req, res) => {
  const { title, artist, album, genre, mood, lyrics, duration, isPremium } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Audio file is required" });
  }
  
  const song = await Song.create({
    title,
    artist,
    album: album || "",
    genre,
    mood: mood || "",
    audioURL: `/uploads/audio/${req.file.filename}`,
    coverImage: "",
    lyrics: lyrics || "",
    duration: Number(duration) || 0,
    isPremium: isPremium === "true" || isPremium === true,
    uploadedBy: req.userId
  });

  res.status(201).json({
    success: true,
    message: "Song uploaded successfully",
    song
  });
}));

// Upload cover image for song
router.post("/:id/cover", authMiddleware, isArtistOrAdmin, coverUpload.single("cover"), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Cover image is required" });
  }

  const song = await Song.findById(req.params.id);
  
  if (!song) {
    return res.status(404).json({ success: false, message: "Song not found" });
  }

  if (song.uploadedBy.toString() !== req.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  song.coverImage = `/uploads/covers/${req.file.filename}`;
  await song.save();

  res.json({
    success: true,
    message: "Cover image uploaded successfully",
    song
  });
}));

// Update song lyrics
router.put("/:id/lyrics", authMiddleware, isArtistOrAdmin, asyncHandler(async (req, res) => {
  const { lyrics } = req.body;
  
  const song = await Song.findById(req.params.id);
  
  if (!song) {
    return res.status(404).json({ success: false, message: "Song not found" });
  }

  if (song.uploadedBy.toString() !== req.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  song.lyrics = lyrics;
  await song.save();

  res.json({
    success: true,
    message: "Lyrics updated successfully",
    song
  });
}));

// Like song
router.post("/:id/like", authMiddleware, asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id);
  
  if (!song) {
    return res.status(404).json({ success: false, message: "Song not found" });
  }

  const userId = req.userId;
  const alreadyLiked = hasUserId(song.likedBy, userId);
  
  if (alreadyLiked) {
    // Unlike
    song.likedBy = removeUserId(song.likedBy, userId);
    song.likes = Math.max(0, song.likes - 1);
  } else {
    // Like
    if (hasUserId(song.dislikedBy, userId)) {
      song.dislikedBy = removeUserId(song.dislikedBy, userId);
      song.dislikes = Math.max(0, song.dislikes - 1);
    }
    song.likedBy.push(userId);
    song.likes += 1;
  }

  await song.save();

  res.json({
    success: true,
    message: alreadyLiked ? "Song unliked" : "Song liked",
    likes: song.likes,
    dislikes: song.dislikes
  });
}));

// Dislike song
router.post("/:id/dislike", authMiddleware, asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id);
  
  if (!song) {
    return res.status(404).json({ success: false, message: "Song not found" });
  }

  const userId = req.userId;
  const alreadyDisliked = hasUserId(song.dislikedBy, userId);
  
  if (alreadyDisliked) {
    // Remove dislike
    song.dislikedBy = removeUserId(song.dislikedBy, userId);
    song.dislikes = Math.max(0, song.dislikes - 1);
  } else {
    // Dislike
    if (hasUserId(song.likedBy, userId)) {
      song.likedBy = removeUserId(song.likedBy, userId);
      song.likes = Math.max(0, song.likes - 1);
    }
    song.dislikedBy.push(userId);
    song.dislikes += 1;
  }

  await song.save();

  res.json({
    success: true,
    message: alreadyDisliked ? "Dislike removed" : "Song disliked",
    likes: song.likes,
    dislikes: song.dislikes
  });
}));

// Increment play count
router.post("/:id/play", asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id);
  
  if (!song) {
    return res.status(404).json({ success: false, message: "Song not found" });
  }

  song.plays += 1;
  await song.save();

  res.json({
    success: true,
    plays: song.plays
  });
}));

// Download song (premium only)
router.get("/:id/download", authMiddleware, asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id).populate("uploadedBy");
  
  if (!song) {
    return res.status(404).json({ success: false, message: "Song not found" });
  }

  const user = await require("../models/User").findById(req.userId);
  
  if (user.subscription !== "premium") {
    return res.status(403).json({ success: false, message: "Premium subscription required" });
  }

  song.downloads += 1;
  await song.save();
  await Download.findOneAndUpdate(
    { user: req.userId, song: song._id },
    { downloadedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({
    success: true,
    downloadUrl: song.audioURL
  });
}));

// Search songs
router.get("/search", asyncHandler(async (req, res) => {
  const { query, title, artist, album, genre, mood } = req.query;
  
  let searchCriteria = {};
  
  if (query) {
    searchCriteria.$or = [
      { title: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
      { album: { $regex: query, $options: "i" } }
    ];
  }
  
  if (title) {
    searchCriteria.title = { $regex: title, $options: "i" };
  }

  if (artist) {
    searchCriteria.artist = { $regex: artist, $options: "i" };
  }

  if (album) {
    searchCriteria.album = { $regex: album, $options: "i" };
  }

  if (genre) {
    searchCriteria.genre = genre;
  }
  
  if (mood) {
    searchCriteria.mood = mood;
  }

  const songs = await Song.find(searchCriteria).sort({ plays: -1 });

  res.json({
    success: true,
    count: songs.length,
    songs
  });
}));

// Get trending songs
router.get("/trending", asyncHandler(async (req, res) => {
  const songs = await Song.find().sort({ plays: -1, likes: -1 }).limit(20);

  res.json({
    success: true,
    songs
  });
}));

// Get song by ID
router.get("/:id", asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id).populate("uploadedBy", "username profileImage");
  
  if (!song) {
    return res.status(404).json({ success: false, message: "Song not found" });
  }

  song.views += 1;
  await song.save();

  res.json({
    success: true,
    song
  });
}));

// Get all songs
router.get("/", asyncHandler(async (req, res) => {
  const { genre, mood, page = 1, limit = 20 } = req.query;
  
  let filter = {};
  if (genre) filter.genre = genre;
  if (mood) filter.mood = mood;

  const songs = await Song.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Song.countDocuments(filter);

  res.json({
    success: true,
    count: songs.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    songs
  });
}));

module.exports = router;
