const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { isArtistOrAdmin } = require("../middleware/roleMiddleware");
const { audioUpload, coverUpload } = require("../middleware/uploadMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const Podcast = require("../models/Podcast");

router.post("/upload", authMiddleware, isArtistOrAdmin, audioUpload.single("audio"), asyncHandler(async (req, res) => {
  const { title, artist, episode, genre, mood, description, duration } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Podcast audio is required" });
  }

  const podcast = await Podcast.create({
    title,
    artist,
    episode: episode || "",
    genre: genre || "English",
    mood: mood || "",
    description: description || "",
    duration: Number(duration) || 0,
    audioURL: `/uploads/audio/${req.file.filename}`,
    uploadedBy: req.userId
  });

  res.status(201).json({
    success: true,
    message: "Podcast uploaded successfully",
    podcast
  });
}));

router.post("/:id/cover", authMiddleware, isArtistOrAdmin, coverUpload.single("cover"), asyncHandler(async (req, res) => {
  const podcast = await Podcast.findById(req.params.id);

  if (!podcast) {
    return res.status(404).json({ success: false, message: "Podcast not found" });
  }

  if (podcast.uploadedBy.toString() !== req.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  podcast.coverImage = `/uploads/covers/${req.file.filename}`;
  await podcast.save();

  res.json({
    success: true,
    message: "Podcast cover uploaded successfully",
    podcast
  });
}));

router.post("/:id/play", asyncHandler(async (req, res) => {
  const podcast = await Podcast.findByIdAndUpdate(
    req.params.id,
    { $inc: { plays: 1 } },
    { new: true }
  );

  if (!podcast) {
    return res.status(404).json({ success: false, message: "Podcast not found" });
  }

  res.json({
    success: true,
    plays: podcast.plays
  });
}));

router.post("/:id/like", authMiddleware, asyncHandler(async (req, res) => {
  const podcast = await Podcast.findById(req.params.id);

  if (!podcast) {
    return res.status(404).json({ success: false, message: "Podcast not found" });
  }

  const userId = req.userId;
  const alreadyLiked = podcast.likedBy.some((id) => id.toString() === userId.toString());

  if (alreadyLiked) {
    podcast.likedBy = podcast.likedBy.filter((id) => id.toString() !== userId.toString());
    podcast.likes = Math.max(0, podcast.likes - 1);
  } else {
    podcast.likedBy.push(userId);
    podcast.likes += 1;
  }

  await podcast.save();

  res.json({
    success: true,
    message: alreadyLiked ? "Podcast unliked" : "Podcast liked",
    likes: podcast.likes
  });
}));

router.get("/search", asyncHandler(async (req, res) => {
  const { query, genre, mood, artist } = req.query;
  const filter = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
      { episode: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ];
  }

  if (genre) filter.genre = genre;
  if (mood) filter.mood = mood;
  if (artist) filter.artist = { $regex: artist, $options: "i" };

  const podcasts = await Podcast.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: podcasts.length,
    podcasts
  });
}));

router.get("/trending", asyncHandler(async (req, res) => {
  const podcasts = await Podcast.find().sort({ plays: -1, likes: -1 }).limit(20);

  res.json({
    success: true,
    podcasts
  });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const podcast = await Podcast.findById(req.params.id).populate("uploadedBy", "username profileImage");

  if (!podcast) {
    return res.status(404).json({ success: false, message: "Podcast not found" });
  }

  podcast.views += 1;
  await podcast.save();

  res.json({
    success: true,
    podcast
  });
}));

router.get("/", asyncHandler(async (req, res) => {
  const { genre, mood, artist, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (genre) filter.genre = genre;
  if (mood) filter.mood = mood;
  if (artist) filter.artist = { $regex: artist, $options: "i" };

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 20;
  const podcasts = await Podcast.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const total = await Podcast.countDocuments(filter);

  res.json({
    success: true,
    count: podcasts.length,
    total,
    page: pageNumber,
    pages: Math.ceil(total / limitNumber),
    podcasts
  });
}));

module.exports = router;
