//file: backend/auth-service/controllers/authController.js
// Import required packages
const bcrypt = require("bcryptjs");          // For hashing passwords
const jwt = require("jsonwebtoken");         // For creating JWT tokens
const User = require("../models/User");      // User model
const crypto = require("crypto");            // For generating random tokens


// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!password) return res.status(400).json({ message: "Password is required" });
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MongoDB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Create JWT
    const token = jwt.sign(
      { userId: newUser._id },
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

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // IMPORTANT: do not reveal whether email exists
      return res.status(200).json({
        message: "If the email exists, a reset link has been sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token valid for 15 minutes
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    // For now: log reset link (email comes later / optional)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("Password reset link:", resetLink);

    res.status(200).json({
      message: "Password reset link sent"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "New Password is required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    // Hash token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    // Set new password
    user.password = await bcrypt.hash(password, 10);

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Find user by ID
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Update name
    if (name) {
      user.name = name;
    }

    // Update email
    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          message: "Invalid email format"
        });
      }

      // Check email uniqueness
      const emailExists = await User.findOne({
        email,
        _id: { $ne: user._id }
      });

      if (emailExists) {
        return res.status(409).json({
          message: "Email already in use"
        });
      }

      user.email = email;
    }

    // Update password
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters long"
        });
      }

      user.password = await bcrypt.hash(password, 10);  // Hash new password
    }

    await user.save();  // Save updated user

    res.status(200).json({
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: "Server error during update"
    });
  }
};


