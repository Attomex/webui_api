import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

//   if (loading) {
//     return <div>Loading...</div>; // Показываем индикатор загрузки
//   }

  // Проверяем, есть ли роль пользователя в списке разрешенных ролей
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/login" />; // Перенаправляем на страницу "Нет доступа"
  }

  return children;
};

export default ProtectedRoute;