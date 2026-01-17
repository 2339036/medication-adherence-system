// Dashboard.jsx
// Main dashboard shown after successful login

import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Redirect user back to login page
    navigate("/");
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Dashboard</h2>

        {/* Welcome message */}
        <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Welcome to your Medication Adherence Dashboard
        </p>

        {/* Navigation cards (placeholders for now) */}
        <div className="dashboard-actions">
          <button>Medication History</button>
          <button>Notifications</button>
          <button>Security Settings</button>
          <button>Chatbot</button>
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
