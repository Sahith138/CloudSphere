const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { createNotification } = require("./notificationController");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Check for pending group invitations for this email
    const pendingInvites = await prisma.groupInvitation.findMany({
      where: { inviteeEmail: email, status: "PENDING" },
      include: { group: true }
    });

    if (pendingInvites.length > 0) {
      for (const invite of pendingInvites) {
        // Accept invitation
        await prisma.groupInvitation.update({
          where: { id: invite.id },
          data: { status: "ACCEPTED" }
        });

        // Create group membership
        await prisma.groupMember.create({
          data: {
            groupId: invite.groupId,
            userId: user.id,
            role: "VIEWER" // Default role
          }
        });

        // Notify inviter
        await createNotification(invite.inviterId, `${user.name} joined CloudSphere and accepted your invitation to ${invite.group.name}`, "INVITE_ACCEPTED");
      }
    }

    res.status(201).json({
      success: true,
      message: pendingInvites.length > 0 ? `User Registered and joined ${pendingInvites.length} group(s)!` : "User Registered",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "We couldn't find an account with that email. Please check for typos or sign up!",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Token expires in 1 hour
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: tokenExpiry,
      },
    });

    // We assume the frontend is hosted at FRONTEND_URL or we just use origin
    // For now we'll use a hardcoded fallback if frontend url isn't provided
    const frontendUrl = process.env.FRONTEND_URL || "https://cloud-sphere-gold.vercel.app";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `
      <h1>You requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - CloudSphere",
        html: message,
      });

      res.status(200).json({ success: true, message: "Email sent" });
    } catch (error) {
      console.error("Email error:", error);
      // If email fails (like Ethereal expiring), don't revert the token.
      // Just return the link directly so the user can test the app without an email server!
      return res.status(200).json({ 
        success: true, 
        message: `Testing Fallback: Email failed to send, but here is your link: ${resetUrl}` 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const newHashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};