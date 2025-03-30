import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Cookies from "js-cookie";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const { user, logout } = useAuth(); // Используем контекст

    useEffect(() => {
        setLoading(true);
        const token = Cookies.get("auth_token");

        if (!token) {
            logout(); // Если токена нет, разлогиниваем пользователя
            navigate("/login");
            return;
        }

        // Если токен есть, но данные пользователя не загружены, ждем
        if (!user) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [navigate, user, logout]);

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

    return user ? children : navigate("/login"); // Рендерим children только если пользователь авторизован
};

export default ProtectedRoute;

