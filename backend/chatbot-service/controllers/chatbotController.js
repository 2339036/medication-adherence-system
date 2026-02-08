// backend/chatbot-service/controllers/chatbotController.js
// Core hybrid chatbot logic: rules first, then FAQ retrieval fallback

const faqs = require("../data/faq");
const { includesAny, bestFaqMatch } = require("../utils/matchers");

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    // Validation
    if (!message) {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    // 1) RULE-BASED (simple keyword checks)

    // Greeting intent
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

    // 2) FAQ RETRIEVAL FALLBACK
    const faqMatch = bestFaqMatch(message, faqs);
    if (faqMatch) {
      return res.status(200).json({ reply: faqMatch.a });
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