//this file defines the routes for creating and retrieving medication reminders
const express = require("express");
const router = express.Router();

const {
  createReminder,
  getReminders
} = require("../controllers/notificationController");

// Create a new medication reminder
router.post("/create", createReminder);

// Get all reminders
router.get("/", getReminders);

module.exports = router;
