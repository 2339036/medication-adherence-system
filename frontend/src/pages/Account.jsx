// Account.jsx
// Allows users to manage account and security settings

import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

function Account() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <BackButton />
      <div className="card">
        <h2>Security Settings</h2>
        <p>Account update features will be added here.</p>
      </div>
    </div>
  );
}

export default Account;
