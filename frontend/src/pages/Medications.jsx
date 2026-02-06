// src/pages/Medications.jsx
// Displays and manages user medications

import { useEffect, useState } from "react";
import { getMedications, createMedication, deleteMedication, updateMedication } from "../services/medicationService";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getReminders, createReminder, deleteReminder } from "../services/notificationService";
import BackButton from "../components/BackButton";
import ReminderBanner from "../components/ReminderBanner";



function Medications() {
  // State for medications list
  const [medications, setMedications] = useState([]);

  const navigate = useNavigate(); // Navigation hook


  // Form state
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [message, setMessage] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDosage, setEditDosage] = useState("");
  const [editFrequency, setEditFrequency] = useState("");

  // Reminder state
const [reminders, setReminders] = useState([]);
const [reminderTime, setReminderTime] = useState("");

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  // Fetch medications on page load
  useEffect(() => {
    fetchMedications();
    fetchReminders();
  }, []);

  const fetchMedications = async () => {
    const data = await getMedications();
    setMedications(data);
  };

  const fetchReminders = async () => {
    const data = await getReminders();
    setReminders(data);
  };

  // Check reminders every minute and show notification if time matches
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nowTime = now.toTimeString().slice(0, 5); // HH:MM format

      reminders.forEach((reminder) => {
        if (reminder.time === nowTime) {
          if (Notification.permission === "granted") {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification("💊 Medication Reminder", {
                body: `Time to take ${reminder.medicationName}`,
                icon: "/favicon.ico",
              });
            });
          }
        }
      });
    }, 60000); // check every 60 seconds

    return () => clearInterval(interval);
  }, [reminders]);
  

  //reads medciation frequency and sets a limit for how many reminders can be set based on frequency
  const getMaxReminders = (frequency) => {
    if (!frequency) return 1;

    const freq = frequency.toLowerCase();

    if (freq.includes("once")) return 1;
    if (freq.includes("twice")) return 2;
    if (freq.includes("three")) return 3;
    if (freq.includes("four")) return 4;

    return 1; // fallback
  };

  // Handle start edit,
  const handleStartEdit = (med) => {
    setEditingId(med._id);
    setEditName(med.name);
    setEditDosage(med.dosage);
    setEditFrequency(med.frequency);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDosage("");
    setEditFrequency("");
  };

  // error handling if nothing is entered in the edit form
  const handleSaveEdit = async (medicationId) => {
    if (!editName || !editDosage || !editFrequency) {
      setMessage("All fields are required");
      return;
    }

    const result = await updateMedication(medicationId, {
      name: editName,
      dosage: editDosage,
      frequency: editFrequency
    });

    if (result.medication) {
      setMessage("Medication updated");
      setEditingId(null);
      fetchMedications();
    } else {
      setMessage(result.message || "Failed to update medication");
    }
  };

  // Handle add medication
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await createMedication({
      name,
      dosage,
      frequency
    });

    if (result.medication) {
      setMessage("Medication added");
      setName("");
      setDosage("");
      setFrequency("");
      fetchMedications();
    } else {
      setMessage(result.message || "Failed to add medication");
    }
  };

  // Handle delete medication
  const handleDelete = async (medicationId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medication?"
    );

    if (!confirmDelete) return;

    const result = await deleteMedication(medicationId);

    if (result.message && result.message.includes("successfully")) {
      setMessage("Medication deleted");
      fetchMedications();
    } else {
      setMessage(result.message || "Failed to delete medication");
    }
  };

  return (
    <div className="medications-container">
      <BackButton />
      <ReminderBanner reminders={reminders} />
      {/* Medications card */}
      <div className="card add-medication-card">
        <h2>➕ Add Medication</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Medication name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Dosage (e.g. 500mg)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Frequency (e.g. once daily)"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            required
          />

          <button type="submit">Add Medication</button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>

      {/* Medications list card */}
      <div className="card my-medications-card">
        <h2>💊 My Medications</h2>

        {medications.length === 0 ? (
          <p>No medications added yet</p>
        ) : (
          medications.map((med) => {
            // Get reminders for this medication only
            const medicationReminders = reminders.filter(
              (r) => r.medicationId === med._id
            );

            // Determine reminder limit based on frequency
            const maxReminders = getMaxReminders(med.frequency);
            const limitReached = medicationReminders.length >= maxReminders;

            return (
              <div key={med._id} className="medication-item">
                {/* ===== EDIT MODE ===== */}
                {editingId === med._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Medication name"
                    />

                    <input
                      type="text"
                      value={editDosage}
                      onChange={(e) => setEditDosage(e.target.value)}
                      placeholder="Dosage"
                    />

                    <input
                      type="text"
                      value={editFrequency}
                      onChange={(e) => setEditFrequency(e.target.value)}
                      placeholder="Frequency"
                    />

                    <div className="edit-actions">
                      <button
                        className="save-btn"
                        onClick={() => handleSaveEdit(med._id)}
                      >
                        Save
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ===== VIEW MODE ===== */}
                    <div className="med-header">
                      <div className="med-info">
                        <strong>{med.name}</strong>
                        <p>
                          {med.dosage} • {med.frequency}
                        </p>
                      </div>

                      <div className="med-actions">
                        <button
                          className="icon-btn edit-icon"
                          onClick={() => handleStartEdit(med)}
                          title="Edit medication"
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="icon-btn delete-icon"
                          onClick={() => handleDelete(med._id)}
                          title="Delete medication"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* REMINDERS SECTION*/}
                    <div className="reminders-section">
                      <p className="reminders-title">⏰ Reminders</p>

                      {/* Existing reminders */}
                      <div className="reminders-list">
                        {medicationReminders.map((reminder) => (
                          <div
                            key={reminder._id}
                            className="reminder-item"
                          >
                            <span className="reminder-time">
                              {reminder.time}
                            </span>

                            <button
                              className="reminder-delete-btn"
                              onClick={async () => {
                                await deleteReminder(reminder._id);
                                fetchReminders();
                              }}
                              title="Delete reminder"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add reminder */}
                      <div className="add-reminder-section">
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) =>
                            setReminderTime(e.target.value)
                          }
                          className="reminder-input"
                        />

                        <button
                          className="add-reminder-btn"
                          disabled={limitReached}
                          onClick={async () => {
                            if (!reminderTime) return;

                            if (limitReached) {
                              alert(
                                `You can only add ${maxReminders} reminder(s) for this medication.`
                              );
                              return;
                            }

                            await createReminder({
                              medicationId: med._id,
                              medicationName: med.name,
                              time: reminderTime
                            });

                            setReminderTime("");
                            fetchReminders();
                          }}
                        >
                          Add
                        </button>
                      </div>

                      {/* Helper text for examiner clarity */}
                      <p className="reminder-hint">
                        {medicationReminders.length} / {maxReminders} reminders set
                      </p>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/*  ADHERENCE NAVIGATION CARD  */}
      <div className="card adherence-card">
        <h2>📊 Track Medication Adherence</h2>

        <p style={{ textAlign: "center", marginBottom: "1rem" }}>
          View your medication intake history and adherence progress.
        </p>

        <button
          onClick={() => navigate("/adherence")}
          style={{ width: "100%" }}
        >
          Go to Adherence Tracking
        </button>
      </div>
    </div>
  );

}

export default Medications;
