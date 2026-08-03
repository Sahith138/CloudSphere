const express = require("express");
const { getTrashedItems, restoreItem, emptyTrash } = require("../controllers/trashController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getTrashedItems);
router.post("/restore", authMiddleware, restoreItem);
router.delete("/empty", authMiddleware, emptyTrash);

module.exports = router;
