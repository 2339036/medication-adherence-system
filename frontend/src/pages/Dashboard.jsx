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
