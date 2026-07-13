import { PLACEHOLDER_IMAGE } from "./constants";

/**
 * Normalize YouTube API track object into app track format.
 */
export const normalizeYouTubeTrack = (track) => {
  if (!track) return null;

  if (track._id || track.audioURL || track.coverImage) {
    return normalizeLibrarySong(track);
  }

  if ((track.youtubeId || track.id) && track.title) {
    return {
      ...track,
      id: track.id || track.youtubeId,
      youtubeId: track.youtubeId || track.id,
      artist: track.artist || "Unknown Artist",
      album: track.album || "",
      image: track.image || track.images?.[0]?.url || track.thumbnails?.high?.url || track.thumbnails?.default?.url || PLACEHOLDER_IMAGE,
      previewUrl: track.previewUrl || track.preview_url || `https://www.youtube.com/watch?v=${track.youtubeId || track.id}`,
      durationMs: track.durationMs || track.duration_ms || 0
    };
  }

  return {
    id: track.id,
    youtubeId: track.id,
    title: track.name,
    artist: track.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
    album: track.album?.name || "",
    image: track.album?.images?.[0]?.url || track.images?.[0]?.url || track.thumbnails?.high?.url || track.thumbnails?.default?.url || PLACEHOLDER_IMAGE,
    previewUrl: track.preview_url || `https://www.youtube.com/watch?v=${track.id}`,
    durationMs: track.duration_ms || 0,
    uri: track.uri,
    thumbnails: track.thumbnails
  };
};

/**
 * Normalize local Mongo song object into app track format.
 */
export const normalizeLibrarySong = (song) => {
  if (!song) return null;

  if (!song._id && (song.youtubeId || song.id) && song.title) {
    return normalizeYouTubeTrack(song);
  }

  return {
    _id: song._id,
    id: song._id,
    youtubeId: song._id,
    title: song.title,
    artist: song.artist || "Unknown Artist",
    album: song.album || "",
    genre: song.genre || "",
    mood: song.mood || "",
    image: song.coverImage || song.image || PLACEHOLDER_IMAGE,
    previewUrl: song.audioURL || song.previewUrl || "",
    audioURL: song.audioURL || "",
    durationMs: song.durationMs || (song.duration || 0) * 1000,
    lyrics: song.lyrics || "",
    plays: song.plays || 0,
    likes: song.likes || 0,
    dislikes: song.dislikes || 0,
    downloads: song.downloads || 0,
    isPremium: Boolean(song.isPremium)
  };
};

/**
 * Normalize local Mongo podcast object into app track format.
 */
export const normalizeLibraryPodcast = (podcast) => {
  if (!podcast) return null;

  return {
    _id: podcast._id,
    id: podcast._id,
    youtubeId: podcast._id,
    title: podcast.title,
    artist: podcast.artist || "Unknown Artist",
    album: podcast.episode || "Podcast",
    genre: podcast.genre || "",
    mood: podcast.mood || "",
    image: podcast.coverImage || PLACEHOLDER_IMAGE,
    previewUrl: podcast.audioURL || "",
    audioURL: podcast.audioURL || "",
    durationMs: (podcast.duration || 0) * 1000,
    description: podcast.description || "",
    type: "podcast"
  };
};

/**
 * Normalize local Mongo album object into card/detail format.
 */
export const normalizeLibraryAlbum = (album) => {
  if (!album) return null;

  if (!album._id && album.id && (album.name || album.title)) {
    return normalizeYouTubeAlbum(album);
  }

  return {
    _id: album._id,
    id: album._id,
    name: album.title,
    title: album.title,
    artist: album.artist || "",
    image: album.cover || PLACEHOLDER_IMAGE,
    cover: album.cover || "",
    genre: album.genre || "",
    description: album.description || "",
    releaseDate: album.releaseDate,
    totalTracks: album.songs?.length || 0,
    songs: album.songs || []
  };
};

/**
 * Normalize favorite/playlist song from backend.
 */
export const normalizeBackendTrack = (song) => ({
  _id: song._id,
  id: song.youtubeId || song.songId || song.id || song._id,
  youtubeId: song.youtubeId || song.songId || song.id || song._id,
  title: song.title,
  artist: song.artist || "Unknown Artist",
  album: song.album || "",
  image: song.image || song.coverImage || PLACEHOLDER_IMAGE,
  previewUrl: song.previewUrl || song.audioURL || "",
  durationMs: song.durationMs || 0
});

/**
 * Normalize YouTube artist object.
 */
export const normalizeYouTubeArtist = (artist) => ({
  id: artist.id,
  name: artist.name,
  image: artist.images?.[0]?.url || PLACEHOLDER_IMAGE,
  genres: artist.genres || [],
  followers: artist.followers?.total || 0,
  popularity: artist.popularity || 0
});

/**
 * Normalize YouTube album/playlist object.
 */
export const normalizeYouTubeAlbum = (album) => ({
  id: album.id,
  name: album.name || album.title,
  title: album.name || album.title,
  image: album.images?.[0]?.url || album.image || PLACEHOLDER_IMAGE,
  artist: album.artists?.map((a) => a.name).join(", ") || album.artist || "",
  releaseDate: album.release_date,
  totalTracks: album.total_tracks || 0
});

/**
 * Convert app track to favorite API payload.
 */
export const trackToFavoritePayload = (track) => ({
  youtubeId: track.youtubeId || track.id,
  title: track.title || track.name,
  artist: track.artist || track.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
  album: typeof track.album === "string" ? track.album : track.album?.name || "",
  image: track.image || track.album?.images?.[0]?.url || track.thumbnails?.high?.url || track.thumbnails?.default?.url || "",
  previewUrl: track.previewUrl || track.preview_url || "",
  durationMs: track.durationMs || track.duration_ms || 0
});

/**
 * Convert app track to playlist song payload.
 */
export const trackToPlaylistPayload = (track) => ({
  youtubeId: track.youtubeId || track.id,
  title: track.title || track.name,
  artist: track.artist || track.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
  album: typeof track.album === "string" ? track.album : track.album?.name || "",
  image: track.image || track.album?.images?.[0]?.url || track.thumbnails?.high?.url || track.thumbnails?.default?.url || "",
  previewUrl: track.previewUrl || track.preview_url || "",
  durationMs: track.durationMs || track.duration_ms || 0
});
