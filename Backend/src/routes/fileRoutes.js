const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multer");

const {
      uploadFile,
      generatePresignedUrls,
      confirmUpload,
      getMyFiles,
      deleteFile,
      getFilesByFolder,
      downloadFile,
      moveFile,
      searchFiles,
      shareFile,
      getSharedFile,
      renameFile,
    } = require("../controllers/fileController");

// Legacy upload
router.post(
  "/upload",
  authMiddleware,
  upload.array("files"),
  uploadFile
);

// Direct Upload endpoints
router.post(
  "/upload-presigned-urls",
  authMiddleware,
  generatePresignedUrls
);

router.post(
  "/upload-confirm",
  authMiddleware,
  confirmUpload
);

router.get(
  "/my-files",
  authMiddleware,
  getMyFiles
);

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteFile
);

router.get(
  "/folder/:id",
  authMiddleware,
  getFilesByFolder
);

router.get(
  "/download/:id",
  authMiddleware,
  downloadFile
);

router.put(
  "/move/:id",
  authMiddleware,
  moveFile
);

router.get(
  "/search",
  authMiddleware,
  searchFiles
);

router.put(
  "/share/:id",
  authMiddleware,
  shareFile
);

router.get(
  "/shared/:token",
  getSharedFile
);

router.put(
  "/rename/:id",
  authMiddleware,
  renameFile
);
module.exports = router;