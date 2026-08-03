const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const folderRoutes = require("./routes/folderRoutes");
const fileRoutes = require("./routes/fileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const trashRoutes = require("./routes/trashRoutes");
const activityRoutes = require("./routes/activityRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const groupRoutes = require("./routes/groupRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Set security HTTP headers, allow cross-origin media

// Rate limiting: 1000 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use("/api", limiter);


// Prevent HTTP Parameter Pollution
app.use(hpp());

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CloudSphere Backend Running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});