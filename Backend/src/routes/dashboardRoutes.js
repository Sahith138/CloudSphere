const express = require("express");
const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getDashboardStats,
  getStorageUsage,
  getAdminStats,
  getAllUsersStorage,
  updateUserQuota
} = require("../controllers/dashboardController");

router.get("/stats", authMiddleware, getDashboardStats);
router.get("/storage", authMiddleware, getStorageUsage);
router.get("/admin", authMiddleware, getAdminStats);
router.get("/admin/users", authMiddleware, getAllUsersStorage);
router.put("/admin/users/:userId/quota", authMiddleware, updateUserQuota);

module.exports = router;