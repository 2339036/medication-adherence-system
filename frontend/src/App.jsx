// App.jsx
// Handles application routing

import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      {/* Login page */}
      <Route path="/" element={<Login />} />

      {/* Register page */}
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
