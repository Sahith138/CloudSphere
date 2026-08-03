const express = require("express");
const { getActivityLogs } = require("../controllers/activityController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getActivityLogs);

module.exports = router;
