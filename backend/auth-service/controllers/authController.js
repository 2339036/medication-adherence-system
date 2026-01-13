// bcrypt is used to hash and compare passwords securely
const bcrypt = require("bcryptjs");

// TEMPORARY IN-MEMORY USER STORE

// This simulates a database for now.
// Each time the server restarts, this will reset.
// will replace this with MongoDB later WITHOUT changing routes.
const users = [];

// REGISTER CONTROLLER
// Creates a new user with a hashed password
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Enforce minimum password length
    if (password.length < 6) {
    return res.status(400).json({
        message: "Password must be at least 6 characters long"
    });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword
    };

    // Store user in memory
    users.push(newUser);

    // Send success response
    res.status(201).json({
      message: "User registered successfully",
      email: newUser.email
    });

  } catch (error) {
    // Catch unexpected errors
    res.status(500).json({
      message: "Server error during registration",
      error: error.message
    });
  }
};

// LOGIN CONTROLLER
// Authenticates a user by comparing hashed passwords
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user in memory
    const user = users.find(user => user.email === email);

    // If user does not exist
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    // If password is incorrect
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Successful login
    res.status(200).json({
      message: "Login successful",
      email: user.email
    });

  } catch (error) {
    // Catch unexpected errors
    res.status(500).json({
      message: "Server error during login",
      error: error.message
    });
  }
};
