const prisma = require("../config/prisma");

const getActivityLogs = async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        file: true,
        folder: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getActivityLogs,
};
