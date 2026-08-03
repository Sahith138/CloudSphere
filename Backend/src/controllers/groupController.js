const prisma = require("../config/prisma");
const { createNotification } = require("./notificationController");

const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const group = await prisma.group.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: req.user.id,
            role: "OWNER"
          }
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        action: "GROUP_CREATED",
        details: `Created group ${group.name}`,
        userId: req.user.id,
        groupId: group.id
      }
    });

    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.user.id },
      include: { group: true }
    });
    
    const groups = memberships.map(m => ({
      ...m.group,
      myRole: m.role
    }));

    res.status(200).json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const { sendInviteEmail } = require("../utils/emailService");

const inviteMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: Number(groupId), userId: req.user.id } },
      include: { group: true }
    });

    if (!membership || membership.role !== "OWNER") {
      return res.status(403).json({ success: false, message: "Only owners can invite members" });
    }

    const invitee = await prisma.user.findUnique({ where: { email } });

    if (invitee) {
      const existingMember = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: Number(groupId), userId: invitee.id } }
      });
      if (existingMember) {
        return res.status(400).json({ success: false, message: "User is already a member" });
      }
    }

    const invitation = await prisma.groupInvitation.create({
      data: {
        groupId: Number(groupId),
        inviterId: req.user.id,
        inviteeEmail: email
      },
      include: { group: true }
    });

    if (invitee) {
      // User exists, send in-app notification
      await createNotification(invitee.id, `You have been invited to join the group: ${invitation.group.name}`, "GROUP_INVITE");
      return res.status(201).json({ success: true, message: "Invitation sent successfully!" });
    } else {
      // User doesn't exist, send actual email
      const inviter = await prisma.user.findUnique({ where: { id: req.user.id } });
      await sendInviteEmail(email, invitation.group.name, inviter.name);
      return res.status(201).json({ success: true, message: "Invitation sent! They will be added when they register." });
    }

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getGroupInvitations = async (req, res) => {
  try {
    const invitations = await prisma.groupInvitation.findMany({
      where: { inviteeEmail: req.user.email, status: "PENDING" },
      include: { group: true }
    });
    res.status(200).json({ success: true, invitations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = await prisma.groupInvitation.findUnique({ where: { id: Number(id) }, include: { group: true } });

    if (!invitation || invitation.inviteeEmail !== req.user.email) {
      return res.status(404).json({ success: false, message: "Invitation not found" });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Invitation already processed" });
    }

    await prisma.$transaction([
      prisma.groupInvitation.update({
        where: { id: Number(id) },
        data: { status: "ACCEPTED" }
      }),
      prisma.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId: req.user.id,
          role: "VIEWER"
        }
      })
    ]);

    await createNotification(invitation.inviterId, `${req.user.name} accepted your invitation to ${invitation.group.name}`, "INVITE_ACCEPTED");

    res.status(200).json({ success: true, message: "Joined group successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = await prisma.groupInvitation.findUnique({ where: { id: Number(id) } });

    if (!invitation || invitation.inviteeEmail !== req.user.email) {
      return res.status(404).json({ success: false, message: "Invitation not found" });
    }

    await prisma.groupInvitation.update({
      where: { id: Number(id) },
      data: { status: "REJECTED" }
    });

    res.status(200).json({ success: true, message: "Invitation rejected" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const members = await prisma.groupMember.findMany({
      where: { groupId: Number(groupId) },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.status(200).json({ success: true, members });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const { role } = req.body;

    const callerMembership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: Number(groupId), userId: req.user.id } }
    });

    if (!callerMembership || callerMembership.role !== "OWNER") {
      return res.status(403).json({ success: false, message: "Only owners can change roles" });
    }

    const updatedMember = await prisma.groupMember.update({
      where: { id: Number(memberId) },
      data: { role }
    });

    res.status(200).json({ success: true, member: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getGroupFiles = async (req, res) => {
  try {
    const { groupId } = req.params;
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: Number(groupId), userId: req.user.id } }
    });

    if (!membership) return res.status(403).json({ success: false, message: "Not a group member" });

    const files = await prisma.file.findMany({
      where: { groupId: Number(groupId), isTrashed: false },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json({ success: true, files, myRole: membership.role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getGroupActivity = async (req, res) => {
  try {
    const { groupId } = req.params;
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: Number(groupId), userId: req.user.id } }
    });

    if (!membership) return res.status(403).json({ success: false, message: "Not a group member" });

    const activities = await prisma.activityLog.findMany({
      where: { groupId: Number(groupId) },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } }
    });
    res.status(200).json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  inviteMember,
  getGroupInvitations,
  acceptInvitation,
  rejectInvitation,
  getGroupMembers,
  updateMemberRole,
  getGroupFiles,
  getGroupActivity
};
