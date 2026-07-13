const axios = require("axios");

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const DEBUG_YOUTUBE = String(process.env.DEBUG_YOUTUBE).toLowerCase() === "true";

/**
 * Execute a YouTube API request
 */
const youtubeRequest = async (endpoint, params = {}) => {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error("YouTube API key is not configured");
    }

    try {
        if (DEBUG_YOUTUBE) {
            console.log(`YouTube API request: ${endpoint}`, params);
        }
        const response = await axios({
            method: "GET",
            url: `${YOUTUBE_API_BASE}${endpoint}`,
            params: {
                key: apiKey,
                ...params
            }
        });
        if (DEBUG_YOUTUBE) {
            console.log(`YouTube API response: ${endpoint}`, response.data);
        }
        return response.data;
    } catch (error) {
        if (DEBUG_YOUTUBE) {
            console.error("YouTube API request failed:", error.response?.data || error.message);
        }
        throw error;
    }
};

/**
 * Search for videos, channels, or playlists
 */
const search = async (query, type = "video", limit = 20) => {
    const typeMap = {
        track: "video",
        artist: "channel",
        album: "playlist",
        all: "video,channel,playlist"
    };

    const searchType = typeMap[type] || type;
    
    try {
        const response = await youtubeRequest("/search", {
            q: query,
            part: "snippet",
            type: searchType,
            maxResults: Math.min(limit, 50)
        });

        // Transform YouTube response to match app structure
        const results = {};
        
        if (searchType.includes("video") || searchType === "video") {
            const videos = response.items?.filter(item => item.id.kind === "youtube#video") || [];
            results.tracks = {
                items: videos.map(item => ({
                    id: item.id.videoId,
                    name: item.snippet.title,
                    artists: [{ id: item.snippet.channelId, name: item.snippet.channelTitle }],
                    album: {
                        id: item.snippet.channelId,
                        name: item.snippet.channelTitle,
                        images: [{ url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url }]
                    },
                    duration_ms: null, // Will be populated by getTrack
                    preview_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    uri: `youtube:video:${item.id.videoId}`,
                    thumbnails: item.snippet.thumbnails
                })),
                total: videos.length
            };
        }

        if (searchType.includes("channel") || searchType === "channel") {
            const channels = response.items?.filter(item => item.id.kind === "youtube#channel") || [];
            results.artists = {
                items: channels.map(item => ({
                    id: item.id.channelId,
                    name: item.snippet.channelTitle,
                    images: [{ url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url }],
                    genres: [],
                    followers: { total: 0 },
                    popularity: 0
                })),
                total: channels.length
            };
        }

        if (searchType.includes("playlist") || searchType === "playlist") {
            const playlists = response.items?.filter(item => item.id.kind === "youtube#playlist") || [];
            results.albums = {
                items: playlists.map(item => ({
                    id: item.id.playlistId,
                    name: item.snippet.title,
                    release_date: item.snippet.publishedAt,
                    total_tracks: 0,
                    artists: [{ id: item.snippet.channelId, name: item.snippet.channelTitle }],
                    images: [{ url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url }]
                })),
                total: playlists.length
            };
        }

        return results;
    } catch (error) {
        throw error;
    }
};

/**
 * Get video details (track)
 */
const getTrack = async (videoId) => {
    try {
        const response = await youtubeRequest("/videos", {
            part: "snippet,contentDetails,statistics",
            id: videoId
        });

        const video = response.items?.[0];
        if (!video) {
            throw new Error("Video not found");
        }

        // Parse duration (PT3M45S -> 225000ms)
        const durationMatch = video.contentDetails.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (durationMatch[1] || '').replace('H', '') || 0;
        const minutes = (durationMatch[2] || '').replace('M', '') || 0;
        const seconds = (durationMatch[3] || '').replace('S', '') || 0;
        const durationMs = ((parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(seconds)) * 1000;

        return {
            id: video.id,
            name: video.snippet.title,
            artists: [{ id: video.snippet.channelId, name: video.snippet.channelTitle }],
            album: {
                id: video.snippet.channelId,
                name: video.snippet.channelTitle,
                images: [{ url: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url }]
            },
            duration_ms: durationMs,
            preview_url: `https://www.youtube.com/watch?v=${video.id}`,
            uri: `youtube:video:${video.id}`,
            thumbnails: video.snippet.thumbnails,
            statistics: video.statistics
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get channel details (artist)
 */
const getArtist = async (channelId) => {
    try {
        const response = await youtubeRequest("/channels", {
            part: "snippet,statistics,brandingSettings",
            id: channelId
        });

        const channel = response.items?.[0];
        if (!channel) {
            throw new Error("Channel not found");
        }

        return {
            id: channel.id,
            name: channel.snippet.title,
            description: channel.snippet.description,
            images: [{ url: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url }],
            genres: [],
            followers: { total: parseInt(channel.statistics.subscriberCount) || 0 },
            popularity: 0,
            statistics: channel.statistics
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get playlist details (album)
 */
const getAlbum = async (playlistId) => {
    try {
        const response = await youtubeRequest("/playlists", {
            part: "snippet,contentDetails",
            id: playlistId
        });

        const playlist = response.items?.[0];
        if (!playlist) {
            throw new Error("Playlist not found");
        }

        // Get playlist items
        const itemsResponse = await youtubeRequest("/playlistItems", {
            part: "snippet",
            playlistId: playlistId,
            maxResults: 50
        });

        const tracks = itemsResponse.items?.map(item => ({
            id: item.snippet.resourceId.videoId,
            name: item.snippet.title,
            artists: [{ id: item.snippet.channelId, name: item.snippet.channelTitle }],
            album: {
                id: playlistId,
                name: playlist.snippet.title,
                images: [{ url: playlist.snippet.thumbnails?.high?.url || playlist.snippet.thumbnails?.default?.url }]
            },
            duration_ms: null,
            preview_url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
            uri: `youtube:video:${item.snippet.resourceId.videoId}`
        })) || [];

        return {
            id: playlist.id,
            name: playlist.snippet.title,
            description: playlist.snippet.description,
            release_date: playlist.snippet.publishedAt,
            total_tracks: playlist.contentDetails.itemCount,
            artists: [{ id: playlist.snippet.channelId, name: playlist.snippet.channelTitle }],
            images: [{ url: playlist.snippet.thumbnails?.high?.url || playlist.snippet.thumbnails?.default?.url }],
            tracks: {
                items: tracks
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get featured playlists (using chart or trending videos)
 */
const getFeaturedPlaylists = async (limit = 20) => {
    try {
        // Use video categories to find music
        const response = await youtubeRequest("/videos", {
            part: "snippet",
            chart: "mostPopular",
            videoCategoryId: "10", // Music category
            maxResults: Math.min(limit, 50)
        });

        const playlists = [{
            id: "trending_music",
            name: "Trending Music",
            description: "Most popular music videos on YouTube",
            images: [{ url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" }],
            tracks: { total: response.items?.length || 0 }
        }];

        return {
            playlists: {
                items: playlists
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get new releases (recent music videos)
 */
const getNewReleases = async (limit = 20, country = "US") => {
    try {
        const response = await youtubeRequest("/search", {
            part: "snippet",
            q: "music 2024 new release",
            type: "video",
            order: "date",
            maxResults: Math.min(limit, 50)
        });

        const albums = response.items?.map(item => ({
            id: item.id.videoId,
            name: item.snippet.title,
            release_date: item.snippet.publishedAt,
            total_tracks: 1,
            artists: [{ id: item.snippet.channelId, name: item.snippet.channelTitle }],
            images: [{ url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url }]
        })) || [];

        return {
            albums: {
                items: albums,
                total: albums.length
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get recommendations based on search query
 */
const getRecommendations = async (params = {}) => {
    try {
        const { seed_genres, seed_tracks, seed_artists, limit = 20 } = params;
        
        let searchQuery = "music";
        if (seed_genres) {
            searchQuery = seed_genres;
        } else if (seed_tracks) {
            searchQuery = seed_tracks;
        } else if (seed_artists) {
            searchQuery = seed_artists;
        }

        const response = await youtubeRequest("/search", {
            part: "snippet",
            q: searchQuery,
            type: "video",
            maxResults: Math.min(limit, 50)
        });

        const tracks = response.items?.map(item => ({
            id: item.id.videoId,
            name: item.snippet.title,
            artists: [{ id: item.snippet.channelId, name: item.snippet.channelTitle }],
            album: {
                id: item.snippet.channelId,
                name: item.snippet.channelTitle,
                images: [{ url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url }]
            },
            duration_ms: null,
            preview_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            uri: `youtube:video:${item.id.videoId}`
        })) || [];

        return {
            tracks: tracks
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get recommendations by genre
 */
const getRecommendationsByGenre = async (genres, limit = 20) => {
    const genreList = Array.isArray(genres) ? genres.slice(0, 5).join(" ") : genres;
    return await getRecommendations({ seed_genres: genreList, limit });
};

/**
 * Get related artists (related channels)
 */
const getRelatedArtists = async (channelId) => {
    try {
        // YouTube doesn't have a direct "related artists" endpoint
        // We'll search for similar channels based on the channel name
        const channelResponse = await youtubeRequest("/channels", {
            part: "snippet",
            id: channelId
        });

        const channel = channelResponse.items?.[0];
        if (!channel) {
            return { artists: [] };
        }

        // Search for similar channels
        const searchResponse = await youtubeRequest("/search", {
            part: "snippet",
            q: channel.snippet.title,
            type: "channel",
            maxResults: 5
        });

        const artists = searchResponse.items
            ?.filter(item => item.id.channelId !== channelId)
            .map(item => ({
                id: item.id.channelId,
                name: item.snippet.channelTitle,
                images: [{ url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url }],
                genres: [],
                followers: { total: 0 },
                popularity: 0
            })) || [];

        return {
            artists: artists.slice(0, 3)
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get multiple tracks
 */
const getMultipleTracks = async (ids) => {
    const idList = Array.isArray(ids) ? ids.join(",") : ids;
    
    try {
        const response = await youtubeRequest("/videos", {
            part: "snippet,contentDetails",
            id: idList
        });

        const tracks = response.items?.map(video => {
            const durationMatch = video.contentDetails.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            const hours = (durationMatch[1] || '').replace('H', '') || 0;
            const minutes = (durationMatch[2] || '').replace('M', '') || 0;
            const seconds = (durationMatch[3] || '').replace('S', '') || 0;
            const durationMs = ((parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(seconds)) * 1000;

            return {
                id: video.id,
                name: video.snippet.title,
                artists: [{ id: video.snippet.channelId, name: video.snippet.channelTitle }],
                album: {
                    id: video.snippet.channelId,
                    name: video.snippet.channelTitle,
                    images: [{ url: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url }]
                },
                duration_ms: durationMs,
                preview_url: `https://www.youtube.com/watch?v=${video.id}`,
                uri: `youtube:video:${video.id}`
            };
        }) || [];

        return {
            tracks: tracks
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    search,
    getTrack,
    getArtist,
    getAlbum,
    getFeaturedPlaylists,
    getNewReleases,
    getRecommendations,
    getRecommendationsByGenre,
    getRelatedArtists,
    getMultipleTracks
};
