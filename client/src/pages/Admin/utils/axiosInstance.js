import axios from 'axios';
import Cookies from 'js-cookie';
import React from 'react';

const url = process.env.REACT_APP_API_URL;

// Создаем экземпляр axios
const axiosInstance = axios.create({
  baseURL: `${url}/api`, // Замените на ваш URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true ,
});

// Добавляем перехватчик для добавления токена в заголовки
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token'); // Получаем токен из кук
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Добавляем токен в заголовок
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;