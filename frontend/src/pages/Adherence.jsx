// src/pages/Adherence.jsx
// monthly calendar for tracking medication adherence.

import { getMedications } from "../services/medicationService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdherenceHistory,
  recordAdherence,
  updateAdherence
} from "../services/adherenceService";
import AdherenceCharts from "../components/AdherenceCharts";
import BackButton from "../components/BackButton";


function Adherence() {
  const navigate = useNavigate();
  // React state hooks
  // `currentDate`: Date object for the currently shown month (used for calendar calculations)
  // `selectedDate`: Date object for the day the user clicked on (null if none)
  // `history`: array of adherence records fetched from the backend
  // `medications`: array of user's medications fetched from the backend
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [history, setHistory] = useState([]);
  const [medications, setMedications] = useState([]);   // Stores user's medications


  // useEffect: runs once after mount to load initial data
  useEffect(() => {
    fetchHistory();
    fetchMedications();
  }, []);

  // Fetch adherence history from backend (adherence-service)
  // Returns an array of records: { medicationId, date, doseIndex, taken }
  const fetchHistory = async () => {
    const data = await getAdherenceHistory();
    setHistory(data);
  };

  // Fetch medications for the current user (medication-service)
  const fetchMedications = async () => {
    const data = await getMedications();
    setMedications(data);
  }

  // Calendar date calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Determine weekday offset for the first day of month
  // `getDay()` returns 0 (Sun) - 6 (Sat). We convert so week starts on Monday.
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation helpers to change month view
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  // normalizeDate: convert a Date/ISO to `YYYY-MM-DD` string for comparison
  const normalizeDate = (date) =>
    new Date(date).toISOString().split("T")[0];

  // getDayStatus: determine a day's overall status based on records
  const getDayStatus = (dateObj) => {
    const day = normalizeDate(dateObj);

    // Filter history to records matching this calendar day 
    const recordsForDay = history.filter(
      (r) => normalizeDate(r.date) === day
    );

    if (recordsForDay.length === 0) return "none";

    // Count how many records are marked `taken` (boolean)
    const takenCount = recordsForDay.filter(r => r.taken).length;

    if (takenCount === recordsForDay.length) return "taken";   // all taken
    if (takenCount === 0) return "missed";                     // all missed

    return "partial";                                          // mixed
  };

  // helper that finds a record for the selectedDate (if any)
  const selectedRecord = selectedDate
    ? history.find(
        (r) => normalizeDate(r.date) === normalizeDate(selectedDate)
      )
    : null;

  // handleMark: mark a specific medication dose as taken/missed
  // Creates a payload and calls `recordAdherence` or `updateAdherence`.
  const handleMark = async (medicationId, doseIndex, takenStatus) => {
    const payload = {
      medicationId,
      date: normalizeDate(selectedDate),
      doseIndex,
      taken: takenStatus
    };

    // Check if an entry already exists for that medication/dose/day
    const existing = history.find(
      (r) =>
        r.medicationId === medicationId &&
        r.doseIndex === doseIndex &&
        normalizeDate(r.date) === normalizeDate(selectedDate)
    );

    if (existing) {
      // update existing record (PATCH/PUT
      await updateAdherence(payload);
    } else {
      // create new record (POST)
      await recordAdherence(payload);
    }

    // Refresh local state after change
    fetchHistory();
  };

  const getDoseSlots = (frequency) => {
    const freq = frequency.toLowerCase();

    if (freq.includes("once")) return ["Dose 1"];
    if (freq.includes("twice")) return ["Dose 1", "Dose 2"];
    if (freq.includes("three")) return ["Dose 1", "Dose 2", "Dose 3"];
    if (freq.includes("four")) return ["Dose 1", "Dose 2", "Dose 3", "Dose 4"];

    return ["Dose"];
  };

  // Build calendar cells: add empty placeholders for offset, then day buttons
  const calendarCells = [];

  for (let i = 0; i < startDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const status = getDayStatus(dateObj);

    // Each day is rendered as a button whose background color reflects status
    calendarCells.push(
      <button
        key={day}
        onClick={() => setSelectedDate(dateObj)}
        style={{
          padding: "0.75rem",
          borderRadius: "50%",
          border: "1px solid #ccc",
          backgroundColor:
            status === "taken"
              ? "#4CAF50" // green: all doses taken
              : status === "missed"
              ? "#f44336" // red: all missed
              : status === "partial"
              ? "#FF9800" // orange: partial
              : "white",
          color: status === "none" ? "black" : "white",
          cursor: "pointer"
        }}
      >
        {day}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", padding: "3rem 2rem", boxSizing: "border-box" }}>
      <BackButton />
      {/* CALENDAR CARD - centered at top */}
      <div 
        style={{
          maxWidth: "400px",
          width: "100%",
          marginBottom: "0 auto 3rem auto"
        }}>
        <div className="card" 
          style={{ marginBottom: "0" }}>
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
              gap: "0.5rem",
              justifyItems: "center"
            }}
          >
            {calendarCells}
          </div>

          {/* Day actions*/}
          {selectedDate && (
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
                Scheduled medications for {selectedDate.toDateString()}
              </h3>

              {medications.length === 0 ? (
                <p style={{ textAlign: "center" }}>No medications found</p>
              ) : (
                medications.map((med) => {
                  // Determine dose slots for the medication frequency
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
                        // Find the adherence record for this medication/dose on the selectedDate
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
                              {/* Button to mark dose as taken. Visual state driven by `record?.taken` */}
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

                              {/* Button to mark dose as missed. Visual state driven by `record && !record.taken` */}
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

      {/* CHARTS SECTION - responsive cards below calendar */}
      <AdherenceCharts history={history} />
    </div>
  );
}

export default Adherence;