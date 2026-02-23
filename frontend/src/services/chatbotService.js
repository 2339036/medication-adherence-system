// frontend/src/services/chatbotService.js
// Handles API calls to chatbot-service

const CHATBOT_URL = "http://localhost:5005/api/chatbot";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
};

export const sendChatMessage = async (message, conversationHistory = []) => {
  try {
    const response = await fetch(`${CHATBOT_URL}/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, conversationHistory })
    });

    return await response.json(); // { reply: "..." }
  } catch (error) {
    console.error("Chatbot service error:", error);
    return { reply: "Sorry, I couldn’t connect to the chatbot service." };
  }
};
