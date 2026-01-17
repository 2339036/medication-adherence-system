// AuthContext.jsx
// This file manages global authentication state (logged in / logged out)

import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const AuthContext = createContext();

// Create the provider component
export function AuthProvider({ children }) {
  // Store user info (null = not logged in)
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // auth check in progress


  // On app load, check if user already exists in localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
    }

        // Auth check complete
        setLoading(false);
    }, []);


  // Login function
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}
