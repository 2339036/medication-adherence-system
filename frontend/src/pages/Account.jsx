// Account.jsx
// Allows users to manage account and security settings

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { updateProfile } from "../services/authService";
import BackButton from "../components/BackButton";

function Account() {
  // Input state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Only show confirm password field if user is trying to change password
  const isChangingPassword = password.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // If they typed a new password, confirm must match
    if (isChangingPassword && password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // Build payload ONLY with fields that have been entered
    const payload = {};
    if (name.trim()) payload.name = name.trim();
    if (email.trim()) payload.email = email.trim();
    if (isChangingPassword) payload.password = password;

    // If user didn't enter anything, don't call backend
    if (Object.keys(payload).length === 0) {
      setMessage("Please enter at least one field to update");
      return;
    }

    setLoading(true);

    const result = await updateProfile(payload);

    setLoading(false);

    setMessage(result.message || "Profile updated");

    // Clear password fields after a password update attempt (security)
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="page-container">
      <BackButton />

      <div className="card">
        <h2>Account Settings :)</h2>

        <form onSubmit={handleSubmit}>
          {/* Name (optional) */}
          <input
            type="text"
            placeholder="Update name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Email (optional) */}
          <input
            type="email"
            placeholder="Update email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* New password (optional) */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword((prev) => !prev)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm password (only when changing password) */}
          {isChangingPassword && (
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <span
                className="eye-icon"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Account"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Account;