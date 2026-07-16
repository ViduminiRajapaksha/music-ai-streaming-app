const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const Follow = require("../models/Follow");
const ArtistFollow = require("../models/ArtistFollow");
const User = require("../models/User");
const mongoose = require("mongoose");

router.use(authMiddleware);

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const getArtistKey = (value) => decodeURIComponent(value).trim().toLowerCase();
const getArtistName = (value, body = {}) => (body.artistName || body.name || decodeURIComponent(value)).trim();

// Follow a user artist account or local library artist name.
router.post("/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    const artistName = getArtistName(userId, req.body);
    const artistKey = getArtistKey(artistName);

    if (!artistName) {
      return res.status(400).json({ success: false, message: "Artist name is required" });
    }

    const existingFollow = await ArtistFollow.findOne({
      follower: req.userId,
      artistKey
    });

    if (existingFollow) {
      return res.status(400).json({ success: false, message: "Already following" });
    }

    const follow = await ArtistFollow.create({
      follower: req.userId,
      artistKey,
      artistName
    });

    return res.json({
      success: true,
      message: "Followed successfully",
      follow
    });
  }

  if (userId === req.userId) {
    return res.status(400).json({ success: false, message: "Cannot follow yourself" });
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const existingFollow = await Follow.findOne({
    follower: req.userId,
    following: userId
  });

  if (existingFollow) {
    return res.status(400).json({ success: false, message: "Already following" });
  }

  const follow = await Follow.create({
    follower: req.userId,
    following: userId
  });

  res.json({
    success: true,
    message: "Followed successfully",
    follow
  });
}));

// Unfollow a user
router.delete("/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    const follow = await ArtistFollow.findOneAndDelete({
      follower: req.userId,
      artistKey: getArtistKey(userId)
    });

    if (!follow) {
      return res.status(404).json({ success: false, message: "Not following this artist" });
    }

    return res.json({
      success: true,
      message: "Unfollowed successfully"
    });
  }

  const follow = await Follow.findOneAndDelete({
    follower: req.userId,
    following: userId
  });

  if (!follow) {
    return res.status(404).json({ success: false, message: "Not following this user" });
  }

  res.json({
    success: true,
    message: "Unfollowed successfully"
  });
}));

// Check if following a user
router.get("/check/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    const follow = await ArtistFollow.findOne({
      follower: req.userId,
      artistKey: getArtistKey(userId)
    });

    return res.json({
      success: true,
      isFollowing: !!follow
    });
  }

  const follow = await Follow.findOne({
    follower: req.userId,
    following: userId
  });

  res.json({
    success: true,
    isFollowing: !!follow
  });
}));

// Get followers count
router.get("/followers/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    const count = await ArtistFollow.countDocuments({ artistKey: getArtistKey(userId) });

    return res.json({
      success: true,
      count
    });
  }

  const count = await Follow.countDocuments({ following: userId });

  res.json({
    success: true,
    count
  });
}));

// Get following count
router.get("/following/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }

  const [userFollowCount, artistFollowCount] = await Promise.all([
    Follow.countDocuments({ follower: userId }),
    ArtistFollow.countDocuments({ follower: userId })
  ]);

  res.json({
    success: true,
    count: userFollowCount + artistFollowCount
  });
}));

// Get user's followers list
router.get("/list/followers/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    const follows = await ArtistFollow.find({ artistKey: getArtistKey(userId) })
      .populate("follower", "username profileImage")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      followers: follows.map(f => f.follower)
    });
  }

  const follows = await Follow.find({ following: userId })
    .populate("follower", "username profileImage")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    followers: follows.map(f => f.follower)
  });
}));

// Get user's following list
router.get("/list/following/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }

  const [userFollows, artistFollows] = await Promise.all([
    Follow.find({ follower: userId })
      .populate("following", "username profileImage")
      .sort({ createdAt: -1 }),
    ArtistFollow.find({ follower: userId }).sort({ createdAt: -1 })
  ]);

  res.json({
    success: true,
    following: [
      ...userFollows.map(f => f.following),
      ...artistFollows.map(f => ({
        id: f.artistName,
        name: f.artistName,
        type: "artist"
      }))
    ]
  });
}));

module.exports = router;
