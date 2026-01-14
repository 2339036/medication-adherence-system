// this file handles creating and retrieving medication reminders

const { startScheduler } = require("../scheduler/reminderScheduler");

// Temporary in-memory reminder storage
const reminders = [];

// Start the scheduler once
startScheduler(reminders);

// CREATE REMINDER
exports.createReminder = (req, res) => {
  try {
    const { medicationName, time } = req.body;

    // Validation
    if (!medicationName || !time) {
      return res.status(400).json({
        message: "Medication name and time are required"
      });
    }

    // Create reminder object
    const reminder = {
      id: Date.now().toString(),
      userId: req.userId, 
      medicationName,
      time
    };

    reminders.push(reminder);   // Store reminder

    res.status(201).json({
      message: "Reminder scheduled successfully",
      reminder
    });

  } catch (error) {
    console.error("Create reminder error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// GET REMINDERS (only for logged-in user)
exports.getReminders = (req, res) => {
  const userReminders = reminders.filter(
    reminder => reminder.userId === req.userId
  );

  res.status(200).json(userReminders);
};
