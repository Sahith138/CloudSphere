const prisma = require("../config/prisma");

// CREATE FOLDER
const createFolder = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Folder name required",
      });
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        userId: req.user.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATE_FOLDER",
        details: `Created folder ${folder.name}`,
        userId: req.user.id,
        folderId: folder.id,
      }
    });

    res.status(201).json({
      success: true,
      folder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET MY FOLDERS
const getFolders = async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
        isTrashed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      folders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
 // DELETE FOLDERS
 const deleteFolder = async (req, res) => {
try {
console.log("REQ PARAMS:", req.params);

const id = Number(req.params.id);

console.log("Parsed ID:", id);

if (!id) {
  return res.status(400).json({
    success: false,
    message: "Folder ID missing",
  });
}

const folder = await prisma.folder.update({
  where: {
    id,
  },
  data: {
    isTrashed: true,
  }
});

await prisma.activityLog.create({
  data: {
    action: "TRASH_FOLDER",
    details: `Moved folder ${folder.name} to trash`,
    userId: req.user.id,
    folderId: folder.id,
  }
});

res.json({
  success: true,
  message: "Folder moved to trash",
});

} catch (error) {
console.log(error);

res.status(500).json({
  success: false,
  error: error.message,
});

}
};
const renameFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const folder = await prisma.folder.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "RENAME_FOLDER",
        details: `Renamed folder to ${folder.name}`,
        userId: req.user.id,
        folderId: folder.id,
      }
    });

    res.json({
      success: true,
      message: "Folder renamed successfully",
      folder,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
};

module.exports = {
  createFolder,
  getFolders,
  deleteFolder,
  renameFolder,
};
