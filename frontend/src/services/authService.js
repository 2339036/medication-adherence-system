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
