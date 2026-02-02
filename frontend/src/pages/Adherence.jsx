// src/pages/Adherence.jsx
// Displays medication adherence history

import { useEffect, useState } from "react";
import { getAdherenceHistory } from "../services/adherenceService";

function Adherence() {
  const [history, setHistory] = useState([]);

  // Stores adherence statistics
  const [stats, setStats] = useState({
    total: 0,
    taken: 0,
    missed: 0
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const data = await getAdherenceHistory();
    setHistory(data);

    // Calculate adherence statistics
    const total = data.length;
    const taken = data.filter((record) => record.taken).length;
    const missed = total - taken;

    setStats({
      total,
      taken,
      missed
    });
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Adherence History</h2>

        {/* Adherence summary */}
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <p><strong>Total records:</strong> {stats.total}</p>
          <p><strong>Taken:</strong> {stats.taken} ✅</p>
          <p><strong>Missed:</strong> {stats.missed} ❌</p>
        </div>

        {history.length === 0 ? (
          <p>No adherence records yet</p>
        ) : (
          <ul>
            {history.map((record) => (
              <li key={record._id}>
                <strong>Medication</strong> —{" "}
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
