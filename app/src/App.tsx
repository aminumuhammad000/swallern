import { Routes, Route } from "react-router-dom";
import { Home } from "./Pages/home/Home";
import Auth from "./Pages/auth/Auth";
import Dashboard from "./Pages/dashboard/Dashboard";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/admin/dashboard" element={<Contact />} /> */}
      </Routes>
    </div>
  );
}

export default App;
