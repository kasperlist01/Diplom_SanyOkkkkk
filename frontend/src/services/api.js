// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцепторы для обработки ошибок
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method.toUpperCase(), config.url, config.params);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.config.url, response.status, response.data);
        return response;
    },
    (error) => {
        console.error('API Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 404) {
            throw new Error('Данные не найдены');
        } else if (error.response?.status === 500) {
            const errorDetail = error.response?.data?.detail || 'Ошибка сервера';
            throw new Error(errorDetail);
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('Превышено время ожидания. Попробуйте упростить запрос');
        } else if (!error.response) {
            throw new Error('Нет соединения с сервером');
        } else if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail);
        }

        return Promise.reject(error);
    }
);

// Универсальный поиск компаний
export const searchCompanies = async (params) => {
    try {
        console.log('Отправляем поиск с параметрами:', params);
        const response = await api.get('/companies/search', { params });
        return response.data;
    } catch (error) {
        console.error('Ошибка поиска компаний:', error);
        throw error;
    }
};

// Поиск компаний по названию
export const searchCompaniesByName = async (name, limit = 100) => {
    try {
        const response = await api.get('/companies/search/by-name', {
            params: { name, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка поиска по названию:', error);
        throw error;
    }
};

// Поиск компаний по ОКВЭД
export const searchCompaniesByOkved = async (okved, limit = 100) => {
    try {
        const response = await api.get('/companies/search/by-okved', {
            params: { okved, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка поиска по ОКВЭД:', error);
        throw error;
    }
};

// Получение детальной информации о компании
export const getCompanyById = async (inn) => {
    try {
        const response = await api.get(`/companies/${inn}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения компании:', error);
        throw error;
    }
};

// Получение аналитики компании
export const getCompanyAnalytics = async (inn) => {
    try {
        const response = await api.get(`/companies/${inn}/analytics`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения аналитики:', error);
        throw error;
    }
};

export default api;