import axios from "axios";
import Cookies from "js-cookie";
import { logOut } from "./auth";

const url = process.env.REACT_APP_API_URL;

// Создаем экземпляр axios
const api = () => {
    const api = axios.create({
        baseURL: `${url}`, // Замените на ваш URL
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
        withXSRFToken: true
    });

    // Добавляем перехватчик для добавления токена в заголовки
    api.interceptors.request.use(
        (config) => {
            const token = Cookies.get("auth_token"); // Получаем токен из кук
            if (!!token) {
                config.headers.Authorization = `Bearer ${token}`; // Добавляем токен в заголовок
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    api.interceptors.response.use(response => response, error => {
        if (error.response.status === 401 && error.response.error === 'Unauthorized') {
            logOut();

            return Promise.reject(error);
        }

        return Promise.reject(error);
    });

    return api;
}

export default api