import api from "./api";

export const adminService = {
  getDashboard: async () => {
    const res = await api.get("/admin/dashboard");
    return res.data;
  },

  getAnalytics: async () => {
    const res = await api.get("/admin/analytics");
    return res.data;
  },

  getReports: async () => {
    const res = await api.get("/admin/reports");
    return res.data;
  },

  getSettings: async () => {
    const res = await api.get("/admin/settings");
    return res.data.settings;
  },

  getUsers: async (params = {}) => {
    const res = await api.get("/admin/users", { params });
    return res.data;
  },

  updateUser: async (id, data) => {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data.user;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  getArtists: async (params = {}) => {
    const res = await api.get("/admin/artists", { params });
    return res.data.artists;
  },

  approveArtist: async (id) => {
    const res = await api.post(`/admin/artists/${id}/approve`);
    return res.data.artist;
  },

  suspendArtist: async (id, reason = "") => {
    const res = await api.post(`/admin/artists/${id}/suspend`, { reason });
    return res.data.artist;
  },

  deleteArtist: async (id) => {
    const res = await api.delete(`/admin/artists/${id}`);
    return res.data;
  },

  getSongs: async (params = {}) => {
    const res = await api.get("/admin/songs", { params });
    return res.data;
  },

  updateSong: async (id, data) => {
    const res = await api.patch(`/admin/songs/${id}`, data);
    return res.data.song;
  },

  deleteSong: async (id) => {
    const res = await api.delete(`/admin/songs/${id}`);
    return res.data;
  },

  getAlbums: async (params = {}) => {
    const res = await api.get("/admin/albums", { params });
    return res.data;
  },

  updateAlbum: async (id, data) => {
    const res = await api.patch(`/admin/albums/${id}`, data);
    return res.data.album;
  },

  deleteAlbum: async (id) => {
    const res = await api.delete(`/admin/albums/${id}`);
    return res.data;
  }
};
