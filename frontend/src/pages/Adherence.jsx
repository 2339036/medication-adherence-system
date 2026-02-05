// src/pages/Adherence.jsx
// Monthly calendar adherence tracking with per-day actions

import { getMedications } from "../services/medicationService";
import { useEffect, useState } from "react";
import {
  getAdherenceHistory,
  recordAdherence,
  updateAdherence
} from "../services/adherenceService";


function Adherence() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [history, setHistory] = useState([]);
  const [medications, setMedications] = useState([]);   // Stores user's medications


  useEffect(() => {
    fetchHistory();
    fetchMedications();
  }, []);

  const fetchHistory = async () => {
    const data = await getAdherenceHistory();
    setHistory(data);
  };

  const fetchMedications = async () => {
    const data = await getMedications();
    setMedications(data);
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const normalizeDate = (date) =>
    new Date(date).toISOString().split("T")[0];

  const selectedRecord = selectedDate
    ? history.find(
        (r) => normalizeDate(r.date) === normalizeDate(selectedDate)
      )
    : null;

  const handleMark = async (medicationId, doseIndex, takenStatus) => {
    const payload = {
      medicationId,
      date: normalizeDate(selectedDate),
      doseIndex,
      taken: takenStatus
    };

    const existing = history.find(
      (r) =>
        r.medicationId === medicationId &&
        r.doseIndex === doseIndex &&
        normalizeDate(r.date) === normalizeDate(selectedDate)
    );

    if (existing) {
      await updateAdherence(payload);
    } else {
      await recordAdherence(payload);
    }

    fetchHistory();
  };


  const getDoseSlots = (frequency) => {
    const freq = frequency.toLowerCase();

    if (freq.includes("once")) return ["Dose 1"];
    if (freq.includes("twice")) return ["Dose 1", "Dose 2"];
    if (freq.includes("three")) return ["Dose 1", "Dose 2", "Dose 3"];
    if (freq.includes("four")) return ["Dose 1", "Dose 2", "Dose 3", "Dose 4"];

    // fallback
    return ["Dose"];
  };

  const calendarCells = [];

  for (let i = 0; i < startDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const record = history.find(
      (r) => normalizeDate(r.date) === normalizeDate(dateObj)
    );

    calendarCells.push(
      <button
        key={day}
        onClick={() => setSelectedDate(dateObj)}
        style={{
          padding: "0.75rem",
          borderRadius: "50%",
          border: "1px solid #ccc",
          backgroundColor: record
            ? record.taken
              ? "#4CAF50"
              : "#f44336"
            : "white",
          color: record ? "white" : "black",
          cursor: "pointer"
        }}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem"
          }}
        >
          <button
            onClick={goToPreviousMonth}
            style={{
              borderRadius: "50%",
              padding: "0.5rem 0.75rem"
            }}
          >
            ◀
          </button>

          <h2 style={{ textAlign: "center", flex: 1 }}>
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric"
            })}
          </h2>

          <button
            onClick={goToNextMonth}
            style={{
              borderRadius: "50%",
              padding: "0.5rem 0.75rem"
            }}
          >
            ▶
          </button>
        </div>

        {/* Weekdays */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "0.5rem"
          }}
        >
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Calendar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0.5rem"
          }}
        >
          {calendarCells}
        </div>

        {/* Day Actions */}
        {selectedDate && (
          <div style={{ marginTop: "2rem" }}>
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Scheduled medications for {selectedDate.toDateString()}
            </h3>

            {medications.length === 0 ? (
              <p style={{ textAlign: "center" }}>No medications found</p>
            ) : (
              medications.map((med) => {
                const doses = getDoseSlots(med.frequency);

                return (
                  <div
                    key={med._id}
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "12px",
                      padding: "1rem",
                      marginBottom: "1rem"
                    }}
                  >
                    <strong>{med.name}</strong>
                    <p style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                      {med.dosage} • {med.frequency}
                    </p>

                    {doses.map((dose, index) => {
                      const record = history.find(
                        (r) =>
                          r.medicationId === med._id &&
                          normalizeDate(r.date) === normalizeDate(selectedDate) &&
                          r.doseIndex === index
                      );

                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "0.5rem"
                          }}
                        >
                          <span>{dose}</span>

                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() =>
                                handleMark(med._id, index, true)
                              }
                              style={{
                                padding: "0.35rem 1rem",
                                borderRadius: "999px",
                                border: "none",
                                backgroundColor: record?.taken
                                  ? "#4CAF50"
                                  : "#e0e0e0",
                                color: record?.taken ? "white" : "black"
                              }}
                            >
                              Taken
                            </button>

                            <button
                              onClick={() =>
                                handleMark(med._id, index, false)
                              }
                              style={{
                                padding: "0.35rem 1rem",
                                borderRadius: "999px",
                                border: "none",
                                backgroundColor:
                                  record && !record.taken
                                    ? "#f44336"
                                    : "#e0e0e0",
                                color:
                                  record && !record.taken
                                    ? "white"
                                    : "black"
                              }}
                            >
                              Missed
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Adherence;