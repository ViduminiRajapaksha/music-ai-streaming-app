import api from "./api";

export const aiService = {
  chat: async (message, sessionId) => {
    const res = await api.post("/ai/chat", { message, sessionId });
    return res.data;
  },

  recommend: async (query, personalized = false) => {
    const res = await api.post("/ai/recommend", { query, personalized });
    return res.data;
  },

  generatePlaylist: async (data) => {
    const res = await api.post("/ai/generate-playlist", data);
    return res.data;
  },

  smartSearch: async (query) => {
    const res = await api.post("/ai/smart-search", { query });
    return res.data;
  },

  lyricsSearch: async (query) => {
    const res = await api.post("/ai/lyrics", { query });
    return res.data;
  },

  getAIHistory: async (limit = 50) => {
    const res = await api.get("/ai/history", { params: { limit } });
    return res.data.history;
  },

  getScoredRecommendations: async (limit = 20) => {
    const res = await api.get("/ai/recommendations", { params: { limit } });
    return res.data.recommendations;
  }
};
