import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../../../utils/api";
import Cookies from "js-cookie";
import { logOut } from "../../../utils/auth";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const [isloading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        setLoading(true);
        const token = Cookies.get("auth_token");
        if (!token) {
            logOut();
            navigate("/login");
            return;
        } else {
            setLoading(false);
            setIsAuth(true);
        }
        // Проверка статуса, но скорее всего это не нужно, так как есть
        // axios interceptors и там все проверяется

        // const checkAuth = async () => {
        //     try {
        //         const response = await api().get("/api/auth/check");
        //         if (response.data.success === true) {
        //             setIsAuth(true);
        //         } else {
        //             logOut();
        //             setIsAuth(false);
        //         }
        //     } catch (error) {
        //         console.error(
        //             "Error checking auth status:",
        //             error.response.data.error
        //         );
        //         setIsAuth(false);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // checkAuth();
    }, [navigate]);

    if (isloading) {
        return (
            // <div className="d-flex justify-content-center align-items-center vh-100">
            //     <div className="spinner-border" role="status">
            //         <span className="visually-hidden">Loading...</span>
            //     </div>
            // </div>
            <div className="d-flex justify-content-center align-items-center vh-100">
                <LoadingSpinner text="Проверка пользователя..." variant="info" animation="border"/>
            </div>
        );
    }

    return isAuth ? children : navigate("/login"); // Рендерим children только если пользователь авторизован
};

export default ProtectedRoute;
