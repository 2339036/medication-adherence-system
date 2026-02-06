// src/components/ReminderBanner.jsx

import { useEffect, useState } from "react";

function ReminderBanner({ reminders }) {
  const [activeReminder, setActiveReminder] = useState(null);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:mm

      const dueReminder = reminders.find(
        (r) =>
          r.time === currentTime &&
          !dismissedIds.includes(r._id)
      );

      if (dueReminder) {
        setActiveReminder(dueReminder);
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [reminders, dismissedIds]);

  if (!activeReminder) return null;

  return (
    <div className="reminder-banner">
      <p>
        ⏰ Time to take <strong>{activeReminder.medicationName}</strong>
      </p>

      <button
        onClick={() => {
          setDismissedIds((prev) => [...prev, activeReminder._id]);
          setActiveReminder(null);
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

export default ReminderBanner;
