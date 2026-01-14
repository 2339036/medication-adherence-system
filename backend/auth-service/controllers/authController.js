// Import required packages
const bcrypt = require("bcryptjs");          // For hashing passwords
const jwt = require("jsonwebtoken");         // For creating JWT tokens
//const User = require("../models/User");      // User model

// Temporary in-memory user storage (will be replaced with DB later)
const users = [];

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation: required fields
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

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword
    };

    // Save user
    users.push(newUser);

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
// Validation: required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }
// Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }
// Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }
// Create JWT token
    const token = jwt.sign( 
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {   
  try {
    const { name, email, password } = req.body; 

    const updateData = {};
// Collect fields to update
    if (name) updateData.name = name;
    if (email) updateData.email = email;
// If password is provided, hash it before updating
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters long"
        });
      }
      updateData.password = await bcrypt.hash(password, 10);    
    }
// Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,            
      updateData,
      { new: true }
    ).select("-password");
// Return updated user data
    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error during update" });
  }
};
