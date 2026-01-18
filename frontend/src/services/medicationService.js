// src/services/medicationService.js
// Handles all API calls related to medications

const BASE_URL = "http://localhost:5002/api/medications";

// Helper function to get JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

// Fetch all medications for logged-in user
export const getMedications = async () => {
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
    console.error("Error fetching medications:", error);
    return [];
  }
};

// Create a new medication
export const createMedication = async (medicationData) => {
  try {
    const response = await fetch(`${BASE_URL}/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(medicationData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating medication:", error);
    return { message: error.message };
  }
};

// Update a medication by ID
export const updateMedication = async (id, medicationData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(medicationData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating medication:", error);
    return { message: error.message };
  }
};

// Delete a medication by ID
export const deleteMedication = async (id) => {
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
    console.error("Error deleting medication:", error);
    return { message: error.message };
  }
};
