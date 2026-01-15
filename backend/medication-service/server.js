// Sets up the Medication Service server

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Medication service is running"
  });
});

// Routes
const medicationRoutes = require("./routes/medicationRoutes");
app.use("/api/medications", medicationRoutes);

// Start server
const PORT = process.env.MEDICATION_SERVICE_PORT || 5002;
app.listen(PORT, () => {
  console.log(`Medication service running on port ${PORT}`);
});
