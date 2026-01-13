// Import required packages
const bcrypt = require("bcryptjs");          // For hashing passwords
const jwt = require("jsonwebtoken");         // For creating JWT tokens
const User = require("../models/User");      // User model

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // -------- VALIDATION --------
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    // -------- CHECK EXISTING USER --------
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists"
      });
    }

    // -------- HASH PASSWORD --------
    const hashedPassword = await bcrypt.hash(password, 10);

    // -------- CREATE USER --------
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // -------- VALIDATION --------
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // -------- FIND USER --------
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // -------- CHECK PASSWORD --------
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // -------- CREATE JWT --------
    const token = jwt.sign(
      { userId: user._id },                 // Payload (who the user is)
      process.env.JWT_SECRET,               // Secret key
      { expiresIn: "24h" }                  // Token expiry
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};