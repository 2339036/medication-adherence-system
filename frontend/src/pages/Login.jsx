// frontend/src/pages/Login.jsx
// Login page for user authentication

import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh

    // Send email and password to backend login endpoint
    const result = await loginUser({ email, password });

    // If login is successful, backend returns a token
    if (result.token) {
      localStorage.setItem("token", result.token); // Store token
      setMessage("Login successful");
      login(result);           // store user globally
      navigate("/dashboard"); // redirect after login
    } else {
      setMessage(result.message || "Login failed");
    }
  };

  return (
    <div className="page-container">
      <BackButton />
      <div className="card">
        <h2>Login</h2>

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          
          {/* Email input field */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password input with visibility toggle */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"} // Toggle password visibility
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Eye icon to toggle password visibility */}
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Forgot password link */}
          <div style={{ textAlign: "right", marginBottom: "1rem" }}>
            <Link to="/forgot-password" style={{ fontSize: "0.9rem" }}>
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <button type="submit">Login</button>
        </form>

        {/* Register link */}
        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Don’t have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>

        {/* Display login message if it exists */}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Login;
