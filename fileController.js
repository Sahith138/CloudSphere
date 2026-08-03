const prisma = require("../config/prisma");
const crypto = require("crypto");
const { createNotification } = require("./notificationController");
// UPLOAD FILE
const uploadFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentFiles = await prisma.file.findMany({
      where: { userId: req.user.id },
      select: { size: true }
    });

    let currentUsedStorage = 0;
    currentFiles.forEach(f => currentUsedStorage += Number(f.size || 0));

    let newFilesSize = 0;
    req.files.forEach(f => newFilesSize += Number(f.size || 0));

    if (currentUsedStorage + newFilesSize > user.storageQuota) {
      return res.status(400).json({ 
        success: false, 
        message: `Storage Quota Exceeded. You have ${((user.storageQuota - currentUsedStorage)/1024/1024).toFixed(2)} MB remaining.` 
      });
    }

    const uploadedFiles = [];
    const activities = [];

    for (const file of req.files) {
      const newFile = await prisma.file.create({
        data: {
          name: file.originalname,
          fileUrl: file.location || file.path,
          size: String(file.size),
          userId: req.user.id,
          folderId: req.body.folderId ? Number(req.body.folderId) : null,
          groupId: req.body.groupId ? Number(req.body.groupId) : null,
        },
      });

      uploadedFiles.push(newFile);

      activities.push({
        action: "UPLOAD_FILE",
        details: `Uploaded file ${newFile.name}`,
        userId: req.user.id,
        fileId: newFile.id,
        folderId: newFile.folderId,
        groupId: newFile.groupId
      });
    }

    await prisma.activityLog.createMany({
      data: activities
    });

    await createNotification(req.user.id, `Successfully uploaded ${uploadedFiles.length} file(s)`, "UPLOAD_COMPLETED");

    res.status(201).json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper to parse sort and type
const getQueryOptions = (query) => {
  let orderBy = { createdAt: "desc" };
  if (query.sort) {
    const [field, order] = query.sort.split("_");
    if (field && order && ["name", "size", "createdAt"].includes(field) && ["asc", "desc"].includes(order)) {
      orderBy = { [field]: order };
    }
  }

  let fileFilter = {};
  if (query.type && query.type !== "all") {
    // Basic extension filtering
    if (query.type === "image") {
      fileFilter = { name: { endsWith: ".jpg", mode: 'insensitive' } }; // simplified, ideally we'd check mime type or multiple extensions like jpg, png, jpeg
      // Better approach for Prisma:
      fileFilter = {
        OR: [
          { name: { endsWith: ".jpg", mode: 'insensitive' } },
          { name: { endsWith: ".jpeg", mode: 'insensitive' } },
          { name: { endsWith: ".png", mode: 'insensitive' } },
          { name: { endsWith: ".gif", mode: 'insensitive' } },
        ]
      };
    } else if (query.type === "pdf") {
      fileFilter = { name: { endsWith: ".pdf", mode: 'insensitive' } };
    } else if (query.type === "doc") {
      fileFilter = {
        OR: [
          { name: { endsWith: ".doc", mode: 'insensitive' } },
          { name: { endsWith: ".docx", mode: 'insensitive' } },
          { name: { endsWith: ".txt", mode: 'insensitive' } },
        ]
      };
    } else if (query.type === "video") {
      fileFilter = {
        OR: [
          { name: { endsWith: ".mp4", mode: 'insensitive' } },
          { name: { endsWith: ".mkv", mode: 'insensitive' } },
          { name: { endsWith: ".avi", mode: 'insensitive' } },
        ]
      };
    }
  }

  return { orderBy, fileFilter };
};

// GET MY FILES
const getMyFiles = async (req, res) => {
  try {
    const { orderBy, fileFilter } = getQueryOptions(req.query);

    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        isTrashed: false,
        ...fileFilter,
      },
      orderBy,
    });

    res.status(200).json({
      success: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const getFilesByFolder = async (req, res) => {
  try {
    const folderId = Number(req.params.id);
    const { orderBy, fileFilter } = getQueryOptions(req.query);

    const files = await prisma.file.findMany({
      where: {
        folderId,
        userId: req.user.id,
        isTrashed: false,
        ...fileFilter,
      },
      orderBy,
    });

    res.status(200).json({
      success: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const path = require("path");

const downloadFile = async (req, res) => {
  try {

    const file = await prisma.file.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    if (file.fileUrl.startsWith("http")) {
      return res.redirect(file.fileUrl);
    }

    const filePath = path.join(
      process.cwd(),
      file.fileUrl
    );

    res.download(filePath,file.name);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.update({
      where: {
        id: Number(id),
      },
      data: {
        isTrashed: true,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: "TRASH_FILE",
        details: `Moved file ${file.name} to trash`,
        userId: req.user.id,
        fileId: file.id,
      }
    });

    res.status(200).json({
      success: true,
      message: "File moved to trash successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const moveFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;

    const file = await prisma.file.update({
      where: {
        id: Number(id),
      },
      data: {
        folderId: Number(folderId),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "MOVE_FILE",
        details: `Moved file ${file.name}`,
        userId: req.user.id,
        fileId: file.id,
        folderId: file.folderId
      }
    });

    res.status(200).json({
      success: true,
      message: "File moved successfully",
      file,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const searchFiles = async (req, res) => {
  try {
    const { name } = req.query;

    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        isTrashed: false,
        OR: [
          {
            name: {
              contains: name,
              mode: "insensitive",
            }
          },
          {
            keywords: {
              has: name
            }
          }
        ]
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const shareFile = async (req, res) => {
  try {
    const fileId = Number(req.params.id);

    const token = crypto.randomUUID();

    const file = await prisma.file.update({
      where: {
        id: fileId,
      },
      data: {
        shareToken: token,
        isPublic: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "SHARE_FILE",
        details: `Shared file ${file.name}`,
        userId: req.user.id,
        fileId: file.id,
      }
    });
    
    await createNotification(req.user.id, `You created a share link for ${file.name}`, "FILE_SHARED");

    res.json({
      success: true,
      link: `http://localhost:5173/shared/${token}`,
      file,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const getSharedFile = async (req, res) => {
  try {

    const file = await prisma.file.findUnique({
      where: {
        shareToken: req.params.token,
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.json({
      success: true,
      file,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const renameFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const file = await prisma.file.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "RENAME_FILE",
        details: `Renamed file to ${file.name}`,
        userId: req.user.id,
        fileId: file.id,
      }
    });

    res.json({
      success: true,
      message: "File renamed successfully",
      file,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
};
module.exports = {
  uploadFile,
  getMyFiles,
  downloadFile,
  deleteFile,
  moveFile,
  searchFiles,
  getFilesByFolder,
  shareFile,
  getSharedFile,
  renameFile,
};