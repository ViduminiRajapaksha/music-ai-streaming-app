const configuredApiUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = configuredApiUrl
  ? `${configuredApiUrl.replace(/\/$/, "")}/api`
  : "/api";

export const API_ORIGIN = configuredApiUrl
  ? configuredApiUrl.replace(/\/api\/?$/, "")
  : "";

export const TOKEN_KEY = "melodymind_token";

export const GENRES = [
  "Pop",
  "Rock",
  "Jazz",
  "Classical",
  "Hip-Hop",
  "EDM",
  "Sinhala",
  "Tamil",
  "English",
  "Instrumental"
];

export const NAV_LINKS = [
  { path: "/", label: "Home", icon: "home" },
  { path: "/search", label: "Search", icon: "search" },
  { path: "/trending", label: "Trending", icon: "trending" },
  { path: "/albums", label: "Albums", icon: "album" },
  { path: "/artists", label: "Artists", icon: "artist" },
  { path: "/genres", label: "Genres", icon: "genre" },
  { path: "/library", label: "Library", icon: "library" },
  { path: "/now-playing", label: "Now Playing", icon: "nowPlaying" },
  { path: "/lyrics", label: "Lyrics", icon: "lyrics" },
  { path: "/queue", label: "Queue", icon: "queue" },
  { path: "/history", label: "History", icon: "history" },
  { path: "/downloads", label: "Downloads", icon: "download" },
  { path: "/favorites", label: "Favorites", icon: "heart" },
  { path: "/playlists", label: "Playlists", icon: "playlist" },
  { path: "/artist-studio", label: "Artist Studio", icon: "upload" },
  { path: "/ai-chat", label: "AI Chat", icon: "chat" },
  { path: "/recommendations", label: "Recommendations", icon: "recommend" },
  { path: "/smart-search", label: "Smart Search", icon: "smartSearch" },
  { path: "/generate-playlist", label: "AI Playlist", icon: "sparkle" },
  { path: "/admin", label: "Admin", icon: "admin" },
  { path: "/admin/users", label: "Admin Users", icon: "adminUsers" },
  { path: "/admin/artists", label: "Admin Artists", icon: "adminArtists" },
  { path: "/admin/songs", label: "Admin Songs", icon: "adminSongs" },
  { path: "/admin/albums", label: "Admin Albums", icon: "adminAlbums" },
  { path: "/admin/analytics", label: "Analytics", icon: "analytics" },
  { path: "/admin/reports", label: "Reports", icon: "reports" },
  { path: "/admin/settings", label: "Admin Settings", icon: "settings" }
];

export const REPEAT_MODES = {
  OFF: "off",
  ALL: "all",
  ONE: "one"
};

export const PLACEHOLDER_IMAGE = "https://placehold.co/300x300/181818/1DB954?text=Music";
