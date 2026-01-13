// bcrypt is used to hash and compare passwords securely
const bcrypt = require("bcryptjs");

// TEMPORARY IN-MEMORY USER STORE

// This simulates a database for now.
// Each time the server restarts, this will reset.
// will replace this with MongoDB later WITHOUT changing routes.
const users = [];

// Simple email format check
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// REGISTER CONTROLLER
// Creates a new user with a hashed password
exports.register = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Trim inputs
    name = name?.trim();
    email = email?.trim();
// Validate inputs
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
// Password length check
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }
// Check for existing user
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
// Hash password and store user
    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
      id: users.length + 1,
      name,
      email,
      password: hashedPassword
    });
// Respond with success
    res.status(201).json({
      message: "User registered successfully",
      user: { name, email }
    });
// Catch errors
  } catch (error) {
    res.status(500).json({
      message: "Server error during registration",
      error: error.message
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
// Validate inputs
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
// Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
// Respond with success
    res.status(200).json({
      message: "Login successful",
      user: { name: user.name, email: user.email }
    });
//  Catch errors
  } catch (error) {
    res.status(500).json({
      message: "Server error during login",
      error: error.message
    });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    let { email, name, password } = req.body;

    email = email?.trim();
    name = name?.trim();
// Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
// Check if at least one field to update is provided
    if (!name && !password) {
      return res.status(400).json({
        message: "No fields provided to update"
      });
    }
// Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
// Update fields if provided
    if (name) {
      user.name = name;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters long"
        });
      }
// Hash new password
      user.password = await bcrypt.hash(password, 10);
    }
// Respond with success
    res.status(200).json({
      message: "Profile updated successfully",
      user: { name: user.name, email: user.email }
    });
// Catch errors
  } catch (error) {
    res.status(500).json({
      message: "Server error during profile update",
      error: error.message
    });
  }
};