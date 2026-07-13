import api from "./api";

export const favoriteService = {
  getAll: async () => {
    const res = await api.get("/favorites");
    return res.data.favorites;
  },

  add: async (track) => {
    const res = await api.post("/favorites", track);
    return res.data.favorite;
  },

  remove: async (id) => {
    const res = await api.delete(`/favorites/${id}`);
    return res.data;
  }
};
