//this file handles medication creation and retrieval
// Temporary in-memory medication storage
const medications = [];

// CREATE MEDICATION (Protected)
exports.createMedication = (req, res) => {
  try {
    const { name, dosage, frequency } = req.body;

    // Validation
    if (!name || !dosage || !frequency) {
      return res.status(400).json({
        message: "Name, dosage, and frequency are required"
      });
    }

    // Create medication object
    const medication = {
      id: Date.now().toString(),
      userId: req.userId,   // Comes from JWT middleware
      name,
      dosage,
      frequency
    };

    medications.push(medication);   // Save medication

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
exports.getMedications = (req, res) => {
  const userMedications = medications.filter(
    med => med.userId === req.userId
  );

  res.status(200).json(userMedications);
};
