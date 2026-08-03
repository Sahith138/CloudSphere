const express = require("express");
const { 
  createGroup, 
  getMyGroups, 
  inviteMember, 
  acceptInvitation, 
  rejectInvitation,
  getGroupMembers,
  updateMemberRole,
  getGroupInvitations,
  getGroupFiles,
  getGroupActivity
} = require("../controllers/groupController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createGroup);
router.get("/my-groups", authMiddleware, getMyGroups);
router.post("/:groupId/invite", authMiddleware, inviteMember);
router.put("/invitations/:id/accept", authMiddleware, acceptInvitation);
router.put("/invitations/:id/reject", authMiddleware, rejectInvitation);
router.get("/:groupId/members", authMiddleware, getGroupMembers);
router.put("/:groupId/members/:memberId/role", authMiddleware, updateMemberRole);
router.get("/invitations", authMiddleware, getGroupInvitations);
router.get("/:groupId/files", authMiddleware, getGroupFiles);
router.get("/:groupId/activity", authMiddleware, getGroupActivity);

module.exports = router;
