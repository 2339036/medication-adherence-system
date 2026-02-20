// backend/chatbot-service/controllers/chatbotController.js
// Core hybrid chatbot logic: rules first, then FAQ retrieval fallback and ai agent action handling (reminder creation). The agent logic is simple and based on regex parsing for demo purposes.

const { parseSetReminderIntent, isLogTakenOrMissed, isNextDoseIntent } = require("../utils/agent");

const faqs = require("../data/faq");
const { includesAny, bestFaqMatch } = require("../utils/matchers");

//extracts token from bearer 
function getTokenFromAuthHeader(authHeader = "") {
    if (!authHeader.startsWith("Bearer ")) return null;
    return authHeader.split(" ")[1];
}

//fetch medications for logged-in users
async function getUserMedications({authHeader}) {
    const baseUrl = process.env.MEDICATION_SERVICE_URL || "http://localhost:5002";

    const response = await fetch(`${baseUrl}/api/medications`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: authHeader
        }
    });

    const data = await response.json();

    if (!response.ok) {
        const msg = data?.message || `Medication service error (${response.status})`;
        throw new Error(msg);
    }
    return data;
}

// Calls notification-service to create a reminder by using fetch
async function createReminderViaNotificationService({ token, medicationId, medicationName, time }) {
  const baseUrl = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5003";

  const response = await fetch(`${baseUrl}/api/notifications/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      medicationId,
      medicationName,
      time
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.message || `Notification service error (${response.status})`;
    throw new Error(msg);
  }

  return data;
}

//fetch reminders for logged in user
async function getUserReminders({ authHeader }) {
  const baseUrl = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5003";

  const response = await fetch(`${baseUrl}/api/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.message || `Notification service error (${response.status})`;
    throw new Error(msg);
  }

  return data;  //array of reminders
}

//fetch adherence history for logged in user
async function getUserAdherenceHistory({ authHeader }) {
  const baseUrl = process.env.ADHERENCE_SERVICE_URL || "http://localhost:5004";

  const response = await fetch(`${baseUrl}/api/adherence`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.message || `Adherence service error (${response.status})`;
    throw new Error(msg);
  }

  return data;  //array of adherence records
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    // Validation
    if (!message) {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    // Read auth header so we can act on behalf of the user
    const authHeader = req.headers.authorization || "";
    const token = getTokenFromAuthHeader(authHeader);

    // If user says "I took it" / "missed it" -> tell frontend to navigate
    const logIntent = isLogTakenOrMissed(message);
    if (logIntent) {
      return res.status(200).json({
        type: "NAVIGATE",
        route: "/adherence",
        message:
          logIntent.type === "TAKEN"
            ? "Open Adherence to log this dose as taken."
            : "Open Adherence to log this dose as missed."
      });
    }

    // If user asks to set a reminder -> create it (agent action)
    const reminderIntent = parseSetReminderIntent(message);
    if (reminderIntent) {

      // If user didn’t provide a time, ask for it
      if (reminderIntent.error === "NO_TIME") {
        return res.status(200).json({
          type: "TEXT",
          message: "What time should I remind you? (Example: 8pm or 20:00)"
        });
      }

      // If medication name isn't detected, ask user which medication
      if (!reminderIntent.medicationName) {
        return res.status(200).json({
          type: "TEXT",
          message:
            "Which medication is this for? Please type: “Remind me to take <medication name> at <time>”."
        });
      }

      // Must be logged in to create reminders (token required)
      if (!token) {
        return res.status(200).json({
          type: "TEXT",
          message:
            "Please log in first so I can access your medications and set reminders securely."
        });
      }

      // Fetch medications from medication-service
      const meds = await getUserMedications({ authHeader });

      // Find best match by name (contains match, case-insensitive)
      const wanted = reminderIntent.medicationName.toLowerCase().trim();
      const matchedMed = meds.find((m) =>
        String(m.name || "").toLowerCase().includes(wanted)
      );

      if (!matchedMed) {
        return res.status(200).json({
          type: "TEXT",
          message: `I couldn’t find “${reminderIntent.medicationName}” in your saved medications. Please check the spelling on the Medications page.`
        });
      }

      // Create reminder in notification-service
      await createReminderViaNotificationService({
        token,
        medicationId: matchedMed._id,
        medicationName: matchedMed.name,
        time: reminderIntent.time
      });

      // Tell frontend to navigate to Medications so user can see it
      return res.status(200).json({
        type: "NAVIGATE",
        route: "/medications",
        message: `Reminder created for ${matchedMed.name} at ${reminderIntent.time}.`
      });
    }

    // If user asks about next dose, return a helpful message
    if (isNextDoseIntent(message)) {
      if (!token) {
        return res.status(200).json({
          type: "TEXT",
          message:
            "Please log in first so I can access your medication schedule securely."
        });
      }

      const reminders = await getUserReminders({ authHeader });
      if (!Array.isArray(reminders) || reminders.length === 0) {
        return res.status(200).json({
          type: "NAVIGATE",
          route: "/medications",
          message: "You have no reminders set. Go to Medications to add some!"
        });
      }
      // Find the next upcoming reminder
      const now = new Date();
      const nowHHMM = now.toTimeString().slice(0, 5); // "HH:MM"

      const sorted = [...reminders].sort((a, b) => String(a.time).localeCompare(String(b.time)));

      //first next reminder today or next toimorrow
      let next = sorted.find((r) => String(r.time) > nowHHMM) || sorted[0];
      let dayLabel = sorted.find((r) => String(r.time) > nowHHMM) ? "today" : "tomorrow";

      //adherence
      const byMed = {};
      for (const r of sorted) {
        if (!byMed[r.medicationId]) byMed[r.medicationId] = [];
        byMed[r.medicationId].push(r);
      }
      Object.keys(byMed).forEach((medId) => {
        byMed[medId].sort((a, b) => String(a.time).localeCompare(String(b.time)));
      });

      const doseIndex = byMed[next.medicationId].findIndex((x) => x._id === next._id);

      //get today adherence records
      const history = await getUserAdherenceHistory({ authHeader });
      const todayKey = new Date().toDateString();

      const takenAlready = (history || []).some((rec) => {
        const recDay = new Date(rec.date).toDateString();
        return (
          recDay === todayKey &&
          String(rec.medicationId) === String(next.medicationId) &&
          Number(rec.doseIndex) === Number(doseIndex) &&
          rec.taken === true
        );
      });

      if (takenAlready) {
        //choose next one after this
        const idx = sorted.findIndex((r) => r._id === next._id);
        const alternative = sorted[idx + 1] || sorted[0];

        return res.status(200).json({
          type: "TEXT",
          message: `Your next dose of ${next.medicationName} is at ${next.time} ${dayLabel}, but it looks like you’ve already logged it as taken. Your next upcoming dose after that is ${alternative.medicationName} at ${alternative.time}.`
        });
      }
      
      return res.status(200).json({
        type: "TEXT",
        message: `Your next dose is ${next.medicationName} at ${next.time} ${dayLabel}.`
      });
    }

    // FAQ RETRIEVAL first
    const faqMatch = bestFaqMatch(message, faqs);
    if (faqMatch) {
      return res.status(200).json({ reply: faqMatch.a });
    }

    // Greetings
    if (includesAny(message, ["hi", "hello", "hey"])) {
      return res.status(200).json({
        reply:
          "Hi! I can help you with reminders, adherence logging, and navigating the app. What do you need?"
      });
    }

    // Adherence logging
    if (includesAny(message, ["log", "record", "taken", "missed", "adherence"])) {
      return res.status(200).json({
        reply:
          "To log a dose: go to the Adherence page → select a date → mark each dose as Taken or Missed."
      });
    }

    // Reminder setup
    if (
      includesAny(message, ["reminder", "reminders", "notify", "notification"])
    ) {
      return res.status(200).json({
        reply:
          "To set reminders: go to Medications → under each medication add reminder times. The number of reminders should match the frequency (e.g., twice daily = 2 reminders)."
      });
    }

    // Safety (medical advice boundary)
    if (
      includesAny(message, ["chest pain", "cant breathe", "severe", "emergency"])
    ) {
      return res.status(200).json({
        reply:
          "If this feels urgent or severe, please seek emergency medical help immediately. I can’t provide emergency medical advice."
      });
    }
    // DEFAULT
    return res.status(200).json({
      reply:
        "I’m not sure I understood. Try asking about reminders, adherence logging, or how to use the app."
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({ reply: "Server error" });
  }
};