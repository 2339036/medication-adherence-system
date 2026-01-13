const express = require("express");
const router = express.Router();

const { register, login, updateProfile } = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware"); 

router.post("/register", register); // Public route
router.post("/login", login);   // Public route
router.put("/update-profile", authMiddleware, updateProfile);   // Protected route

module.exports = router;
