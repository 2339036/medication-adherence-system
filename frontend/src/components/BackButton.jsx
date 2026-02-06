// BackButton.jsx
// Reusable back button component positioned at bottom left

import { useNavigate } from "react-router-dom";
import "./BackButton.css";

function BackButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} className="back-button">
      ← Back
    </button>
  );
}

export default BackButton;
