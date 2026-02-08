// backend/chatbot-service/data/faq.js
// Simple FAQ knowledge base (retrieval fallback)

module.exports = [
  {
    q: ["what is medication adherence", 
        "what is adherence",
        "define adherence", 
        "explain adherence",
        "adherence meaning"],
    a: "Medication adherence means taking your medication as prescribed (right dose, right time, right day)."
  },
  {
    q: ["i missed a dose", 
        "missed my medication",
        "i didn't take my medication", 
        "forgot my medication"],
    a: "If you missed a dose, record it as missed in the Adherence page. If you're unsure what to do next, follow your clinician’s instructions or the medication leaflet."
  },
  {
    q: ["side effects", 
        "feeling unwell",
        "is this normal", 
        "reaction", 
        "symptoms"],
    a: "If you think you’re experiencing side effects, contact a pharmacist/GP. If symptoms are severe, seek urgent medical help."
  },
  {
    q: ["how to set reminders", 
        "set reminder",
        "add reminder", 
        "reminder help"],
    a: "Go to the Medications page → Reminders section under each medication → add reminder times based on the medication frequency."
  },
    {
    q: ["why can't i add more reminders", 
        "reminder limit",
        "cant add reminder", 
        "only lets me add one reminder"],
    a: "The app limits reminders based on medication frequency. So for example, once daily = 1 reminder, twice daily = 2 reminders, etc. This is to encourage adherence to the prescribed medicine."
  },
  {
    q: ["how do i use the app", 
        "help", 
        "what can you do"],
    a: "I can help you with reminders, adherence logging, and general guidance on using the app. For medical advice, always consult a professional."
  },
    {
    q: [
      "what does partial mean",
      "partial adherence",
      "why is the day orange"
    ],
    a: "Orange/partial means some doses were taken and others were missed on that day."
  },
  {
    q: [
      "forgot password",
      "reset password",
      "cant log in"
    ],
    a: "Use the Forgot Password page to request a reset link. After resetting, return to Login and sign in with your new password."
  },
  {
    q: [
      "update my details",
      "change my email",
      "change my password",
      "update profile"
    ],
    a: "Go to Security Settings (Account) from the dashboard to update your details. You can update only the fields you want."
  }
];
