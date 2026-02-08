// frontend/src/services/chatbotService.js
// Handles API calls to chatbot-service (NO axios, consistent with project)

const BASE_URL = "http://localhost:5005/api/chatbot";

export const sendChatMessage = async (message) => {
  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json(); // { reply: "..." }
  } catch (error) {
    console.error("Chatbot API error:", error);
    return { reply: "Sorry, I couldn’t connect to the chatbot service." };
  }
};
