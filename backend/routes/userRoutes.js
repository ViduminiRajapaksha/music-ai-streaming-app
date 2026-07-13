const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    recordListening,
    getListeningHistory,
    getRecentlyPlayed,
    getMostPlayed,
    getContinueListening,
    updateFavoriteGenres,
    getChatHistory,
    getRecommendationHistory,
    deleteRecommendationHistory
} = require("../controllers/userController");

router.use(authMiddleware);

router.post("/listening-history", recordListening);
router.get("/listening-history", getListeningHistory);
router.get("/recently-played", getRecentlyPlayed);
router.get("/most-played", getMostPlayed);
router.get("/continue-listening", getContinueListening);
router.put("/favorite-genres", updateFavoriteGenres);
router.get("/chat-history", getChatHistory);
router.get("/recommendation-history", getRecommendationHistory);
router.delete("/recommendation-history/:id", deleteRecommendationHistory);

module.exports = router;
