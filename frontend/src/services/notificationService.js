// src/services/notificationService.js
// This file handles API calls to the notification-service backend

import axios from "axios";

// URL for notification service
const API_URL = "http://localhost:5003/api/notifications";

// Helper to get auth header with JWT token
const authHeader = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// CREATE a new reminder
// medicationId: ID of medication
// medicationName: name (stored for display)
// time: reminder time (HH:mm)
export const createReminder = async (reminderData) => {
  const response = await axios.post(
    `${API_URL}/create`,
    reminderData,
    authHeader()
  );

  return response.data;
};

// GET all reminders for the logged-in user
export const getReminders = async () => {
  const response = await axios.get(
    API_URL,
    authHeader()
  );

  return response.data;
};

// DELETE a reminder by ID
export const deleteReminder = async (reminderId) => {
  const response = await axios.delete(
    `${API_URL}/${reminderId}`,
    authHeader()
  );

  return response.data;
};