const express = require("express");
const router = express.Router();

const {
    search,
    getTrack,
    getArtist,
    getAlbum,
    getNewReleases,
    getRecommendations,
    getFeaturedPlaylists,
    getRelatedArtists
} = require("../controllers/musicController");

router.get("/search", search);
router.get("/new-releases", getNewReleases);
router.get("/recommendations", getRecommendations);
router.get("/featured-playlists", getFeaturedPlaylists);

router.get("/track/:id", getTrack);
router.get("/artist/:id/related", getRelatedArtists);
router.get("/artist/:id", getArtist);
router.get("/album/:id", getAlbum);

module.exports = router;
