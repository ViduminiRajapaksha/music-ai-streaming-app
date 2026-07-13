const User = require("../models/User");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Favorite = require("../models/Favorite");
const Playlist = require("../models/Playlist");
const ChatHistory = require("../models/ChatHistory");
const Download = require("../models/Download");
const ListeningHistory = require("../models/ListeningHistory");
const AIHistory = require("../models/AIHistory");
const Recommendation = require("../models/Recommendation");
const RecommendationHistory = require("../models/RecommendationHistory");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const PREMIUM_PRICE = Number(process.env.PREMIUM_MONTHLY_PRICE || 9.99);

const parsePaging = (query) => ({
  page: Math.max(parseInt(query.page, 10) || 1, 1),
  limit: Math.min(parseInt(query.limit, 10) || 25, 100)
});

const estimateRevenue = async () => {
  const premiumUsers = await User.countDocuments({ subscription: "premium" });
  return {
    premiumUsers,
    monthlyRecurringRevenue: Number((premiumUsers * PREMIUM_PRICE).toFixed(2)),
    annualRunRate: Number((premiumUsers * PREMIUM_PRICE * 12).toFixed(2)),
    currency: "USD"
  };
};

const getUserGrowth = async () => User.aggregate([
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" }
      },
      users: { $sum: 1 }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  { $limit: 30 }
]);

const getTrendingGenres = async () => Song.aggregate([
  {
    $group: {
      _id: "$genre",
      songs: { $sum: 1 },
      plays: { $sum: "$plays" },
      likes: { $sum: "$likes" },
      downloads: { $sum: "$downloads" }
    }
  },
  { $sort: { plays: -1, songs: -1 } },
  { $limit: 10 }
]);

const getTopArtists = async () => Song.aggregate([
  {
    $group: {
      _id: "$artist",
      songs: { $sum: 1 },
      plays: { $sum: "$plays" },
      likes: { $sum: "$likes" },
      downloads: { $sum: "$downloads" }
    }
  },
  { $sort: { plays: -1, likes: -1 } },
  { $limit: 10 }
]);

exports.getDashboard = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeSince = new Date(Date.now() - 15 * 60 * 1000);

  const [
    users,
    activeUsers,
    artists,
    pendingArtists,
    songs,
    pendingSongs,
    albums,
    pendingAlbums,
    downloads,
    listeningEvents,
    aiUsage,
    revenue,
    topSongs,
    topArtists,
    trendingGenres
  ] = await Promise.all([
    User.countDocuments(),
    ListeningHistory.distinct("userId", { playedAt: { $gte: activeSince } }),
    User.countDocuments({ role: "artist" }),
    User.countDocuments({ role: "artist", artistStatus: "pending" }),
    Song.countDocuments(),
    Song.countDocuments({ status: "pending" }),
    Album.countDocuments(),
    Album.countDocuments({ status: "pending" }),
    Download.countDocuments(),
    ListeningHistory.countDocuments({ playedAt: { $gte: since } }),
    AIHistory.countDocuments({ createdAt: { $gte: since } }),
    estimateRevenue(),
    Song.find().sort({ plays: -1, likes: -1 }).limit(5),
    getTopArtists(),
    getTrendingGenres()
  ]);

  res.json({
    success: true,
    stats: {
      users,
      activeUsers: activeUsers.length,
      artists,
      pendingArtists,
      songs,
      pendingSongs,
      albums,
      pendingAlbums,
      downloads,
      listeningEvents,
      aiUsage,
      revenue
    },
    topSongs,
    topArtists,
    trendingGenres
  });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req.query);
  const { role, status, subscription, search } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (subscription) filter.subscription = subscription;
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter)
  ]);

  res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const allowed = ["role", "status", "subscription", "artistStatus", "suspendedReason"];
  const updates = {};

  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });
  if (updates.status === "suspended") updates.suspendedAt = new Date();
  if (updates.status === "active") {
    updates.suspendedAt = undefined;
    updates.suspendedReason = "";
  }
  if (updates.role === "artist" && !updates.artistStatus) updates.artistStatus = "approved";

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, message: "User updated", user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  await Promise.all([
    Favorite.deleteMany({ userId }),
    Playlist.deleteMany({ user: userId }),
    ChatHistory.deleteMany({ userId }),
    AIHistory.deleteMany({ user: userId }),
    ListeningHistory.deleteMany({ userId }),
    Download.deleteMany({ user: userId }),
    Recommendation.deleteMany({ user: userId }),
    RecommendationHistory.deleteMany({ userId })
  ]);

  res.json({ success: true, message: "User deleted" });
});

exports.getArtists = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = { role: "artist" };
  if (status) filter.artistStatus = status;
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const artists = await User.find(filter).sort({ createdAt: -1 });
  const artistNames = artists.map((artist) => artist.username);
  const songCounts = await Song.aggregate([
    { $match: { artist: { $in: artistNames } } },
    { $group: { _id: "$artist", songs: { $sum: 1 }, plays: { $sum: "$plays" } } }
  ]);
  const stats = new Map(songCounts.map((item) => [item._id, item]));

  res.json({
    success: true,
    artists: artists.map((artist) => ({
      ...artist.toObject(),
      songs: stats.get(artist.username)?.songs || 0,
      plays: stats.get(artist.username)?.plays || 0
    }))
  });
});

exports.approveArtist = asyncHandler(async (req, res) => {
  const artist = await User.findByIdAndUpdate(
    req.params.id,
    { role: "artist", artistStatus: "approved", status: "active", suspendedReason: "" },
    { new: true, runValidators: true }
  );
  if (!artist) throw new ApiError(404, "Artist not found");
  res.json({ success: true, message: "Artist approved", artist });
});

exports.suspendArtist = asyncHandler(async (req, res) => {
  const artist = await User.findByIdAndUpdate(
    req.params.id,
    {
      role: "artist",
      artistStatus: "suspended",
      status: "suspended",
      suspendedAt: new Date(),
      suspendedReason: req.body.reason || ""
    },
    { new: true, runValidators: true }
  );
  if (!artist) throw new ApiError(404, "Artist not found");
  res.json({ success: true, message: "Artist suspended", artist });
});

exports.deleteArtist = asyncHandler(async (req, res) => {
  const artist = await User.findById(req.params.id);
  if (!artist || artist.role !== "artist") throw new ApiError(404, "Artist not found");
  await Promise.all([
    Song.deleteMany({ uploadedBy: artist._id }),
    Album.deleteMany({ uploadedBy: artist._id }),
    artist.deleteOne()
  ]);
  res.json({ success: true, message: "Artist and uploaded catalog deleted" });
});

exports.getSongs = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req.query);
  const { status, genre, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (genre) filter.genre = genre;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { artist: { $regex: search, $options: "i" } },
      { album: { $regex: search, $options: "i" } }
    ];
  }

  const [songs, total] = await Promise.all([
    Song.find(filter).populate("uploadedBy", "username email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Song.countDocuments(filter)
  ]);
  res.json({ success: true, songs, total, page, pages: Math.ceil(total / limit) });
});

exports.updateSong = asyncHandler(async (req, res) => {
  const allowed = ["title", "artist", "album", "genre", "mood", "lyrics", "status", "isPremium", "isFeatured", "rejectionReason"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });
  const song = await Song.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!song) throw new ApiError(404, "Song not found");
  res.json({ success: true, message: "Song updated", song });
});

exports.deleteSong = asyncHandler(async (req, res) => {
  const song = await Song.findByIdAndDelete(req.params.id);
  if (!song) throw new ApiError(404, "Song not found");
  res.json({ success: true, message: "Song deleted" });
});

exports.getAlbums = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req.query);
  const { status, genre, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (genre) filter.genre = genre;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { artist: { $regex: search, $options: "i" } }
    ];
  }

  const [albums, total] = await Promise.all([
    Album.find(filter).populate("uploadedBy", "username email").populate("songs").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Album.countDocuments(filter)
  ]);
  res.json({ success: true, albums, total, page, pages: Math.ceil(total / limit) });
});

exports.updateAlbum = asyncHandler(async (req, res) => {
  const allowed = ["title", "artist", "genre", "description", "status", "isFeatured", "rejectionReason"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });
  const album = await Album.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!album) throw new ApiError(404, "Album not found");
  res.json({ success: true, message: "Album updated", album });
});

exports.deleteAlbum = asyncHandler(async (req, res) => {
  const album = await Album.findByIdAndDelete(req.params.id);
  if (!album) throw new ApiError(404, "Album not found");
  res.json({ success: true, message: "Album deleted" });
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  const [
    topSongs,
    topArtists,
    trendingGenres,
    userGrowth,
    revenue,
    popularMoods,
    aiUsage,
    mostRequestedSongs
  ] = await Promise.all([
    Song.find().sort({ plays: -1, likes: -1 }).limit(10),
    getTopArtists(),
    getTrendingGenres(),
    getUserGrowth(),
    estimateRevenue(),
    RecommendationHistory.aggregate([
      { $match: { mood: { $ne: "" } } },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    AIHistory.aggregate([
      { $group: { _id: "$intent", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    AIHistory.aggregate([
      { $match: { prompt: { $regex: "song|track|music", $options: "i" } } },
      { $group: { _id: "$prompt", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  const listeningTime = await ListeningHistory.aggregate([
    { $group: { _id: null, totalMs: { $sum: "$durationMs" }, events: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    topSongs,
    topArtists,
    trendingGenres,
    userGrowth,
    revenue,
    popularMoods,
    aiUsage,
    mostRequestedSongs,
    listeningTime: listeningTime[0] || { totalMs: 0, events: 0 }
  });
});

exports.getReports = asyncHandler(async (req, res) => {
  const [downloads, listening, subscriptions, revenue] = await Promise.all([
    Download.find().populate("user", "username email").populate("song").sort({ downloadedAt: -1 }).limit(100),
    ListeningHistory.find().populate("song").sort({ playedAt: -1 }).limit(100),
    User.find({ subscription: "premium" }).sort({ updatedAt: -1 }).limit(100),
    estimateRevenue()
  ]);

  res.json({
    success: true,
    downloads,
    listening,
    subscriptions,
    revenue
  });
});

exports.getSettings = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    settings: {
      premiumMonthlyPrice: PREMIUM_PRICE,
      moderationDefaults: {
        songs: "approved",
        albums: "approved",
        artists: "none"
      },
      revenueCurrency: "USD",
      analyticsWindowDays: 30
    }
  });
});
