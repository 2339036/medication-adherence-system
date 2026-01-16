// this file handles creating and retrieving medication reminders

const Reminder = require("../models/Reminder");

// the code below defines two functions: createReminder and getReminders
exports.createReminder = async (req, res) => {
  try {
    const { medicationId, medicationName, time } = req.body;

    if (!medicationId || !medicationName || !time) {
      return res.status(400).json({
        message: "Medication ID, name and time are required"
      });
    }
    
// Create new reminder
    const reminder = await Reminder.create({
      userId: req.user.userId,
      medicationId,
      medicationName,
      time
    });

    res.status(201).json({
      message: "Reminder created successfully",
      reminder
    });

  } catch (error) {
    console.error("Create reminder error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET REMINDERS (USER-SCOPED)
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      userId: req.user.userId
    });

    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
