import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Medications from "./pages/Medications";
import Adherence from "./pages/Adherence";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/medications" element={<Medications />} />
      <Route path="/adherence" element={<Adherence />} />
    </Routes>
  );
}

export default App;