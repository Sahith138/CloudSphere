const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createFolder,
  getFolders,
  deleteFolder,
  renameFolder,
} = require("../controllers/folderController");

router.post(
  "/create",
  authMiddleware,
  createFolder
);

router.get(
  "/my-folders",
  authMiddleware,
  getFolders
);

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteFolder
);

router.put(
  "/rename/:id",
  authMiddleware,
  renameFolder
);

module.exports = router;