// Notifications.jsx
// Displays user medication reminders and alerts

import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

function Notifications() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <BackButton />
      <div className="card">
        <h2>Notifications</h2>
        <p>Notification features will be implemented here.</p>
      </div>
    </div>
  );
}

export default Notifications;
