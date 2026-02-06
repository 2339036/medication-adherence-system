// Chatbot.jsx
// AI-powered medication support chatbot (to be implemented later)

import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

function Chatbot() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <BackButton />
      <div className="card">
        <h2>Medication Assistant Chatbot</h2>
        <p>The chatbot feature will be implemented in a later stage.</p>
      </div>
    </div>
  );
}

export default Chatbot;
