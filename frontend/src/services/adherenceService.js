// src/services/adherenceService.js
// Handles API calls for medication adherence

const API_URL = "http://localhost:5004/api/adherence";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

// Record adherence (taken / not taken)
export const recordAdherence = async (adherenceData) => {
  const response = await fetch(`${API_URL}/record`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(adherenceData)
  });

  return response.json();
};

// Get adherence history
export const getAdherenceHistory = async () => {
  const response = await fetch(API_URL, {
    headers: getAuthHeaders()
  });

  return response.json();
};
