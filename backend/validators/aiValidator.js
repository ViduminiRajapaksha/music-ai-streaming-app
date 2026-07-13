const chatRules = [
    (body) => {
        if (!body.message || !body.message.trim()) {
            return "message is required";
        }
        return null;
    }
];

const recommendRules = [
    (body) => {
        if (body.query !== undefined && !body.query.trim()) {
            return "query cannot be empty";
        }
        return null;
    }
];

const generatePlaylistRules = [
    (body) => {
        if (!body.prompt && !body.mood && !body.genres) {
            return "prompt, mood, or genres is required";
        }
        return null;
    }
];

const smartSearchRules = [
    (body) => {
        if (!body.query || !body.query.trim()) {
            return "query is required";
        }
        return null;
    }
];

const lyricsRules = [
    (body) => {
        if (!body.query || !body.query.trim()) {
            return "query is required";
        }
        return null;
    }
];

module.exports = {
    chatRules,
    recommendRules,
    generatePlaylistRules,
    smartSearchRules,
    lyricsRules
};
