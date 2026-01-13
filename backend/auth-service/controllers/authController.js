// Import bcrypt for password hashing
const bcrypt = require("bcryptjs");

// Import JWT for token creation
const jwt = require("jsonwebtoken");

// Register user (NO database yet)
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {          // Basic validation
      return res.status(400).json({ message: "Email and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);     // Hash password

    const token = jwt.sign(     // Create JWT token
      { email },                     
      process.env.JWT_SECRET,        
      { expiresIn: "24h" }            // token expiry
    );

    // Respond with token (simulating successful registration)
    res.status(201).json({
      message: "User registered securely",
      token
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
