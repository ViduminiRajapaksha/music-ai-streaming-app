const favoriteRules = [
    (body) => {
        if (!body.youtubeId) return "youtubeId is required";
        return null;
    },
    (body) => {
        if (!body.title) return "title is required";
        return null;
    },
    (body) => {
        if (!body.artist) return "artist is required";
        return null;
    }
];

module.exports = { favoriteRules };
