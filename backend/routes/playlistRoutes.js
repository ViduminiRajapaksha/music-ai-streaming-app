const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
    createPlaylistRules,
    renamePlaylistRules,
    addSongRules
} = require("../validators/playlistValidator");
const {
    createPlaylist,
    getPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    sharePlaylist,
    getSharedPlaylist,
    addCollaborator,
    removeCollaborator
} = require("../controllers/playlistController");

router.get("/shared/:shareCode", getSharedPlaylist);

router.use(authMiddleware);

router.post("/", validate(createPlaylistRules), createPlaylist);
router.get("/", getPlaylists);
router.get("/:id", getPlaylistById);
router.put("/:id", validate(renamePlaylistRules), updatePlaylist);
router.delete("/:id", deletePlaylist);
router.post("/:id/add-song", validate(addSongRules), addSongToPlaylist);
router.delete("/:id/remove-song/:songId", removeSongFromPlaylist);

// Playlist sharing routes
router.post("/:id/share", sharePlaylist);
router.post("/:id/collaborators", addCollaborator);
router.delete("/:id/collaborators/:userId", removeCollaborator);

module.exports = router;
