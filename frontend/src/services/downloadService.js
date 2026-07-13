import api from "./api";

export const downloadService = {
  getAll: async () => {
    const res = await api.get("/downloads");
    return res.data.downloads;
  },

  remove: async (songId) => {
    const res = await api.delete(`/downloads/${songId}`);
    return res.data;
  }
};
