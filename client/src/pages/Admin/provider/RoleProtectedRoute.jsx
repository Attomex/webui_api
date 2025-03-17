import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
    const { user } = useAuth(); // Получаем данные пользователя из контекста

    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Если роль пользователя не входит в список разрешенных, перенаправляем на главную страницу
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/admin" />;
    }

    // Если роль пользователя разрешена, отображаем children
    return children;
};

export default RoleProtectedRoute;