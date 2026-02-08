// backend/chatbot-service/data/faq.js
// Simple FAQ knowledge base (retrieval fallback)

module.exports = [
  {
    q: ["what is medication adherence", "define adherence", "adherence meaning"],
    a: "Medication adherence means taking your medication as prescribed (right dose, right time, right day)."
  },
  {
    q: ["i missed a dose", "missed my medication", "forgot my medication"],
    a: "If you missed a dose, record it as missed in the Adherence page. If you're unsure what to do next, follow your clinician’s instructions or the medication leaflet."
  },
  {
    q: ["side effects", "feeling unwell", "reaction", "symptoms"],
    a: "If you think you’re experiencing side effects, contact a pharmacist/GP. If symptoms are severe, seek urgent medical help."
  },
  {
    q: ["how to set reminders", "set reminder", "reminder help"],
    a: "Go to the Medications page → Reminders section under each medication → add reminder times based on the medication frequency."
  },
  {
    q: ["how do i use the app", "help", "what can you do"],
    a: "I can help you with reminders, adherence logging, and general guidance on using the app. For medical advice, always consult a professional."
  }
];
