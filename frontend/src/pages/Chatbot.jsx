//import { useNavigate } from "react-router-dom";

// frontend/src/pages/Chatbot.jsx
// Simple safe chatbot UI (rule + FAQ retrieval backend)

import { useState } from "react";
import BackButton from "../components/BackButton";
import { sendChatMessage } from "../services/chatbotService";

function Chatbot() {
  // Stores the conversation messages in order
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about reminders or adherence logging." }
  ]);

  // Current input text
  const [input, setInput] = useState("");

  // Loading state while waiting for backend response
  const [loading, setLoading] = useState(false);

  // Send message to backend and append response
  const handleSend = async (e) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    // Call chatbot backend
    const result = await sendChatMessage(trimmed);

    // Add bot response to chat
    setMessages((prev) => [...prev, { from: "bot", text: result.reply }]);
    setLoading(false);
  };

  return (
    <div className="page-container">
      <BackButton />

      <div className="card" style={{ maxWidth: "700px", width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Chat Support
        </h2>

        {/* Chat window */}
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "1rem",
            height: "320px",
            overflowY: "auto",
            backgroundColor: "#ffffff"
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: m.from === "user" ? "flex-end" : "flex-start",
                marginBottom: "0.6rem"
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "12px",
                  backgroundColor: m.from === "user" ? "#9225ebc0" : "#f0f0f0",
                  color: m.from === "user" ? "white" : "#333"
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Bot is typing...
            </p>
          )}
        </div>

        {/* Input */}
       <form
          onSubmit={handleSend}
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "1rem",
            alignItems: "center"
          }}
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              width: "100%",
              padding: "0.7rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: "white",
              color: "#111"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "auto",          // ✅ stops the button taking 100% width
              padding: "0.7rem 1.2rem",
              whiteSpace: "nowrap"     // ✅ keeps it compact
            }}
          >
            Send
          </button>
        </form>


        <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#666" }}>
          Note: This chatbot provides app guidance only and is not medical advice.
        </p>
      </div>
    </div>
  );
}

export default Chatbot;