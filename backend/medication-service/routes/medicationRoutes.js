//this file defines medication-related routes
const express = require("express");
const router = express.Router();

const {
  createMedication,
  getMedications
} = require("../controllers/medicationController");

const { verifyToken } = require("../middleware/authMiddleware");

// Create medication (protected)
router.post("/create", verifyToken, createMedication);

// Get medications (protected)
router.get("/", verifyToken, getMedications);

module.exports = router;
