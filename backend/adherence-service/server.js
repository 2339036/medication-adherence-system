//this file is backend/adherence-service/server.js
//it sets up a basic server for the adherence service
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const adherenceRoutes = require("./routes/adherenceRoutes");
const connectDB = require("./config/db");


const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/adherence", adherenceRoutes);


// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Adherence service is running",
    service: "adherence-service",
    port: process.env.PORT
  });
});

// Start server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Adherence service running on port ${PORT}`);
});
