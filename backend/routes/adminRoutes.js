const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const adminController = require("../controllers/adminController");

router.use(authMiddleware, isAdmin);

router.get("/dashboard", adminController.getDashboard);
router.get("/analytics", adminController.getAnalytics);
router.get("/reports", adminController.getReports);
router.get("/settings", adminController.getSettings);

router.get("/users", adminController.getUsers);
router.patch("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

router.get("/artists", adminController.getArtists);
router.post("/artists/:id/approve", adminController.approveArtist);
router.post("/artists/:id/suspend", adminController.suspendArtist);
router.delete("/artists/:id", adminController.deleteArtist);

router.get("/songs", adminController.getSongs);
router.patch("/songs/:id", adminController.updateSong);
router.delete("/songs/:id", adminController.deleteSong);

router.get("/albums", adminController.getAlbums);
router.patch("/albums/:id", adminController.updateAlbum);
router.delete("/albums/:id", adminController.deleteAlbum);

module.exports = router;
