const User = require("../models/User");
const Favorite = require("../models/Favorite");
const ChatHistory = require("../models/ChatHistory");
const AIHistory = require("../models/AIHistory");
const ListeningHistory = require("../models/ListeningHistory");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Podcast = require("../models/Podcast");
const Recommendation = require("../models/Recommendation");
const RecommendationHistory = require("../models/RecommendationHistory");
const geminiService = require("../services/geminiService");
const youtubeService = require("../services/youtubeService");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Build user context for personalized AI recommendations.
 */
const buildUserContext = async (userId) => {
    const [user, favorites, recentListening] = await Promise.all([
        User.findById(userId),
        Favorite.find({ userId }).sort({ createdAt: -1 }).limit(10),
        ListeningHistory.find({ userId }).sort({ playedAt: -1 }).limit(10)
    ]);

    return {
        username: user?.username,
        favoriteGenres: user?.favoriteGenres || [],
        recentlyPlayed: user?.recentlyPlayed || [],
        favorites: favorites.map((f) => ({
            title: f.title,
            artist: f.artist
        })),
        listeningHistory: recentListening.map((h) => ({
            title: h.title,
            artist: h.artist
        }))
    };
};

/**
 * Store chat messages in MongoDB.
 */
const saveChatMessages = async (userId, sessionId, userMessage, assistantMessage, metadata = {}) => {
    await ChatHistory.insertMany([
        {
            userId,
            sessionId,
            role: "user",
            message: userMessage,
            metadata
        },
        {
            userId,
            sessionId,
            role: "assistant",
            message: assistantMessage,
            metadata
        }
    ]);
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const moodProfiles = {
    stressed: {
        mood: "Calm",
        energy: "low",
        genres: ["Classical", "Instrumental"],
        searchTerms: ["calm music", "meditation", "nature sounds"],
        explanation: "Stress usually benefits from slower, low-energy music with gentle textures."
    },
    study: {
        mood: "Focus",
        energy: "medium",
        genres: ["Instrumental", "Classical", "Jazz"],
        searchTerms: ["study focus music", "instrumental study", "calm piano"],
        explanation: "Studying works best with low-distraction instrumental or calm tracks."
    },
    gym: {
        mood: "Energetic",
        energy: "high",
        genres: ["Hip-Hop", "EDM", "Rock"],
        searchTerms: ["gym workout music", "high energy songs", "workout playlist"],
        explanation: "Workout sessions fit high-energy tracks with strong rhythm."
    },
    sleep: {
        mood: "Calm",
        energy: "low",
        genres: ["Instrumental", "Classical"],
        searchTerms: ["sleep music", "soft ambient", "relaxing night music"],
        explanation: "Sleeping needs low-tempo, soft, repetitive music."
    },
    party: {
        mood: "Party",
        energy: "high",
        genres: ["Pop", "EDM", "Hip-Hop"],
        searchTerms: ["party songs", "dance hits", "upbeat pop"],
        explanation: "Party music favors bright, familiar, danceable tracks."
    },
    travel: {
        mood: "Chill",
        energy: "medium",
        genres: ["Pop", "Rock", "Instrumental"],
        searchTerms: ["travel songs", "road trip music", "feel good music"],
        explanation: "Travel playlists work well with uplifting songs that keep momentum."
    },
    happy: {
        mood: "Happy",
        energy: "high",
        genres: ["Pop", "EDM"],
        searchTerms: ["happy songs", "feel good pop", "upbeat music"],
        explanation: "Happy prompts match upbeat songs with bright production."
    },
    sad: {
        mood: "Sad",
        energy: "low",
        genres: ["Jazz", "Classical", "Instrumental"],
        searchTerms: ["sad songs", "emotional music", "soft ballads"],
        explanation: "Sad moods usually fit slower and more reflective music."
    },
    relax: {
        mood: "Calm",
        energy: "low",
        genres: ["Instrumental", "Jazz", "Classical"],
        searchTerms: ["relaxing music", "calm instrumental", "soft jazz"],
        explanation: "Relaxing sessions favor low-energy tracks with smoother dynamics."
    }
};

const inferMood = (text = "") => {
    const lower = text.toLowerCase();
    const key = Object.keys(moodProfiles).find((item) => lower.includes(item));
    return moodProfiles[key] || {
        mood: "Chill",
        energy: "medium",
        genres: ["Pop", "Instrumental"],
        searchTerms: [text || "recommended music", "popular songs", "music playlist"],
        explanation: "The request sounds broad, so a balanced mix is a good starting point."
    };
};

const safeGemini = async (operation, fallback) => {
    try {
        return await operation();
    } catch (err) {
        if (String(process.env.DEBUG_GEMINI).toLowerCase() === "true") {
            console.error("Gemini request failed:", err.response?.data || err.message);
        }
        return fallback;
    }
};

const describeGeminiError = (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) return "Gemini API unavailable: check the API key or project permissions.";
    if (status === 429) return "Gemini API quota exceeded. Try again later.";
    if (!process.env.GEMINI_API_KEY) return "Gemini API unavailable: missing API key.";
    return "Gemini API unavailable, so these recommendations use predefined mood profiles.";
};

const describeYouTubeError = (err) => {
    const status = err.response?.status;
    if (status === 429) return "YouTube quota exceeded. Try again later or upload local songs.";
    if (status === 401 || status === 403) return "YouTube API unavailable: check the API key or project permissions.";
    if (!process.env.YOUTUBE_API_KEY) return "YouTube API unavailable: missing API key.";
    return "YouTube recommendations are temporarily unavailable. Try again later or upload local songs.";
};

const safeGeminiWithSource = async (operation, fallback) => {
    try {
        return {
            data: await operation(),
            source: "gemini"
        };
    } catch (err) {
        if (String(process.env.DEBUG_GEMINI).toLowerCase() === "true") {
            console.error("Gemini request failed:", err.response?.data || err.message);
        }
        return {
            data: fallback,
            source: "fallback",
            warning: describeGeminiError(err)
        };
    }
};

const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "late-night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
};

const parseSmartQuery = (query = "") => {
    const lower = query.toLowerCase();
    const yearMatch = lower.match(/\b(19|20)\d{2}\b/);
    const profile = inferMood(lower);
    const genre = ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop", "EDM", "Sinhala", "Tamil", "English", "Instrumental"]
        .find((item) => lower.includes(item.toLowerCase()));

    return {
        originalQuery: query,
        title: lower.includes("song called") ? query.replace(/song called/i, "").trim() : "",
        artist: "",
        album: "",
        genre: genre || profile.genres?.[0] || "",
        mood: profile.mood,
        year: yearMatch?.[0] || "",
        lyricFragment: lower.includes("with") || lower.includes("lyrics") ? query.replace(/song with|lyrics|"/gi, "").trim() : "",
        explanation: `Understood as ${profile.mood.toLowerCase()} music${genre ? ` in ${genre}` : ""}${yearMatch ? ` from ${yearMatch[0]}` : ""}.`
    };
};

const findLocalSongs = async ({ query = "", genre = "", mood = "", lyricFragment = "", year = "", limit = 20 }) => {
    const filters = [];
    const trimmed = query.trim();

    if (trimmed) {
        const regex = new RegExp(escapeRegex(trimmed), "i");
        filters.push({
            $or: [
                { title: regex },
                { artist: regex },
                { album: regex },
                { genre: regex },
                { mood: regex },
                { lyrics: regex }
            ]
        });
    }

    if (genre) filters.push({ genre });
    if (mood) filters.push({ mood });
    if (lyricFragment) filters.push({ lyrics: new RegExp(escapeRegex(lyricFragment), "i") });
    if (year) {
        const start = new Date(`${year}-01-01T00:00:00.000Z`);
        const end = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
        filters.push({ createdAt: { $gte: start, $lt: end } });
    }

    const filter = filters.length ? { $and: filters } : {};

    const songs = await Song.find(filter)
        .sort({ plays: -1, likes: -1, createdAt: -1 })
        .limit(limit);

    if (songs.length || filters.length <= 1) {
        return songs;
    }

    const broadFilters = [];
    if (trimmed) {
        const regex = new RegExp(escapeRegex(trimmed), "i");
        broadFilters.push({ title: regex }, { artist: regex }, { album: regex }, { lyrics: regex });
    }
    if (genre) broadFilters.push({ genre });
    if (mood) broadFilters.push({ mood });

    return Song.find(broadFilters.length ? { $or: broadFilters } : {})
        .sort({ plays: -1, likes: -1, createdAt: -1 })
        .limit(limit);
};

const scoreSong = (song, userContext, request = {}) => {
    let score = 30;
    const genre = song.genre || "";
    const mood = song.mood || "";

    if (userContext.favoriteGenres?.includes(genre)) score += 20;
    if (request.genres?.includes(genre) || request.genre === genre) score += 18;
    if (request.mood && mood.toLowerCase() === request.mood.toLowerCase()) score += 15;
    if (song.likes) score += Math.min(song.likes, 15);
    if (song.plays) score += Math.min(Math.floor(song.plays / 5), 10);

    const recentArtists = new Set(userContext.listeningHistory?.map((track) => track.artist));
    if (recentArtists.has(song.artist)) score += 10;

    if (getTimeContext() === "late-night" && ["Calm", "Focus", "Chill"].includes(mood)) score += 6;
    if (getTimeContext() === "morning" && ["Happy", "Energetic"].includes(mood)) score += 6;

    return Math.max(0, Math.min(100, score));
};

const storeAIHistory = async (userId, prompt, response, intent) => {
    return AIHistory.create({
        user: userId,
        prompt,
        response,
        intent
    });
};

const storeScoredRecommendations = async (userId, songs, userContext, request, source = "ai") => {
    const scored = songs
        .map((song) => ({
            song,
            score: scoreSong(song, userContext, request),
            reason: request.reason || `Recommended from ${song.genre || "your library"}${song.mood ? ` for a ${song.mood.toLowerCase()} mood` : ""}`
        }))
        .sort((a, b) => b.score - a.score);

    if (scored.length) {
        await Recommendation.bulkWrite(scored.map((item) => ({
            updateOne: {
                filter: { user: userId, song: item.song._id },
                update: {
                    $set: {
                        score: item.score,
                        reason: item.reason,
                        source
                    }
                },
                upsert: true
            }
        })));
    }

    return scored;
};

const buildLocalAssistantAnswer = async (userId, message) => {
    const userContext = await buildUserContext(userId);
    const parsed = parseSmartQuery(message);
    const profile = inferMood(message);
    const songs = await findLocalSongs({
        query: message,
        genre: parsed.genre,
        mood: parsed.mood,
        lyricFragment: parsed.lyricFragment,
        year: parsed.year,
        limit: 5
    });
    const scored = await storeScoredRecommendations(userId, songs, userContext, profile, "ai");
    const artists = [...new Set(songs.map((song) => song.artist).filter(Boolean))].slice(0, 5);
    const albums = await Album.find({
        $or: [
            { artist: { $in: artists } },
            { genre: { $in: profile.genres || [] } }
        ]
    }).limit(5);

    const lowerMessage = message.toLowerCase();
    const isGeneralMusicQuestion = /\b(what|why|how|explain|tell|define|meaning)\b/.test(lowerMessage);
    const asksAboutModernMusic = /\b(modern|generation|gen z|current|today|new|trending)\b/.test(lowerMessage);

    if (!songs.length && (isGeneralMusicQuestion || asksAboutModernMusic)) {
        return [
            "Modern generation songs usually means music that is popular with younger listeners today, especially tracks shaped by streaming platforms, short-form videos, and global pop culture.",
            "",
            "Common styles include:",
            "1. Pop and dance-pop",
            "2. Hip-hop and rap",
            "3. EDM and club music",
            "4. K-pop and global pop",
            "5. Indie pop and bedroom pop",
            "6. Sinhala, Tamil, and regional pop for local audiences",
            "",
            "In this app, try searching terms like `modern pop songs`, `Gen Z playlist`, `trending Sinhala songs`, `viral songs`, or an artist name you like."
        ].join("\n");
    }

    const lines = [
        `I read that as a request for ${profile.mood.toLowerCase()} music with ${profile.energy} energy.`,
        "",
        "Playlist picks:",
        ...scored.map((item, index) => `${index + 1}. ${item.song.title} - ${item.song.artist} (${item.score}/100)`),
        "",
        artists.length ? `Artists to try: ${artists.join(", ")}` : "Artists to try: upload more artist tracks to improve this.",
        albums.length ? `Albums to try: ${albums.map((album) => album.title).join(", ")}` : "Albums to try: no matching albums yet.",
        "",
        profile.explanation
    ];

    return lines.join("\n");
};

/**
 * POST /api/ai/chat
 */
exports.chat = asyncHandler(async (req, res) => {
    const { message, sessionId } = req.body;
    const activeSessionId = sessionId || new Date().getTime().toString();
    const userContext = await buildUserContext(req.userId);
    const localAnswer = await buildLocalAssistantAnswer(req.userId, message);

    // Load recent chat for context
    const recentChats = await ChatHistory.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(6);

    const context = recentChats
        .reverse()
        .map((c) => `${c.role}: ${c.message}`)
        .join("\n");

    const enrichedContext = [
        context,
        `User music context: ${JSON.stringify(userContext)}`,
        `Local library suggestion draft: ${localAnswer}`
    ].filter(Boolean).join("\n\n");

    const answer = await safeGemini(
        () => geminiService.chat(message, enrichedContext),
        localAnswer
    );

    await saveChatMessages(req.userId, activeSessionId, message, answer);
    await storeAIHistory(req.userId, message, answer, "chat");

    res.json({
        success: true,
        sessionId: activeSessionId,
        answer
    });
});

/**
 * POST /api/ai/recommend — personalized or natural language recommendations
 */
exports.recommend = asyncHandler(async (req, res) => {
    const { query, personalized = true } = req.body;
    const userContext = await buildUserContext(req.userId);
    const inferred = inferMood(query || userContext.favoriteGenres?.join(" ") || "personalized music");
    const parsed = parseSmartQuery(query || inferred.searchTerms?.[0] || "");
    const localSongs = await findLocalSongs({
        query: query || "",
        genre: parsed.genre || inferred.genres?.[0],
        mood: parsed.mood || inferred.mood,
        year: parsed.year,
        limit: 20
    });
    const localScored = await storeScoredRecommendations(
        req.userId,
        localSongs,
        userContext,
        { ...inferred, genre: parsed.genre, mood: parsed.mood, reason: inferred.explanation },
        query ? "search" : "history"
    );

    let aiResult;
    let youtubeTracks = [];
    let type = "natural-language";
    let aiSource = "gemini";
    let youtubeSource = "youtube";
    const warnings = [];

    if (query) {
        // Natural language music search
        const aiResponse = await safeGeminiWithSource(
            () => geminiService.naturalLanguageSearch(query),
            {
                trackQuery: inferred.searchTerms?.[0] || query,
                artistQuery: "",
                genre: parsed.genre,
                mood: parsed.mood,
                explanation: inferred.explanation
            }
        );
        aiResult = aiResponse.data;
        aiSource = aiResponse.source;
        if (aiResponse.warning) warnings.push(aiResponse.warning);

        const searchQuery = aiResult.trackQuery || query;
        try {
            const youtubeResults = await youtubeService.search(searchQuery, "track", 15);
            youtubeTracks = youtubeResults.tracks?.items || [];
        } catch (err) {
            youtubeSource = "unavailable";
            warnings.push(describeYouTubeError(err));
        }
    } else if (personalized) {
        // Personalized recommendations from user profile
        type = "personalized";
        const aiResponse = await safeGeminiWithSource(
            () => geminiService.personalizedRecommendations(userContext),
            {
                summary: "Personalized from your favorite genres, listening history, and current activity signals.",
                mood: inferred.mood,
                genres: inferred.genres,
                searchQueries: inferred.searchTerms,
                recommendations: []
            }
        );
        aiResult = aiResponse.data;
        aiSource = aiResponse.source;
        if (aiResponse.warning) warnings.push(aiResponse.warning);

        const searchQueries = aiResult.searchQueries || [];
        const allTracks = [];

        for (const q of searchQueries.slice(0, 3)) {
            try {
                const result = await youtubeService.search(q, "track", 5);
                allTracks.push(...(result.tracks?.items || []));
            } catch (err) {
                youtubeSource = "unavailable";
                warnings.push(describeYouTubeError(err));
                break;
            }
        }

        // Deduplicate by track id
        const seen = new Set();
        youtubeTracks = allTracks.filter((t) => {
            if (seen.has(t.id)) return false;
            seen.add(t.id);
            return true;
        });
    } else {
        throw new ApiError(400, "Provide a query or enable personalized recommendations");
    }

    const recommendations = youtubeTracks.map((track) => ({
        youtubeId: track.id,
        title: track.name,
        artist: track.artists?.map((a) => a.name).join(", ") || "",
        reason: aiResult.explanation || aiResult.summary || "AI recommended",
        source: "youtube-api"
    }));

    const historyEntry = await RecommendationHistory.create({
        userId: req.userId,
        type,
        prompt: query || "personalized",
        mood: aiResult.mood || "",
        recommendations: [
            ...localScored.map((item) => ({
                songId: item.song._id,
                title: item.song.title,
                artist: item.song.artist,
                reason: item.reason,
                score: item.score,
                source: query ? "local-library" : "user-listening-history"
            })),
            ...recommendations
        ],
        youtubeResults: { tracks: youtubeTracks },
        metadata: {
            ...aiResult,
            sources: {
                aiAnalysis: aiSource,
                recommendations: youtubeSource,
                localLibrary: localSongs.length ? "local-library" : "empty"
            }
        }
    });
    await storeAIHistory(req.userId, query || "personalized recommendations", {
        aiAnalysis: aiResult,
        localRecommendations: localScored.map((item) => ({ song: item.song._id, score: item.score })),
        recommendations
    }, "recommendation");

    res.json({
        success: true,
        aiAnalysis: aiResult,
        recommendations: historyEntry.recommendations,
        localSongs: localScored.map((item) => ({ ...item.song.toObject(), aiScore: item.score, reason: item.reason })),
        youtubeTracks,
        sources: {
            aiAnalysis: aiSource,
            recommendations: youtubeSource,
            localLibrary: localSongs.length ? "local-library" : "empty"
        },
        warnings: [
            ...warnings,
            !localSongs.length ? "No matching local songs found." : ""
        ].filter(Boolean),
        historyId: historyEntry._id
    });
});

/**
 * POST /api/ai/generate-playlist
 */
exports.generatePlaylist = asyncHandler(async (req, res) => {
    const { prompt, mood, genres, songCount = 10 } = req.body;

    const userContext = await buildUserContext(req.userId);
    const inferred = inferMood(`${prompt || ""} ${mood || ""} ${(genres || []).join(" ")}`);

    const preferences = {
        prompt: prompt || "",
        mood: mood || "",
        genres: genres || userContext.favoriteGenres,
        songCount,
        userContext
    };

    const playlistResult = await safeGeminiWithSource(
        () => geminiService.generatePlaylistSuggestions(preferences),
        {
            playlistName: `${inferred.mood} Mix`,
            description: inferred.explanation,
            mood: inferred.mood,
            genres: genres?.length ? genres : inferred.genres,
            searchQueries: inferred.searchTerms,
            trackSuggestions: []
        }
    );
    const playlistConcept = playlistResult.source === "fallback"
        ? {
            ...playlistResult.data,
            description: `${playlistResult.warning} ${playlistResult.data.description}`
        }
        : playlistResult.data;
    const localSongs = await findLocalSongs({
        query: prompt || mood || "",
        genre: playlistConcept.genres?.[0],
        mood: playlistConcept.mood,
        limit: Number(songCount) || 10
    });
    const localScored = await storeScoredRecommendations(
        req.userId,
        localSongs,
        userContext,
        { ...playlistConcept, reason: playlistConcept.description },
        "ai"
    );

    const searchQueries = playlistConcept.searchQueries || [];
    const collectedTracks = [];
    let youtubeSource = "youtube";
    let youtubeWarning = "";

    for (const q of searchQueries) {
        try {
            const result = await youtubeService.search(q, "track", 5);
            collectedTracks.push(...(result.tracks?.items || []));
        } catch (err) {
            youtubeSource = "unavailable";
            youtubeWarning = describeYouTubeError(err);
            break;
        }
    }

    const seen = new Set();
    const youtubeTracks = collectedTracks
        .filter((t) => {
            if (seen.has(t.id)) return false;
            seen.add(t.id);
            return true;
        })
        .slice(0, songCount);

    const recommendations = youtubeTracks.map((track) => ({
        youtubeId: track.id,
        title: track.name,
        artist: track.artists?.map((a) => a.name).join(", ") || "",
        reason: playlistConcept.description || "Fits generated playlist theme",
        source: "youtube-api"
    }));

    const historyEntry = await RecommendationHistory.create({
        userId: req.userId,
        type: "playlist-generation",
        prompt: prompt || mood || genres?.join(", ") || "",
        mood: playlistConcept.mood || mood || "",
        recommendations: [
            ...localScored.map((item) => ({
                songId: item.song._id,
                title: item.song.title,
                artist: item.song.artist,
                reason: item.reason,
                score: item.score,
                source: "local-library"
            })),
            ...recommendations
        ],
        youtubeResults: {
            playlistName: playlistConcept.playlistName,
            description: playlistConcept.description,
            tracks: youtubeTracks
        },
        metadata: {
            ...playlistConcept,
            sources: {
                playlistConcept: playlistResult.source,
                recommendations: youtubeSource,
                localLibrary: localSongs.length ? "local-library" : "empty"
            }
        }
    });
    await storeAIHistory(req.userId, prompt || mood || genres?.join(", ") || "playlist", {
        playlistConcept,
        localSongs: localScored.map((item) => ({ song: item.song._id, score: item.score }))
    }, "playlist");

    res.json({
        success: true,
        playlist: {
            name: playlistConcept.playlistName,
            description: playlistConcept.description,
            mood: playlistConcept.mood,
            genres: playlistConcept.genres,
            localSongs: localScored.map((item) => ({
                ...item.song.toObject(),
                aiScore: item.score,
                reason: item.reason,
                source: "local-library"
            })),
            tracks: youtubeTracks,
            aiSuggestions: playlistConcept.trackSuggestions || []
        },
        sources: {
            playlistConcept: playlistResult.source,
            recommendations: youtubeSource,
            localLibrary: localSongs.length ? "local-library" : "empty"
        },
        warnings: [
            playlistResult.warning,
            youtubeWarning,
            !localSongs.length ? "No matching local songs found." : ""
        ].filter(Boolean),
        historyId: historyEntry._id
    });
});

/**
 * POST /api/ai/smart-search
 */
exports.smartSearch = asyncHandler(async (req, res) => {
    const { query } = req.body;
    const parsed = await safeGemini(
        () => geminiService.naturalLanguageSearch(query),
        parseSmartQuery(query)
    );
    const fallbackParsed = parseSmartQuery(query);
    const normalized = {
        ...fallbackParsed,
        ...parsed,
        genre: parsed.genre || fallbackParsed.genre,
        mood: parsed.mood || fallbackParsed.mood,
        lyricFragment: parsed.lyricFragment || fallbackParsed.lyricFragment,
        year: parsed.year || fallbackParsed.year
    };

    const songs = await findLocalSongs({
        query,
        genre: normalized.genre,
        mood: normalized.mood,
        lyricFragment: normalized.lyricFragment,
        year: normalized.year,
        limit: 30
    });
    const [albums, podcasts] = await Promise.all([
        Album.find({
            $or: [
                { title: new RegExp(escapeRegex(query), "i") },
                { artist: new RegExp(escapeRegex(query), "i") },
                ...(normalized.genre ? [{ genre: normalized.genre }] : [])
            ]
        }).limit(20),
        Podcast.find({
            $or: [
                { title: new RegExp(escapeRegex(query), "i") },
                { artist: new RegExp(escapeRegex(query), "i") },
                { description: new RegExp(escapeRegex(query), "i") },
                ...(normalized.genre ? [{ genre: normalized.genre }] : []),
                ...(normalized.mood ? [{ mood: normalized.mood }] : [])
            ]
        }).limit(20)
    ]);

    await storeAIHistory(req.userId, query, { parsed: normalized, songs: songs.length, albums: albums.length, podcasts: podcasts.length }, "smart-search");

    res.json({
        success: true,
        parsed: normalized,
        explanation: normalized.explanation || parsed.explanation || fallbackParsed.explanation,
        songs,
        albums,
        podcasts
    });
});

/**
 * POST /api/ai/lyrics
 */
exports.lyricsAssistant = asyncHandler(async (req, res) => {
    const { query } = req.body;
    const fragment = query.replace(/song with|lyrics|find|search|"/gi, "").trim() || query;
    const songs = await findLocalSongs({
        lyricFragment: fragment,
        limit: 20
    });
    const userContext = await buildUserContext(req.userId);
    const scored = await storeScoredRecommendations(
        req.userId,
        songs,
        userContext,
        { reason: `Matched lyrics containing "${fragment}"` },
        "lyrics"
    );

    await storeAIHistory(req.userId, query, {
        lyricFragment: fragment,
        matches: scored.map((item) => ({ song: item.song._id, score: item.score }))
    }, "lyrics");

    res.json({
        success: true,
        lyricFragment: fragment,
        songs: scored.map((item) => ({ ...item.song.toObject(), aiScore: item.score, reason: item.reason }))
    });
});

/**
 * GET /api/ai/history
 */
exports.getAIHistory = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const history = await AIHistory.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .limit(limit);

    res.json({
        success: true,
        history
    });
});

/**
 * GET /api/ai/recommendations
 */
exports.getScoredRecommendations = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    let recommendations = await Recommendation.find({ user: req.userId })
        .populate("song")
        .sort({ score: -1, updatedAt: -1 })
        .limit(limit);

    if (!recommendations.length) {
        const userContext = await buildUserContext(req.userId);
        const songs = await Song.find().sort({ plays: -1, likes: -1, createdAt: -1 }).limit(limit);
        await storeScoredRecommendations(
            req.userId,
            songs,
            userContext,
            { reason: "Starter recommendations from popular library tracks" },
            "history"
        );
        recommendations = await Recommendation.find({ user: req.userId })
            .populate("song")
            .sort({ score: -1, updatedAt: -1 })
            .limit(limit);
    }

    res.json({
        success: true,
        recommendations
    });
});
