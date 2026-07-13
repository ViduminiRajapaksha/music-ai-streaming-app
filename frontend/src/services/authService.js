import api from "./api";
import { TOKEN_KEY } from "../utils/constants";

export const authService = {
  register: async (data) => {
    const res = await api.post("/auth/register", data);
    if (res.data.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
    }
    return res.data;
  },

  login: async (data) => {
    const res = await api.post("/auth/login", data);
    if (res.data.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getProfile: async () => {
    const res = await api.get("/auth/profile");
    return res.data.user;
  },

  updateProfile: async (data) => {
    const res = await api.put("/auth/profile", data);
    return res.data.user;
  },

  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);
    const res = await api.post("/auth/profile/image", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.profileImage;
  },

  changePassword: async (data) => {
    const res = await api.put("/auth/change-password", data);
    return res.data;
  },

  deleteAccount: async () => {
    const res = await api.delete("/auth/delete-account");
    localStorage.removeItem(TOKEN_KEY);
    return res.data;
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY)
};
