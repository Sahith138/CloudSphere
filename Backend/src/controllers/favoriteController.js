const prisma = require("../config/prisma");

const getFavorites = async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        isFavorite: true,
        isTrashed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
        isFavorite: true,
        isTrashed: false,
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

const toggleFavoriteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await prisma.file.findUnique({ where: { id: Number(id) } });
    
    if (!file || file.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const updatedFile = await prisma.file.update({
      where: { id: Number(id) },
      data: { isFavorite: !file.isFavorite },
    });

    res.status(200).json({
      success: true,
      file: updatedFile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const toggleFavoriteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await prisma.folder.findUnique({ where: { id: Number(id) } });
    
    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: Number(id) },
      data: { isFavorite: !folder.isFavorite },
    });

    res.status(200).json({
      success: true,
      folder: updatedFolder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getFavorites,
  toggleFavoriteFile,
  toggleFavoriteFolder,
};
