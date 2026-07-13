const createPlaylistRules = [
    (body) => {
        if (!body.name || !body.name.trim()) {
            return "Playlist name is required";
        }
        return null;
    }
];

const renamePlaylistRules = [
    (body) => {
        if (!body.name || !body.name.trim()) {
            return "Playlist name is required";
        }
        return null;
    }
];

const addSongRules = [
    (body) => {
        if (!body.youtubeId && !body.songId) return "youtubeId or songId is required";
        return null;
    },
    (body) => {
        if (!body.songId && !body.title) return "title is required";
        return null;
    }
];

module.exports = {
    createPlaylistRules,
    renamePlaylistRules,
    addSongRules
};
