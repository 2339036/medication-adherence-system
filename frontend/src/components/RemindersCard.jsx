// src/components/RemindersCard.jsx
// Card allowing users to create, view and delete medication reminders

import { useEffect, useState } from "react";
import {
  createReminder,
  getReminders,
  deleteReminder
} from "../services/notificationService";

function RemindersCard({ medications }) {

  const [reminders, setReminders] = useState([]);
  const [selectedMedicationId, setSelectedMedicationId] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Fetch reminders when component mounts
  useEffect(() => {
    fetchReminders();
  }, []);

  // Load reminders from backend
  const fetchReminders = async () => {
    try {
      const data = await getReminders();
      setReminders(data);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    }
  };

  // Handle reminder creation
  const handleAddReminder = async () => {
    if (!selectedMedicationId || !selectedTime) return;

    const medication = medications.find(
      (m) => m._id === selectedMedicationId
    );

    try {
      await createReminder({
        medicationId: medication._id,
        medicationName: medication.name,
        time: selectedTime
      });

      // Reset inputs
      setSelectedMedicationId("");
      setSelectedTime("");

      // Refresh reminder list
      fetchReminders();
    } catch (error) {
      console.error("Failed to create reminder:", error);
    }
  };

  // Handle reminder deletion
  const handleDelete = async (id) => {
    try {
      await deleteReminder(id);
      fetchReminders();
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    }
  };

  return (
    <div className="card" style={{ marginBottom: "3rem" }}>
      <h3 style={{ marginBottom: "1rem", textAlign: "center" }}>
        Medication Reminders
      </h3>

      {/* Add reminder section */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
          justifyContent: "center"
        }}
      >
        {/* Medication dropdown */}
        <select
          value={selectedMedicationId}
          onChange={(e) => setSelectedMedicationId(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "6px" }}
        >
          <option value="">Select medication</option>
          {medications.map((med) => (
            <option key={med._id} value={med._id}>
              {med.name}
            </option>
          ))}
        </select>

        {/* Time picker */}
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "6px" }}
        />

        {/* Add button */}
        <button
          onClick={handleAddReminder}
          style={{
            height: "40px",
            padding: "0.5rem 1rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#2196F3",
            color: "white",
            cursor: "pointer"
          }}
        >
          Add reminder
        </button>
      </div>

      {/* Reminder list */}
      {reminders.length === 0 ? (
        <p style={{ textAlign: "center" }}>No reminders set</p>
      ) : (
        reminders.map((reminder) => (
          <div
            key={reminder._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem",
              borderBottom: "1px solid #eee"
            }}
          >
            <div>
              <strong>{reminder.medicationName}</strong>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                {reminder.time}
              </div>
            </div>

            <button
              onClick={() => handleDelete(reminder._id)}
              style={{
                background: "transparent",
                border: "none",
                color: "#f44336",
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default RemindersCard;