const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const Download = require("../models/Download");

router.use(authMiddleware);

router.get("/", asyncHandler(async (req, res) => {
  const downloads = await Download.find({ user: req.userId })
    .populate("song")
    .sort({ downloadedAt: -1 });

  res.json({
    success: true,
    count: downloads.length,
    downloads
  });
}));

router.delete("/:songId", asyncHandler(async (req, res) => {
  const download = await Download.findOneAndDelete({
    user: req.userId,
    song: req.params.songId
  });

  if (!download) {
    return res.status(404).json({ success: false, message: "Download not found" });
  }

  res.json({
    success: true,
    message: "Download removed"
  });
}));

module.exports = router;
