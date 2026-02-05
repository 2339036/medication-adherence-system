//this file is the core logic for the adherence service where users' medication adherence is recorded and retrieved
const Adherence = require("../models/Adherence");

// MARK MEDICATION AS TAKEN / NOT TAKEN
exports.recordAdherence = async (req, res) => {
  try {
    const { medicationId, date, taken, doseIndex } = req.body;

    // Validation
    if (!medicationId || !date || taken === undefined || doseIndex === undefined) {
      return res.status(400).json({
        message: "medicationId, date, taken, and doseIndex are required"
      });
    }

    // Check if adherence already exists for this medication on this date
    const existingRecord = await Adherence.findOne({
      userId: req.user.userId,
      medicationId,
      date,
      doseIndex
     });

    // IF IT EXISTS --> UPDATE
    if (existingRecord) {
      existingRecord.taken = taken;
      await existingRecord.save();

      return res.status(200).json({
        message: "Adherence updated",
        adherence: existingRecord
      });
    }

    // IF IT DOES NOT EXIST --> CREATE
    const adherence = await Adherence.create({
      userId: req.user.userId,
      medicationId,
      date,
      taken,
      doseIndex
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
    }).sort({ date: -1, doseIndex: 1 });

    res.status(200).json(adherenceHistory);

  } catch (error) {
    console.error("Get adherence error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// UPDATE ADHERENCE (change taken ↔ not taken)
exports.updateAdherence = async (req, res) => {
  try {
    const { medicationId, date, taken, doseIndex } = req.body;

    if (!medicationId || !date || taken === undefined || doseIndex === undefined) {
      return res.status(400).json({
        message: "medicationId, date, taken, and doseIndex are required"
      });
    }

    const adherence = await Adherence.findOneAndUpdate(
      {
        userId: req.user.userId,
        medicationId,
        date,
        doseIndex
      },
      { taken },
      { new: true }
    );

    if (!adherence) {
      return res.status(404).json({
        message: "Adherence record not found"
      });
    }

    res.status(200).json({
      message: "Adherence updated successfully",
      adherence
    });

  } catch (error) {
    console.error("Update adherence error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


// GET ADHERENCE SUMMARY FOR USER
exports.getAdherenceSummary = async (req, res) => {
  try {
    const records = await Adherence.find({
      userId: req.user.userId
    });

    const total = records.length;
    const taken = records.filter(r => r.taken).length;
    const missed = total - taken;

    const adherenceRate = total === 0
      ? 0
      : Math.round((taken / total) * 100);

    res.status(200).json({
      total,
      taken,
      missed,
      adherenceRate
    });

  } catch (error) {
    console.error("Get adherence summary error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

