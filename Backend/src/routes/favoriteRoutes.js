const express = require("express");
const { getFavorites, toggleFavoriteFile, toggleFavoriteFolder } = require("../controllers/favoriteController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getFavorites);
router.put("/file/:id", authMiddleware, toggleFavoriteFile);
router.put("/folder/:id", authMiddleware, toggleFavoriteFolder);

module.exports = router;
