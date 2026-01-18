// src/pages/Adherence.jsx
// Displays medication adherence history

import { useEffect, useState } from "react";
import { getAdherenceHistory } from "../services/adherenceService";

function Adherence() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const data = await getAdherenceHistory();
    setHistory(data);
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Adherence History</h2>

        {history.length === 0 ? (
          <p>No adherence records yet</p>
        ) : (
          <ul>
            {history.map((record) => (
              <li key={record._id}>
                <strong>{record.medicationId}</strong> —{" "}
                {new Date(record.date).toDateString()} —{" "}
                {record.taken ? "Taken ✅" : "Missed ❌"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Adherence;
