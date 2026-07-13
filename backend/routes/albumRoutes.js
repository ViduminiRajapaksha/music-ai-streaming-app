const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { isArtistOrAdmin } = require("../middleware/roleMiddleware");
const { coverUpload } = require("../middleware/uploadMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const Album = require("../models/Album");
const Song = require("../models/Song");

// Create album
router.post("/", authMiddleware, isArtistOrAdmin, asyncHandler(async (req, res) => {
  const { title, artist, genre, description, releaseDate } = req.body;
  
  const album = await Album.create({
    title,
    artist,
    genre: genre || "",
    description: description || "",
    releaseDate: releaseDate || Date.now(),
    uploadedBy: req.userId
  });

  res.status(201).json({
    success: true,
    message: "Album created successfully",
    album
  });
}));

// Upload album cover
router.post("/:id/cover", authMiddleware, isArtistOrAdmin, coverUpload.single("cover"), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Cover image is required" });
  }

  const album = await Album.findById(req.params.id);
  
  if (!album) {
    return res.status(404).json({ success: false, message: "Album not found" });
  }

  if (album.uploadedBy.toString() !== req.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  album.cover = `/uploads/covers/${req.file.filename}`;
  await album.save();

  res.json({
    success: true,
    message: "Cover uploaded successfully",
    album
  });
}));

// Add song to album
router.post("/:id/songs", authMiddleware, isArtistOrAdmin, asyncHandler(async (req, res) => {
  const { songId } = req.body;
  
  const album = await Album.findById(req.params.id);
  
  if (!album) {
    return res.status(404).json({ success: false, message: "Album not found" });
  }

  if (album.uploadedBy.toString() !== req.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const song = await Song.findById(songId);
  
  if (!song) {
    return res.status(404).json({ success: false, message: "Song not found" });
  }

  if (album.songs.includes(songId)) {
    return res.status(400).json({ success: false, message: "Song already in album" });
  }

  album.songs.push(songId);
  await album.save();

  res.json({
    success: true,
    message: "Song added to album",
    album
  });
}));

// Remove song from album
router.delete("/:id/songs/:songId", authMiddleware, isArtistOrAdmin, asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id);
  
  if (!album) {
    return res.status(404).json({ success: false, message: "Album not found" });
  }

  if (album.uploadedBy.toString() !== req.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  album.songs = album.songs.filter(id => id.toString() !== req.params.songId);
  await album.save();

  res.json({
    success: true,
    message: "Song removed from album",
    album
  });
}));

// Update album
router.put("/:id", authMiddleware, isArtistOrAdmin, asyncHandler(async (req, res) => {
  const { title, artist, genre, description } = req.body;
  
  const album = await Album.findById(req.params.id);
  
  if (!album) {
    return res.status(404).json({ success: false, message: "Album not found" });
  }

  if (album.uploadedBy.toString() !== req.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  if (title !== undefined) album.title = title;
  if (artist !== undefined) album.artist = artist;
  if (genre !== undefined) album.genre = genre;
  if (description !== undefined) album.description = description;

  await album.save();

  res.json({
    success: true,
    message: "Album updated successfully",
    album
  });
}));

// Delete album
router.delete("/:id", authMiddleware, isArtistOrAdmin, asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id);
  
  if (!album) {
    return res.status(404).json({ success: false, message: "Album not found" });
  }

  if (album.uploadedBy.toString() !== req.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  await album.deleteOne();

  res.json({
    success: true,
    message: "Album deleted successfully"
  });
}));

// Get album by ID with songs
router.get("/:id", asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id).populate("songs").populate("uploadedBy", "username profileImage");
  
  if (!album) {
    return res.status(404).json({ success: false, message: "Album not found" });
  }

  album.views += 1;
  await album.save();

  res.json({
    success: true,
    album
  });
}));

// Get all albums
router.get("/", asyncHandler(async (req, res) => {
  const { genre, artist, page = 1, limit = 20 } = req.query;
  
  let filter = {};
  if (genre) filter.genre = genre;
  if (artist) filter.artist = { $regex: artist, $options: "i" };

  const albums = await Album.find(filter)
    .populate("uploadedBy", "username")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Album.countDocuments(filter);

  res.json({
    success: true,
    count: albums.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    albums
  });
}));

module.exports = router;
