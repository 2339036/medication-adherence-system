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

// GET REMINDERS
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

// DELETE REMINDER
exports.deleteReminder = async (req, res) => {
  try {
    const reminderId = req.params.id;

    // Find reminder that belongs to the logged-in user
    const reminder = await Reminder.findOne({
      _id: reminderId,
      userId: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found"
      });
    }

    await reminder.deleteOne();

    res.status(200).json({
      message: "Reminder deleted successfully"
    });

  } catch (error) {
    console.error("Delete reminder error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE REMINDER
exports.updateReminder = async (req, res) => {
  try {
    const reminderId = req.params.id;
    const { sent } = req.body;

    // Find reminder that belongs to the logged-in user
    const reminder = await Reminder.findOne({
      _id: reminderId,
      userId: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found"
      });
    }

    // Update sent status if provided
    if (sent !== undefined) {
      reminder.sent = sent;
    }

    await reminder.save();

    res.status(200).json({
      message: "Reminder updated successfully",
      reminder
    });

  } catch (error) {
    console.error("Update reminder error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

