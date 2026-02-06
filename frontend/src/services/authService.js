//this file contains functions to interact with the backend API for authentication purposes, such as registering and logging in users.

const API_URL = "http://localhost:5001/api/auth";

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await fetch("http://localhost:5001/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    return await response.json();
  } catch (error) {
    return { message: "Registration failed" };
  }
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  return response.json();
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    return await response.json();
  } catch (error) {
    return { message: "Password reset request failed" };
  } 
};

export const resetPassword = async (token, password) => {
  try {
    const response = await fetch(`${API_URL}/reset-password/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    return await response.json();
  } catch (error) {
    return { message: "Password reset failed" };
  }
};