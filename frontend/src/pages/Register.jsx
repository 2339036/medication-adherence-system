// Register.jsx
// This component allows a new user to create an account

import { useState } from "react";
import { registerUser } from "../services/authService";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // Call backend register endpoint
    const result = await registerUser({
      name,
      email,
      password
    });

    if (result.message) {
      setMessage(result.message);
    } else {
      setMessage("Registration successful");
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Email input */}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password input with show/hide icon */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >

              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm password */}
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* Submit button */}
          <button type="submit">Create Account</button>
        </form>

        {/* Feedback message */}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Register;
