const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const Album = require("../models/Album");
const Podcast = require("../models/Podcast");
const Song = require("../models/Song");

const GENRES = ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop", "EDM", "Sinhala", "Tamil", "English", "Instrumental"];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const summarizeArtists = ({ songs = [], albums = [], podcasts = [] }) => {
  const artistMap = new Map();

  const ensureArtist = (name) => {
    if (!name) return null;
    const current = artistMap.get(name) || {
      id: encodeURIComponent(name),
      name,
      songs: 0,
      albums: 0,
      podcasts: 0,
      plays: 0,
      image: ""
    };
    artistMap.set(name, current);
    return current;
  };

  songs.forEach((song) => {
    const artist = ensureArtist(song.artist);
    if (!artist) return;
    artist.songs += 1;
    artist.plays += song.plays || 0;
    artist.image = artist.image || song.coverImage || "";
  });

  albums.forEach((album) => {
    const artist = ensureArtist(album.artist);
    if (!artist) return;
    artist.albums += 1;
    artist.image = artist.image || album.cover || "";
  });

  podcasts.forEach((podcast) => {
    const artist = ensureArtist(podcast.artist);
    if (!artist) return;
    artist.podcasts += 1;
    artist.plays += podcast.plays || 0;
    artist.image = artist.image || podcast.coverImage || "";
  });

  return [...artistMap.values()].sort((a, b) => b.plays - a.plays || a.name.localeCompare(b.name));
};

const buildSongFilter = ({ query, genre, mood, artist, album }) => {
  const filter = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
      { album: { $regex: query, $options: "i" } },
      { genre: { $regex: query, $options: "i" } },
      { mood: { $regex: query, $options: "i" } }
    ];
  }

  if (genre) filter.genre = genre;
  if (mood) filter.mood = mood;
  if (artist) filter.artist = { $regex: artist, $options: "i" };
  if (album) filter.album = { $regex: album, $options: "i" };

  return filter;
};

router.get("/trending", asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const [songs, albums, podcasts] = await Promise.all([
    Song.find().sort({ plays: -1, likes: -1, views: -1 }).limit(limit),
    Album.find().sort({ views: -1, likes: -1 }).limit(limit),
    Podcast.find().sort({ plays: -1, likes: -1, views: -1 }).limit(limit)
  ]);

  res.json({
    success: true,
    songs,
    albums,
    podcasts
  });
}));

router.get("/artists", asyncHandler(async (req, res) => {
  const [songArtists, albumArtists, podcastArtists] = await Promise.all([
    Song.aggregate([
      { $group: { _id: "$artist", songs: { $sum: 1 }, plays: { $sum: "$plays" }, coverImage: { $first: "$coverImage" } } }
    ]),
    Album.aggregate([
      { $group: { _id: "$artist", albums: { $sum: 1 }, coverImage: { $first: "$cover" } } }
    ]),
    Podcast.aggregate([
      { $group: { _id: "$artist", podcasts: { $sum: 1 }, plays: { $sum: "$plays" }, coverImage: { $first: "$coverImage" } } }
    ])
  ]);

  const artistMap = new Map();
  [...songArtists, ...albumArtists, ...podcastArtists].forEach((entry) => {
    if (!entry._id) return;
    const current = artistMap.get(entry._id) || {
      id: encodeURIComponent(entry._id),
      name: entry._id,
      songs: 0,
      albums: 0,
      podcasts: 0,
      plays: 0,
      image: ""
    };

    current.songs += entry.songs || 0;
    current.albums += entry.albums || 0;
    current.podcasts += entry.podcasts || 0;
    current.plays += entry.plays || 0;
    current.image = current.image || entry.coverImage || "";
    artistMap.set(entry._id, current);
  });

  const artists = [...artistMap.values()].sort((a, b) => b.plays - a.plays || a.name.localeCompare(b.name));

  res.json({
    success: true,
    count: artists.length,
    artists
  });
}));

router.get("/artists/:name", asyncHandler(async (req, res) => {
  const artist = decodeURIComponent(req.params.name);
  const exactArtist = `^${escapeRegex(artist)}$`;

  const [songs, albums, podcasts] = await Promise.all([
    Song.find({ artist: { $regex: exactArtist, $options: "i" } }).sort({ createdAt: -1 }),
    Album.find({ artist: { $regex: exactArtist, $options: "i" } }).sort({ createdAt: -1 }),
    Podcast.find({ artist: { $regex: exactArtist, $options: "i" } }).sort({ createdAt: -1 })
  ]);

  res.json({
    success: true,
    artist: {
      id: encodeURIComponent(artist),
      name: artist,
      image: songs[0]?.coverImage || albums[0]?.cover || podcasts[0]?.coverImage || "",
      songs,
      albums,
      podcasts
    }
  });
}));

router.get("/genres", asyncHandler(async (req, res) => {
  const counts = await Song.aggregate([
    { $group: { _id: "$genre", songs: { $sum: 1 }, plays: { $sum: "$plays" } } }
  ]);

  const countMap = new Map(counts.map((entry) => [entry._id, entry]));
  const genres = GENRES.map((name) => ({
    name,
    songs: countMap.get(name)?.songs || 0,
    plays: countMap.get(name)?.plays || 0
  }));

  res.json({
    success: true,
    genres
  });
}));

router.get("/search", asyncHandler(async (req, res) => {
  const { query, genre, mood, artist, album } = req.query;
  const songFilter = buildSongFilter({ query, genre, mood, artist, album });
  const albumFilter = {};
  const podcastFilter = {};

  if (query) {
    albumFilter.$or = [
      { title: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
      { genre: { $regex: query, $options: "i" } }
    ];
    podcastFilter.$or = [
      { title: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
      { episode: { $regex: query, $options: "i" } },
      { genre: { $regex: query, $options: "i" } },
      { mood: { $regex: query, $options: "i" } }
    ];
  }

  if (genre) {
    albumFilter.genre = genre;
    podcastFilter.genre = genre;
  }
  if (artist) {
    albumFilter.artist = { $regex: artist, $options: "i" };
    podcastFilter.artist = { $regex: artist, $options: "i" };
  }
  if (mood) podcastFilter.mood = mood;

  const [songs, albums, podcasts] = await Promise.all([
    Song.find(songFilter).sort({ plays: -1, createdAt: -1 }).limit(50),
    Album.find(albumFilter).sort({ createdAt: -1 }).limit(50),
    Podcast.find(podcastFilter).sort({ plays: -1, createdAt: -1 }).limit(50)
  ]);
  const artists = summarizeArtists({ songs, albums, podcasts }).slice(0, 12);

  res.json({
    success: true,
    songs,
    albums,
    artists,
    podcasts
  });
}));

router.get("/", asyncHandler(async (req, res) => {
  const [songs, albums, podcasts, artists] = await Promise.all([
    Song.find().sort({ createdAt: -1 }).limit(12),
    Album.find().sort({ createdAt: -1 }).limit(12),
    Podcast.find().sort({ createdAt: -1 }).limit(12),
    Song.distinct("artist")
  ]);

  res.json({
    success: true,
    songs,
    albums,
    podcasts,
    artists: artists.slice(0, 12).map((name) => ({ id: encodeURIComponent(name), name }))
  });
}));

module.exports = router;
