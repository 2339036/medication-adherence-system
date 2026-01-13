const express = require("express");

const { register, login, updateProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/update-profile", updateProfile);

module.exports = router;
