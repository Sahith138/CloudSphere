const express = require("express");
const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getDashboardStats,
  getStorageUsage,
  getAdminStats,
  getAllUsersStorage,
  updateUserQuota
} = require("../controllers/dashboardController");

router.get("/stats", authMiddleware, getDashboardStats);
router.get("/storage", authMiddleware, getStorageUsage);
router.get("/admin", authMiddleware, adminMiddleware, getAdminStats);
router.get("/admin/users", authMiddleware, adminMiddleware, getAllUsersStorage);
router.put("/admin/users/:userId/quota", authMiddleware, adminMiddleware, updateUserQuota);

module.exports = router;