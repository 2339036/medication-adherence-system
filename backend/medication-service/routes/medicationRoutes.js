//this file defines medication-related routes
//file: backend/medication-service/routes/medicationRoutes.js
const express = require("express");
const router = express.Router();

const {
  createMedication,
  getMedications,
  deleteMedication,
  updateMedication
} = require("../controllers/medicationController");

const { verifyToken } = require("../middleware/authMiddleware");

// Create medication (protected)
router.post("/create", verifyToken, createMedication);

// Get medications (protected)
router.get("/", verifyToken, getMedications);

// Update medication (protected)
router.put("/:id", verifyToken, updateMedication);

// Delete medication (protected)
router.delete("/:id", verifyToken, deleteMedication);


module.exports = router;
