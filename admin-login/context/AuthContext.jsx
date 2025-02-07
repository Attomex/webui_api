import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Функция для входа пользователя
  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });

      const data = response.data;

      // Сохраняем токен в куках
      Cookies.set('auth_token', data.token, { expires: 1 / 24 }); // Токен живет 1 час
      console.log("lalal" + data.user.role);
      // Сохраняем данные пользователя в состоянии
      setUser(data.user);
    //   setLoading(false);
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      throw error;
    }
  };

  // Функция для выхода пользователя
  const logout = () => {
    Cookies.remove('auth_token'); // Удаляем токен из кук
    setUser(null); // Очищаем данные пользователя
  };

//   useEffect(() => {
//     const checkToken = async () => {
//         const token = Cookies.get('auth_token');

//         if(!token){
//             navigate('/admin/login')
//         }

//         setLoading(false);
//     };
//     checkToken();
//   }, [])

  // Проверка токена при загрузке приложения
//   useEffect(() => {
//     const checkToken = async () => {
//       const token = Cookies.get('auth_token');

//       if (token) {
//         try {
//           const response = await axiosInstance.get('/user');
//           setUser(response.data); // Восстанавливаем данные пользователя
//         } catch (error) {
//           console.error('Token validation failed:', error.response?.data?.message || error.message);
//           Cookies.remove('auth_token'); // Если токен недействителен, удаляем его
//         }
//       }

//       setLoading(false); // Загрузка завершена
//     };

//     checkToken();
//   }, []);

  // Возвращаем провайдер с данными
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста
export const useAuth = () => useContext(AuthContext);