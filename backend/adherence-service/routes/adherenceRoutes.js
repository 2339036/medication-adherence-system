//this file contains the routes for the adherence service so users can record and retrieve their medication adherence
const express = require("express");
const router = express.Router();

const {
  recordAdherence,
  getAdherenceHistory,
  getAdherenceSummary
} = require("../controllers/adherenceController");

const { verifyToken } = require("../middleware/authMiddleware");

// Record adherence (taken / not taken)
router.post("/record", verifyToken, recordAdherence);

// Get adherence history for logged-in user
router.get("/", verifyToken, getAdherenceHistory);

// Get adherence summary for logged-in user
router.get("/summary", verifyToken, getAdherenceSummary);


module.exports = router;
