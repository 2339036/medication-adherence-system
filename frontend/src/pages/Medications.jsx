// src/pages/Medications.jsx
// Displays and manages user medications

import { useEffect, useState } from "react";
import { getMedications, createMedication, deleteMedication, updateMedication } from "../services/medicationService";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


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

  // Fetch medications on page load
  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    const data = await getMedications();
    setMedications(data);
  };

  // Handle start edit
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

  // Handle save edit
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
      {/* Medications card */}
      <div className="card add-medication-card">
        <h2>➕ Add Medication</h2>

        {/* Add medication form */}
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
          medications.map((med) => (
            <div key={med._id} className="medication-item">
              {editingId === med._id ? (
                // Edit mode
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
                    <button className="save-btn" onClick={() => handleSaveEdit(med._id)}>
                      Save
                    </button>
                    <button className="cancel-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="med-info">
                    <strong>{med.name}</strong>
                    <p>{med.dosage} • {med.frequency}</p>
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
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Adherence navigation card */}
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
