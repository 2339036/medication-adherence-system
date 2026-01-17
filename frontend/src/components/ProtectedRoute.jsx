// ProtectedRoute.jsx
// Prevents access to routes unless user is logged in
// Waits for auth check to complete before redirecting

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While checking auth status, render nothing (or a loader later)
  if (loading) {
    return null;
  }

  // If NOT logged in --> redirect
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If logged in --> render page
  return children;
}

export default ProtectedRoute;
