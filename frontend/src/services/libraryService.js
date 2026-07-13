import api from "./api";

const multipartHeaders = {};

export const libraryService = {
  getLibrary: async () => {
    const res = await api.get("/library");
    return res.data;
  },

  getTrending: async (limit = 20) => {
    const res = await api.get("/library/trending", { params: { limit } });
    return res.data;
  },

  getArtists: async () => {
    const res = await api.get("/library/artists");
    return res.data.artists;
  },

  getArtist: async (name) => {
    const res = await api.get(`/library/artists/${encodeURIComponent(name)}`);
    return res.data.artist;
  },

  getGenres: async () => {
    const res = await api.get("/library/genres");
    return res.data.genres;
  },

  search: async (params = {}) => {
    const res = await api.get("/library/search", { params });
    return res.data;
  },

  getSongs: async (params = {}) => {
    const res = await api.get("/songs", { params });
    return res.data;
  },

  getAlbums: async (params = {}) => {
    const res = await api.get("/albums", { params });
    return res.data;
  },

  getPodcasts: async (params = {}) => {
    const res = await api.get("/podcasts", { params });
    return res.data;
  },

  uploadSong: async (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") form.append(key, value);
    });
    const res = await api.post("/songs/upload", form, multipartHeaders);
    return res.data.song;
  },

  uploadSongCover: async (songId, cover) => {
    const form = new FormData();
    form.append("cover", cover);
    const res = await api.post(`/songs/${songId}/cover`, form, multipartHeaders);
    return res.data.song;
  },

  updateLyrics: async (songId, lyrics) => {
    const res = await api.put(`/songs/${songId}/lyrics`, { lyrics });
    return res.data.song;
  },

  likeSong: async (songId) => {
    const res = await api.post(`/songs/${songId}/like`);
    return res.data;
  },

  dislikeSong: async (songId) => {
    const res = await api.post(`/songs/${songId}/dislike`);
    return res.data;
  },

  recordSongPlay: async (songId) => {
    const res = await api.post(`/songs/${songId}/play`);
    return res.data;
  },

  downloadSong: async (songId) => {
    const res = await api.get(`/songs/${songId}/download`);
    return res.data.downloadUrl;
  },

  createAlbum: async (data) => {
    const res = await api.post("/albums", data);
    return res.data.album;
  },

  uploadAlbumCover: async (albumId, cover) => {
    const form = new FormData();
    form.append("cover", cover);
    const res = await api.post(`/albums/${albumId}/cover`, form, multipartHeaders);
    return res.data.album;
  },

  addSongToAlbum: async (albumId, songId) => {
    const res = await api.post(`/albums/${albumId}/songs`, { songId });
    return res.data.album;
  },

  uploadPodcast: async (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") form.append(key, value);
    });
    const res = await api.post("/podcasts/upload", form, multipartHeaders);
    return res.data.podcast;
  },

  uploadPodcastCover: async (podcastId, cover) => {
    const form = new FormData();
    form.append("cover", cover);
    const res = await api.post(`/podcasts/${podcastId}/cover`, form, multipartHeaders);
    return res.data.podcast;
  }
};
