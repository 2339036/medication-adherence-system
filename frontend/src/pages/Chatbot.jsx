// frontend/src/pages/Chatbot.jsx
// Simple chatbot UI (rule + FAQ retrieval backend)

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BackButton from "../components/BackButton";
import { sendChatMessage } from "../services/chatbotService";

function Chatbot() {
  const navigate = useNavigate();

  // Stores the conversation messages in order
  // Each message can optionally include an `action` e.g. { route: "/adherence" }
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
    const updatedMessages = [...messages, { from: "user", text: trimmed }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Call chatbot backend with conversation history
      const result = await sendChatMessage(trimmed, updatedMessages);

      const botText = result?.message || result?.reply || "Sorry, I didn’t understand that.";

      // If backend indicates navigation, store an action route with the bot message
      const botAction =
        result?.type === "NAVIGATE" && result?.route
          ? { route: result.route }
          : null;

      // Add bot response to chat
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: botText, action: botAction }
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Something went wrong. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
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
                {/* Message text */}
                <div>{m.text}</div>

                {/* If the bot included an action route, show a small button */}
                {m.from === "bot" && m.action?.route && (
                  <button
                    type="button"
                    onClick={() => navigate(m.action.route)}
                    style={{
                      marginTop: "0.6rem",
                      width: "auto",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "999px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: "#5bbddb",
                      color: "white",
                      fontSize: "0.85rem"
                    }}
                  >
                    {m.action.route === "/medications"
                      ? "Go to Medications"
                      : m.action.route === "/adherence"
                      ? "Go to Adherence"
                      : "Open"}
                  </button>
                )}
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
              width: "auto",
              padding: "0.7rem 1.2rem",
              whiteSpace: "nowrap"
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