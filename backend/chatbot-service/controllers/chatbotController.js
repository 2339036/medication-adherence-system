// backend/chatbot-service/controllers/chatbotController.js
// Core hybrid chatbot logic: rules first, then FAQ retrieval fallback and ai agent action handling (reminder creation). The agent logic is simple and based on regex parsing for demo purposes.

const { parseSetReminderIntent, isLogTakenOrMissed, isNextDoseIntent, extractTime, extractMedicationName } = require("../utils/agent");

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

// Helper: detect if message is a question
function isQuestion(text) {
  return text.trim().endsWith("?");
}

// Helper: detect if message is an action request
function isActionRequest(text) {
  const t = text.toLowerCase().trim();
  
  // Don't treat questions as action requests
  if (t.endsWith("?")) return false;
  
  // Must explicitly say "remind me", "set a reminder", "add a reminder", "create a reminder"
  const actionPatterns = [
    "remind me",
    "set a reminder",
    "set reminder",
    "add a reminder",
    "add reminder",
    "create a reminder",
    "create reminder"
  ];
  
  return actionPatterns.some((pattern) => t.includes(pattern));
}

exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Validation
    if (!message) {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    // Read auth header so we can act on behalf of the user
    const authHeader = req.headers.authorization || "";
    const token = getTokenFromAuthHeader(authHeader);

    // Find the last bot message to understand context
    const lastBotMessage = [...conversationHistory]
      .reverse()
      .find((m) => m.from === "bot");

    // Build contextual message based on conversation flow
    let contextualMessage = message;
    let shouldStayInReminderContext = true;
    
    // If last bot message asked "What time should I remind you?", current message might be just a time
    if (
      lastBotMessage &&
      lastBotMessage.text.includes("What time should I remind you")
    ) {
      // Check if the user's actual message contains time indicators
      const userTimeMatch = extractTime(message);
      if (!userTimeMatch) {
        // User didn't provide a time - they're trying to do something else
        shouldStayInReminderContext = false;
      } else {
        // Find the original reminder request
        const beforeBotQuestion = [...conversationHistory]
          .reverse()
          .filter((m) => m.from === "user")
          .find(
            (m) =>
              m.text.includes("remind") ||
              m.text.includes("reminder")
          );

        if (beforeBotQuestion) {
          // Combine: original request + new time
          contextualMessage = `${beforeBotQuestion.text} at ${message}`;
        }
      }
    }

    // If last bot message asked "Which medication is this for", current message might be just a medication
    if (
      lastBotMessage &&
      lastBotMessage.text.includes("Which medication is this for")
    ) {
      // Find the time that was mentioned in previous user messages
      let extractedTime = null;
      for (const msg of conversationHistory) {
        if (msg.from === "user") {
          const timeMatch = extractTime(msg.text);
          if (timeMatch) {
            extractedTime = timeMatch.hhmm;
            break;
          }
        }
      }

      if (extractedTime) {
        // Combine: medication name + extracted time
        contextualMessage = `remind me to take ${message} at ${extractedTime}`;
      } else {
        // No time found, user is trying to exit reminder context
        shouldStayInReminderContext = false;
      }
    }

    // If user says "I took it" / "missed it" -> tell frontend to navigate
    const logIntent = isLogTakenOrMissed(contextualMessage);
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

    // Check if we're in a reminder follow-up context
    const isInReminderContext = 
      shouldStayInReminderContext &&
      lastBotMessage &&
      (lastBotMessage.text.includes("What time should I remind you") ||
       lastBotMessage.text.includes("Which medication is this for"));

    // If it's a question and NOT in reminder context, prioritize FAQ
    if (isQuestion(contextualMessage) && !isInReminderContext) {
      const faqMatch = bestFaqMatch(contextualMessage, faqs);
      if (faqMatch) {
        return res.status(200).json({ reply: faqMatch.a });
      }
    }

    // If user asks to set a reminder -> create it (agent action)
    const reminderIntent = parseSetReminderIntent(contextualMessage);
    if (reminderIntent && (isInReminderContext || isActionRequest(contextualMessage))) {

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
    if (isNextDoseIntent(contextualMessage)) {
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

    // FAQ RETRIEVAL (backup) - the smart FAQ check happens earlier if it's a question
    // const faqMatch = bestFaqMatch(contextualMessage, faqs);
    // if (faqMatch) {
    //   return res.status(200).json({ reply: faqMatch.a });
    // }

    // Greetings
    if (includesAny(contextualMessage, ["hi", "hello", "hey"])) {
      return res.status(200).json({
        reply:
          "Hi! I can help you with reminders, adherence logging, and navigating the app. What do you need?"
      });
    }

    // Adherence logging
    if (includesAny(contextualMessage, ["log", "record", "taken", "missed", "adherence"])) {
      return res.status(200).json({
        reply:
          "To log a dose: go to the Adherence page → select a date → mark each dose as Taken or Missed."
      });
    }

    // Reminder setup
    if (
      includesAny(contextualMessage, ["reminder", "reminders", "notify", "notification"])
    ) {
      return res.status(200).json({
        reply:
          "To set reminders: go to Medications → under each medication add reminder times. The number of reminders should match the frequency (e.g., twice daily = 2 reminders). You can also ask me to set reminders by typing: “Remind me"
      });
    }

    // Safety (medical advice boundary)
    if (
      includesAny(contextualMessage, ["chest pain", "cant breathe", "severe", "emergency"])
    ) {
      return res.status(200).json({
        reply:
          "If this feels urgent or severe, please seek emergency medical help immediately. I can’t provide emergency medical advice."
      });
    }
    // DEFAULT
    return res.status(200).json({
      reply:
        "I’m not sure I understood. I can help you set reminders, log doses, check next dose or answer FAQs."
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({ reply: "Server error" });
  }
};