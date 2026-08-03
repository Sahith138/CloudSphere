const prisma = require("../config/prisma");

const getTrashedItems = async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        isTrashed: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
        isTrashed: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      files,
      folders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const restoreItem = async (req, res) => {
  try {
    const { type, id } = req.body; // type: 'file' or 'folder'
    
    if (type === 'file') {
      await prisma.file.update({
        where: { id: Number(id) },
        data: { isTrashed: false },
      });
      await prisma.activityLog.create({
        data: {
          action: "RESTORE_FILE",
          details: `Restored file`,
          userId: req.user.id,
          fileId: Number(id)
        }
      });
    } else if (type === 'folder') {
      await prisma.folder.update({
        where: { id: Number(id) },
        data: { isTrashed: false },
      });
      await prisma.activityLog.create({
        data: {
          action: "RESTORE_FOLDER",
          details: `Restored folder`,
          userId: req.user.id,
          folderId: Number(id)
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `${type} restored successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const emptyTrash = async (req, res) => {
  try {
    // Hard delete all trashed files
    await prisma.file.deleteMany({
      where: {
        userId: req.user.id,
        isTrashed: true,
      },
    });

    // Hard delete all trashed folders
    await prisma.folder.deleteMany({
      where: {
        userId: req.user.id,
        isTrashed: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "EMPTY_TRASH",
        details: "Emptied the trash bin",
        userId: req.user.id,
      }
    });

    res.status(200).json({
      success: true,
      message: "Trash emptied successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getTrashedItems,
  restoreItem,
  emptyTrash,
};
