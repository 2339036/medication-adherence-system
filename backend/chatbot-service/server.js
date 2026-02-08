// backend/chatbot-service/server.js
// server for the chatbot microservice (hybrid: rules + FAQ retrieval)

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check (useful for testing + docker later)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Chatbot service is running" });
});

// Routes
app.use("/api/chatbot", chatbotRoutes);

// Start server
const PORT = process.env.CHATBOT_SERVICE_PORT || 5005;
app.listen(PORT, () => {
  console.log(`Chatbot service running on port ${PORT}`);
});