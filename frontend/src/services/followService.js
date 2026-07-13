import api from "./api";

export const followService = {
  follow: async (userId) => {
    const res = await api.post(`/follow/${userId}`);
    return res.data;
  },

  unfollow: async (userId) => {
    const res = await api.delete(`/follow/${userId}`);
    return res.data;
  },

  checkFollowing: async (userId) => {
    const res = await api.get(`/follow/check/${userId}`);
    return res.data.isFollowing;
  },

  getFollowersCount: async (userId) => {
    const res = await api.get(`/follow/followers/${userId}`);
    return res.data.count;
  },

  getFollowingCount: async (userId) => {
    const res = await api.get(`/follow/following/${userId}`);
    return res.data.count;
  },

  getFollowersList: async (userId) => {
    const res = await api.get(`/follow/list/followers/${userId}`);
    return res.data.followers;
  },

  getFollowingList: async (userId) => {
    const res = await api.get(`/follow/list/following/${userId}`);
    return res.data.following;
  }
};
