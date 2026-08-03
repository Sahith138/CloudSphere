const prisma = require("../config/prisma");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Admins only.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error verifying admin status" });
  }
};

module.exports = adminMiddleware;
