const axios = require("axios");

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/**
 * Call the Google Gemini API using axios.
 */
const generateContent = async (prompt, systemInstruction = "") => {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
        throw new Error("Gemini API key is not configured");
    }

    const url = `${GEMINI_API_BASE}/models/${model}:generateContent`;

    const body = {
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ]
    };

    if (systemInstruction) {
        body.systemInstruction = {
            parts: [{ text: systemInstruction }]
        };
    }

    const response = await axios.post(url, body, {
        params: { key: apiKey },
        headers: { "Content-Type": "application/json" }
    });

    const text =
        response.data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text)
            .join("") || "";

    if (!text) {
        throw new Error("Gemini returned an empty response");
    }

    return text;
};

/**
 * Parse JSON from Gemini responses that may include markdown fences.
 */
const parseJsonResponse = (text) => {
    const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) {
            return JSON.parse(match[0]);
        }
        throw new Error("Failed to parse AI JSON response");
    }
};

const MUSIC_SYSTEM_PROMPT = `You are a knowledgeable music assistant for an educational music streaming app.
Help users discover music, understand genres, moods, and artists.
When asked for structured data, respond with valid JSON only — no markdown or extra text.
Be concise, friendly, and educational.`;

const chat = async (message, context = "") => {
    const prompt = context
        ? `Conversation context:\n${context}\n\nUser message: ${message}`
        : message;

    return generateContent(prompt, MUSIC_SYSTEM_PROMPT);
};

const detectMood = async (description) => {
    const prompt = `Analyze the following text and detect the user's mood and suitable music characteristics.

Text: "${description}"

Respond with JSON only:
{
  "mood": "single word mood",
  "energy": "low|medium|high",
  "genres": ["genre1", "genre2"],
  "searchTerms": ["term1", "term2", "term3"],
  "explanation": "brief explanation"
}`;

    const response = await generateContent(prompt, MUSIC_SYSTEM_PROMPT);
    return parseJsonResponse(response);
};

const naturalLanguageSearch = async (query) => {
    const prompt = `Convert this natural language music request into YouTube search queries.

Request: "${query}"

Respond with JSON only:
{
  "trackQuery": "best track search query",
  "artistQuery": "optional artist query or empty string",
  "genre": "primary genre if identifiable",
  "mood": "detected mood",
  "explanation": "why these searches fit the request"
}`;

    const response = await generateContent(prompt, MUSIC_SYSTEM_PROMPT);
    return parseJsonResponse(response);
};

const generatePlaylistSuggestions = async (preferences) => {
    const prompt = `Create a playlist concept based on these preferences:

${JSON.stringify(preferences, null, 2)}

Respond with JSON only:
{
  "playlistName": "creative playlist name",
  "description": "playlist description",
  "mood": "overall mood",
  "genres": ["genre1", "genre2"],
  "searchQueries": ["query1", "query2", "query3", "query4", "query5"],
  "trackSuggestions": [
    { "title": "song title", "artist": "artist name", "reason": "why it fits" }
  ]
}`;

    const response = await generateContent(prompt, MUSIC_SYSTEM_PROMPT);
    return parseJsonResponse(response);
};

const personalizedRecommendations = async (userContext) => {
    const prompt = `Based on this user's music profile, suggest personalized recommendations.

User profile:
${JSON.stringify(userContext, null, 2)}

Respond with JSON only:
{
  "summary": "brief personalization summary",
  "mood": "suggested listening mood",
  "genres": ["genre1", "genre2"],
  "searchQueries": ["query1", "query2", "query3"],
  "recommendations": [
    { "title": "song", "artist": "artist", "reason": "personalized reason" }
  ]
}`;

    const response = await generateContent(prompt, MUSIC_SYSTEM_PROMPT);
    return parseJsonResponse(response);
};

module.exports = {
    generateContent,
    parseJsonResponse,
    chat,
    detectMood,
    naturalLanguageSearch,
    generatePlaylistSuggestions,
    personalizedRecommendations
};
