//this file defines the Reminder model for the notification service
const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Medication"
    },
    medicationName: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    sent: {           //makes sure reminder is only sent oncce
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);
