//this file is the core logic for the adherence service where users' medication adherence is recorded and retrieved
const Adherence = require("../models/Adherence");

// MARK MEDICATION AS TAKEN / NOT TAKEN
exports.recordAdherence = async (req, res) => {
  try {
    const { medicationId, date, taken } = req.body;

    // Validation
    if (!medicationId || !date || taken === undefined) {
      return res.status(400).json({
        message: "medicationId, date, and taken are required"
      });
    }
// Create adherence record
    const adherence = await Adherence.create({
      userId: req.user.userId,   // from JWT
      medicationId,
      date,
      taken
    });

    res.status(201).json({
      message: "Adherence recorded",
      adherence
    });

  } catch (error) {
    console.error("Record adherence error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// GET ADHERENCE HISTORY FOR USER
exports.getAdherenceHistory = async (req, res) => {
  try {
    const adherenceHistory = await Adherence.find({
      userId: req.user.userId
    }).sort({ date: -1 });

    res.status(200).json(adherenceHistory);

  } catch (error) {
    console.error("Get adherence error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};
