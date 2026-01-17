// Dashboard.jsx
// This page is shown ONLY after a successful login
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="page-container">
      <div className="card">
        <h2>Dashboard</h2>

        <p>Welcome! You are logged in.</p>

        {/* Later we will replace this with real features */}
        <ul>
          <li>Medication Adherence</li>
          <li>Reminders & Notifications</li>
          <li>Security Settings</li>
        </ul>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;
