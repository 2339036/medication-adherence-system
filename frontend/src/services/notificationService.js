// src/services/notificationService.js
// Handles all API calls related to medication reminders (notification service)

const BASE_URL = "http://localhost:5003/api/notifications";

// Helper function to get JWT token 
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

// Fetch all reminders for logged-in user
export const getReminders = async () => {
  try {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return [];
  }
};

// Create a new reminder
export const createReminder = async (reminderData) => {
  try {
    const response = await fetch(`${BASE_URL}/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(reminderData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating reminder:", error);
    return { message: error.message };
  }
};

// Delete a reminder by ID 
export const deleteReminder = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return { message: error.message };
  }
};

// Update a reminder by ID
export const updateReminder = async (id, updates) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating reminder:", error);
    return { message: error.message };
  }
};