import { useState } from "react";
import { loginUser } from "../services/authService";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh

    // Send email and password to backend login endpoint
    const result = await loginUser({ email, password });

    // If login is successful, backend returns a token
    if (result.token) {
      localStorage.setItem("token", result.token); // Store token
      setMessage("Login successful");
    } else {
      setMessage(result.message || "Login failed");
    }
  };

  return (
    <div className="page-container">
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

          {/* Submit button */}
          <button type="submit">Login</button>
        </form>

        {/* Display login message if it exists */}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Login;
