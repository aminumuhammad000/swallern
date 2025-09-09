import { Routes, Route } from "react-router-dom";
import { Home } from "./Pages/home/Home";
import Auth from "./Pages/auth/Auth";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        {/* <Route path="/user/dashboard" element={<Contact />} /> */}
        {/* <Route path="/admin/dashboard" element={<Contact />} /> */}
      </Routes>
    </div>
  );
}

export default App;
