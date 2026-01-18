// this file handles medication creation and retrieval using MongoDB
//file: backend/medication-service/controllers/medicationController.js
const Medication = require("../models/Medication");

// CREATE MEDICATION (Protected)
exports.createMedication = async (req, res) => {
  try {
    const { name, dosage, frequency } = req.body;

    // Extract userId defensively (handles both middleware conventions)
    const userId = req.user?.userId || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Validation
    if (!name || !dosage || !frequency) {
      return res.status(400).json({
        message: "Name, dosage, and frequency are required"
      });
    }

    // Create medication in MongoDB
    const medication = await Medication.create({
      userId,
      name,
      dosage,
      frequency
    });

    res.status(201).json({
      message: "Medication added successfully",
      medication
    });

  } catch (error) {
    console.error("Create medication error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// GET MEDICATIONS (only for logged-in user)
exports.getMedications = async (req, res) => {
  try {
    // Extract userId defensively (handles both middleware conventions)
    const userId = req.user?.userId || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const medications = await Medication.find({
      userId
    });

    res.status(200).json(medications);

  } catch (error) {
    console.error("Get medications error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// DELETE MEDICATION (Protected)
exports.deleteMedication = async (req, res) => {
  try {
    // Extract userId defensively (handles both middleware conventions)
    const userId = req.user?.userId || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const deletedMed = await Medication.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!deletedMed) {
      return res.status(404).json({ message: "Medication not found" });
    }

    res.status(200).json({ message: "Medication deleted successfully" });
  } catch (error) {
    console.error("Delete medication error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE MEDICATION (Protected)
exports.updateMedication = async (req, res) => {
  try {
    const { name, dosage, frequency } = req.body;

    // Extract userId defensively (handles both middleware conventions)
    const userId = req.user?.userId || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Validation
    if (!name || !dosage || !frequency) {
      return res.status(400).json({
        message: "Name, dosage, and frequency are required"
      });
    }

    // Update medication
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId },
      { name, dosage, frequency },
      { new: true }
    );

    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    res.status(200).json({
      message: "Medication updated successfully",
      medication
    });
  } catch (error) {
    console.error("Update medication error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

