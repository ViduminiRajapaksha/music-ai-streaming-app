import api from "./api";

export const playlistService = {
  getAll: async () => {
    const res = await api.get("/playlists");
    return res.data.playlists;
  },

  getById: async (id) => {
    const res = await api.get(`/playlists/${id}`);
    return res.data.playlist;
  },

  create: async (data) => {
    const res = await api.post("/playlists", data);
    return res.data.playlist;
  },

  update: async (id, data) => {
    const res = await api.put(`/playlists/${id}`, data);
    return res.data.playlist;
  },

  delete: async (id) => {
    const res = await api.delete(`/playlists/${id}`);
    return res.data;
  },

  addSong: async (playlistId, song) => {
    const res = await api.post(`/playlists/${playlistId}/add-song`, song);
    return res.data.playlist;
  },

  removeSong: async (playlistId, songId) => {
    const res = await api.delete(`/playlists/${playlistId}/remove-song/${songId}`);
    return res.data.playlist;
  }
};
