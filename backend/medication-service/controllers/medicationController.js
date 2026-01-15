// this file handles medication creation and retrieval using MongoDB

const Medication = require("../models/Medication");

// CREATE MEDICATION (Protected)
exports.createMedication = async (req, res) => {
  try {
    const { name, dosage, frequency } = req.body;

    // Validation
    if (!name || !dosage || !frequency) {
      return res.status(400).json({
        message: "Name, dosage, and frequency are required"
      });
    }

    // Create medication in MongoDB
    const medication = await Medication.create({
      userId: req.userId,   // Comes from JWT middleware
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
    const medications = await Medication.find({
      userId: req.userId
    });

    res.status(200).json(medications);

  } catch (error) {
    console.error("Get medications error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};
