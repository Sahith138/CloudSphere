const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  summarizeDocument,
  extractKeywords,
  chatWithDocument
} = require("../controllers/aiController");

router.post("/summarize/:fileId", authMiddleware, summarizeDocument);
router.post("/extract-keywords/:fileId", authMiddleware, extractKeywords);
router.post("/chat/:fileId", authMiddleware, chatWithDocument);

module.exports = router;
