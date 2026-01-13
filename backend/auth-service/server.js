//imports to create web server and allow requests from frontend
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();

// Enable CORS middleware
app.use(cors());
app.use(express.json());

// Health check route (VERY IMPORTANT)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Auth service is running",
    service: "auth-service",
    port: process.env.PORT
  });
});

// Register authentication routes
app.use("/api/auth", authRoutes);

// Define port number
const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});