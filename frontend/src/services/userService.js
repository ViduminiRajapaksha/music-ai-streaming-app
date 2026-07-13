import api from "./api";

export const userService = {
  recordListening: async (track) => {
    const res = await api.post("/users/listening-history", track);
    return res.data;
  },

  getListeningHistory: async (page = 1, limit = 50) => {
    const res = await api.get("/users/listening-history", { params: { page, limit } });
    return res.data;
  },

  getRecentlyPlayed: async () => {
    const res = await api.get("/users/recently-played");
    return res.data.recentlyPlayed;
  },

  getMostPlayed: async (limit = 20) => {
    const res = await api.get("/users/most-played", { params: { limit } });
    return res.data.tracks;
  },

  getContinueListening: async (limit = 10) => {
    const res = await api.get("/users/continue-listening", { params: { limit } });
    return res.data.tracks;
  },

  updateFavoriteGenres: async (genres) => {
    const res = await api.put("/users/favorite-genres", { genres });
    return res.data;
  },

  getChatHistory: async (limit = 50) => {
    const res = await api.get("/users/chat-history", { params: { limit } });
    return res.data.history;
  },

  getRecommendationHistory: async (limit = 20) => {
    const res = await api.get("/users/recommendation-history", { params: { limit } });
    return res.data.history;
  },

  deleteRecommendationHistory: async (id) => {
    const res = await api.delete(`/users/recommendation-history/${id}`);
    return res.data;
  }
};
