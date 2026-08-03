const prisma = require("../config/prisma");

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalFiles = await prisma.file.count({
      where: {
        userId: req.user.id,
      },
    });

    const totalFolders = await prisma.folder.count({
      where: {
        userId: req.user.id,
      },
    });

    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
      },
      select: {
        size: true,
      },
    });

    let totalBytes = 0;

    files.forEach((file) => {
      totalBytes += Number(file.size || 0);
    });

    const storageUsed = (
      totalBytes /
      1024 /
      1024
    ).toFixed(2);

    const largestFileRecord = await prisma.file.findFirst({
      where: { userId: req.user.id, isTrashed: false },
      orderBy: { size: 'desc' },
    });
    
    const largestFile = largestFileRecord ? largestFileRecord.name : "N/A";

    const groupsJoined = await prisma.groupMember.count({
      where: { userId: req.user.id }
    });

    res.json({
      totalFiles,
      totalFolders,
      storageUsed,
      largestFile,
      groupsJoined
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
};

// Storage Usage
const getStorageUsage = async (req, res) => {
  try {

    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
      },
      select: {
        size: true,
      },
    });

    let totalBytes = 0;

    files.forEach((file) => {
      totalBytes += Number(file.size || 0);
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { storageQuota: true }
    });

    const totalStorage = user.storageQuota || (1024 * 1024 * 1024); // default 1GB fallback

    const usedMB = (
      totalBytes /
      1024 /
      1024
    ).toFixed(2);

    const remainingMB = (
      (totalStorage - totalBytes) /
      1024 /
      1024
    ).toFixed(2);

    const percentage = (
      (totalBytes / totalStorage) *
      100
    ).toFixed(2);

    const totalMB = (totalStorage / 1024 / 1024).toFixed(0);

    res.json({
      success: true,
      usedMB,
      remainingMB,
      totalMB,
      percentage,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Admin Statistics (for AdminDashboard)
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalGroups = await prisma.group.count();
    const totalFiles = await prisma.file.count();
    
    const allFiles = await prisma.file.findMany({ select: { size: true } });
    let totalBytes = 0;
    allFiles.forEach(f => totalBytes += Number(f.size || 0));
    
    // Storage in GB
    const storageUsed = (totalBytes / 1024 / 1024 / 1024).toFixed(2);

    const recentActivity = await prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    res.json({
      success: true,
      totalUsers,
      totalGroups,
      totalFiles,
      storageUsed: `${storageUsed} GB`,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllUsersStorage = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        storageQuota: true,
        files: { select: { size: true } }
      }
    });

    const userData = users.map(user => {
      let totalBytes = 0;
      user.files.forEach(f => totalBytes += Number(f.size || 0));
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        storageQuota: user.storageQuota,
        usedBytes: totalBytes,
        usedMB: (totalBytes / 1024 / 1024).toFixed(2)
      };
    });

    res.json({ success: true, users: userData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateUserQuota = async (req, res) => {
  try {
    const { userId } = req.params;
    const { quotaBytes } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { storageQuota: Number(quotaBytes) }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getStorageUsage,
  getAdminStats,
  getAllUsersStorage,
  updateUserQuota
};