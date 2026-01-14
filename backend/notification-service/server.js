//this file sets up the notification service server with routes and middleware
//middleware is used for CORS and JSON parsing
// Import required packages
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Create Express app
const app = express();

// Middleware
app.use(cors());            // Allow cross-origin requests
app.use(express.json());    // Parse JSON request bodies

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Notification service is running"
  });
});

// Import routes
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Start server
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5003;
app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
