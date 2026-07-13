const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { favoriteRules } = require("../validators/favoriteValidator");
const {
    addFavorite,
    getFavorites,
    removeFavorite
} = require("../controllers/favoriteController");

router.use(authMiddleware);

router.post("/", validate(favoriteRules), addFavorite);
router.get("/", getFavorites);
router.delete("/:id", removeFavorite);

module.exports = router;
