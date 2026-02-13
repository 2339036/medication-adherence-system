// Dashboard.jsx
// Main dashboard shown after successful login

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/MediFlow-logo.png";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName =
    (user && (user.name || user.username)) || (user && user.email && user.email.split("@")[0]);

  // Handle logout
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Redirect user back to login page
    navigate("/");
  };

  return (
    <div className="page-container dashboard-page">
      <div className="card">
        <h2 className="card-title">Dashboard</h2>

        {/* Logo and welcome message */}
        <div className="dashboard-header">
          <img src={logo} alt="MediFlow Logo" className="logo in-card-logo" />
          <h2>Welcome Back, {displayName || "User"}</h2>
        </div>

        {/* Welcome message */}
        <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Welcome to your Medication Adherence Dashboard
        </p>

        {/* Dashboard navigation buttons */}
        <div className="dashboard-actions">
          {/* Navigate to medications page */}
          <button onClick={() => navigate("/medications")}>
            Medication History
          </button>

          {/* Navigate to profile / security settings */}
          <button onClick={() => navigate("/account")}>
            Security Settings
          </button>

          {/* Navigate to chatbot page */}
          <button onClick={() => navigate("/chatbot")}>
            Chatbot
          </button>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{ marginTop: "1.5rem", backgroundColor: "#d61919" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
