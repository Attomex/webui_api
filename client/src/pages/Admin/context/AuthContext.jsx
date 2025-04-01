import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Создаем контекст
const AuthContext = createContext();

// Провайдер контекста
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Функция для извлечения данных из токена
    const extractUserFromToken = () => {
        const token = Cookies.get('auth_token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                return {
                    name: decodedToken.name,
                    email: decodedToken.email,
                    role: decodedToken.role,
                };
            } catch (error) {
                console.error('Ошибка при декодировании токена:', error);
                return null;
            }
        }
        return null;
    };

    // При монтировании компонента извлекаем данные из токена
    useEffect(() => {
        const userData = extractUserFromToken();
        if (userData) {
            setUser(userData);
        }
    }, []);

    // Функция для входа пользователя
    const login = (token) => {
        Cookies.set('auth_token', token, { expires: 1 / 24 });
        const userData = extractUserFromToken();
        setUser(userData);
    };

    // Функция для выхода пользователя
    const logout = () => {
        Cookies.remove('auth_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Хук для использования контекста
export const useAuth = () => useContext(AuthContext);