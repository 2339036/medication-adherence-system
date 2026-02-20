// this file defines the routes for creating and retrieving medication reminders
const express = require("express");
const router = express.Router();

const {
  createReminder,
  getReminders,
  deleteReminder,
  updateReminder
} = require("../controllers/notificationController");

const { verifyToken } = require("../middleware/authMiddleware");

// Create a new medication reminder (protected)
router.post("/create", verifyToken, createReminder);

// Get all reminders (protected)
router.get("/", verifyToken, getReminders);

// Update a reminder (protected)
router.put("/:id", verifyToken, updateReminder);

// Delete a reminder (protected)
router.delete("/:id", verifyToken, deleteReminder);

module.exports = router;