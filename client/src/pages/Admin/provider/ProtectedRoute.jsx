import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Добавляем useLocation
import { Spinner } from "react-bootstrap";
import Cookies from "js-cookie";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Получаем текущий путь
    const [isLoading, setLoading] = useState(true);
    const { user, logout } = useAuth();

    useEffect(() => {
        setLoading(true);
        const token = Cookies.get("auth_token");

        if (!token) {
            logout();
            // Перенаправляем на /login, но сохраняем текущий URL в state
            navigate("/login", { state: { from: location.pathname + location.search} }); // 🔑 Ключевое изменение
            return;
        }

        // Если токен есть, но данные пользователя не загружены, ждем
        if (!user) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [navigate, user, logout, location.pathname, location.search]); // Добавляем location.pathname в зависимости

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <LoadingSpinner
                    text="Проверка пользователя..."
                    variant="info"
                    animation="border"
                />
            </div>
        );
    }

    return user ? children : navigate("/login", { state: { from: location.pathname } }); // Также сохраняем путь
};

export default ProtectedRoute;