// ForgotPassword.jsx
// Placeholder page for password recovery

import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

function ForgotPassword() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <BackButton />
      <div className="card">
        <h2>Forgot Password</h2>

        <p style={{ marginBottom: "1rem", textAlign: "center" }}>
          Password reset functionality will be added later.
        </p>

        <input type="email" placeholder="Enter your email" disabled />

        <button disabled style={{ marginTop: "1rem", opacity: 0.6 }}>
          Reset Password
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
