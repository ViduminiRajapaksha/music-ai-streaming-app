const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const Follow = require("../models/Follow");
const User = require("../models/User");

router.use(authMiddleware);

// Follow a user (artist)
router.post("/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;

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

  const count = await Follow.countDocuments({ following: userId });

  res.json({
    success: true,
    count
  });
}));

// Get following count
router.get("/following/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const count = await Follow.countDocuments({ follower: userId });

  res.json({
    success: true,
    count
  });
}));

// Get user's followers list
router.get("/list/followers/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;

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

  const follows = await Follow.find({ follower: userId })
    .populate("following", "username profileImage")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    following: follows.map(f => f.following)
  });
}));

module.exports = router;
