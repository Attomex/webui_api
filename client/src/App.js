import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import AdminPanel from "./pages/Admin/AdminPanel";


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/*" element={<AppRouter />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
