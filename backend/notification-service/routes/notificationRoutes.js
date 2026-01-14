// this file defines the routes for creating and retrieving medication reminders
const express = require("express");
const router = express.Router();

const {
  createReminder,
  getReminders
} = require("../controllers/notificationController");

const { verifyToken } = require("../middleware/authMiddleware");

// Create a new medication reminder (protected)
router.post("/create", verifyToken, createReminder);

// Get all reminders (protected)
router.get("/", verifyToken, getReminders);

module.exports = router;