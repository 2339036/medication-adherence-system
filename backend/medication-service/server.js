// Sets up the Medication Service server

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const medicationRoutes = require("./routes/medicationRoutes");

const app = express();
// CONNECT TO MONGODB
connectDB();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
// ROUTES
app.use("/api/medications", medicationRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Medication service is running on port ${PORT}`);
});
