import api from "./api";

const isMongoId = (id) => /^[a-f\d]{24}$/i.test(id);

export const musicService = {
  search: async (query, type = "track", limit = 20) => {
    const res = await api.get("/music/search", {
      params: { q: query, type, limit }
    });
    return res.data.data;
  },

  getTrack: async (id) => {
    if (isMongoId(id)) {
      const res = await api.get(`/songs/${id}`);
      return res.data.song;
    }
    const res = await api.get(`/music/track/${id}`);
    return res.data.data;
  },

  getArtist: async (id) => {
    const res = await api.get(`/music/artist/${id}`);
    return res.data.data;
  },

  getAlbum: async (id) => {
    if (isMongoId(id)) {
      const res = await api.get(`/albums/${id}`);
      return res.data.album;
    }
    const res = await api.get(`/music/album/${id}`);
    return res.data.data;
  },

  getNewReleases: async (limit = 20) => {
    const res = await api.get("/music/new-releases", { params: { limit } });
    return res.data.data;
  },

  getRecommendations: async (params = {}) => {
    const res = await api.get("/music/recommendations", { params });
    return res.data.data;
  },

  getFeaturedPlaylists: async (limit = 10) => {
    const res = await api.get("/music/featured-playlists", { params: { limit } });
    return res.data.data;
  },

  getRelatedArtists: async (id) => {
    const res = await api.get(`/music/artist/${id}/related`);
    return res.data.data;
  }
};
