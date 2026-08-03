const prisma = require("../config/prisma");

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createNotification = async (userId, message, type) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message,
        type
      }
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification
};
