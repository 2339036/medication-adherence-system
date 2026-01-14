//this file handles creating and retrieving medication reminders

const { startScheduler } = require("../scheduler/reminderScheduler");   // Import scheduler

// Temporary in-memory reminder storage
const reminders = [];
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
      medicationName,
      time
    };

    reminders.push(reminder);   // Store reminder

    res.status(201).json({
      message: "Reminder created successfully",
      reminder
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};

// GET REMINDERS
exports.getReminders = (req, res) => {
  res.status(200).json(reminders);
};
