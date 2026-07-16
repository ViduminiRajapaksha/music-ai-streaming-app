import api from "./api";

const encodeTarget = (targetId) => encodeURIComponent(targetId);

export const followService = {
  follow: async (targetId, artistName) => {
    const res = await api.post(`/follow/${encodeTarget(targetId)}`, { artistName });
    return res.data;
  },

  unfollow: async (targetId) => {
    const res = await api.delete(`/follow/${encodeTarget(targetId)}`);
    return res.data;
  },

  checkFollowing: async (targetId) => {
    const res = await api.get(`/follow/check/${encodeTarget(targetId)}`);
    return res.data.isFollowing;
  },

  getFollowersCount: async (targetId) => {
    const res = await api.get(`/follow/followers/${encodeTarget(targetId)}`);
    return res.data.count;
  },

  getFollowingCount: async (userId) => {
    const res = await api.get(`/follow/following/${userId}`);
    return res.data.count;
  },

  getFollowersList: async (targetId) => {
    const res = await api.get(`/follow/list/followers/${encodeTarget(targetId)}`);
    return res.data.followers;
  },

  getFollowingList: async (userId) => {
    const res = await api.get(`/follow/list/following/${userId}`);
    return res.data.following;
  }
};
