import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import AdminPanel from "./pages/Admin/AdminPanel";
import ErrorPage from "./pages/ErrorPage/ErrorPage";

function App() {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/admin/*" element={<AdminPanel />} />
                    <Route path="/*" element={<AppRouter />} />
                    <Route path="/404" element={<ErrorPage errorCode={404} errorText="Страница не найдена" backTo="/" />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
