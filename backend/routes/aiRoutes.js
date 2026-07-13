const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
    chatRules,
    recommendRules,
    generatePlaylistRules,
    smartSearchRules,
    lyricsRules
} = require("../validators/aiValidator");
const {
    chat,
    recommend,
    generatePlaylist,
    smartSearch,
    lyricsAssistant,
    getAIHistory,
    getScoredRecommendations
} = require("../controllers/aiController");

router.use(authMiddleware);

router.post("/chat", validate(chatRules), chat);
router.post("/recommend", validate(recommendRules), recommend);
router.post("/generate-playlist", validate(generatePlaylistRules), generatePlaylist);
router.post("/smart-search", validate(smartSearchRules), smartSearch);
router.post("/lyrics", validate(lyricsRules), lyricsAssistant);
router.get("/history", getAIHistory);
router.get("/recommendations", getScoredRecommendations);

module.exports = router;
