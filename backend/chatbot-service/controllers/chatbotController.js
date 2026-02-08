// backend/chatbot-service/controllers/chatbotController.js
// Core hybrid chatbot logic: rules first, then FAQ retrieval fallback

const { parseSetReminderIntent, isLogTakenOrMissed } = require("../utils/agent");

const faqs = require("../data/faq");
const { includesAny, bestFaqMatch } = require("../utils/matchers");

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

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    // 1) If user says "I took it" / "missed it" -> tell frontend to navigate
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

    // 2) If user asks to set a reminder -> create it
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

    return res.status(200).json({
        type: "TEXT",
        message:
        `I can set reminders from your saved medications. Please set it in Medications → Reminders for ${reminderIntent.medicationName} at ${reminderIntent.time}.`
    });
    }

    // Validation
    if (!message) {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    // 2) FAQ RETRIEVAL first
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
    if (includesAny(message, ["reminder", "reminders", "notify", "notification"])) {
      return res.status(200).json({
        reply:
          "To set reminders: go to Medications → under each medication add reminder times. The number of reminders should match the frequency (e.g., twice daily = 2 reminders)."
      });
    }

    // Safety (medical advice boundary) 
    if (includesAny(message, ["chest pain", "cant breathe", "severe", "emergency"])) {
      return res.status(200).json({
        reply:
          "If this feels urgent or severe, please seek emergency medical help immediately. I can’t provide emergency medical advice."
      });
    }

    // 3) DEFAULT
    return res.status(200).json({
      reply:
        "I’m not sure I understood. Try asking about reminders, adherence logging, or how to use the app."
    });

  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({ reply: "Server error" });
  }
};