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
        console.log('📡 API Request:', config.method.toUpperCase(), config.url, config.params);
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.url, response.status, {
            companiesCount: response.data?.companies?.length,
            total: response.data?.total,
            dataKeys: Object.keys(response.data || {})
        });
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', {
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
        console.log('🔍 API: Отправляем универсальный поиск с параметрами:', params);
        const response = await api.get('/companies/search', { params });
        console.log('✅ API: Универсальный поиск завершен:', {
            found: response.data?.companies?.length || 0,
            total: response.data?.total || 0
        });
        return response.data;
    } catch (error) {
        console.error('❌ API: Ошибка универсального поиска:', error);
        throw error;
    }
};

// Поиск компаний по названию
export const searchCompaniesByName = async (name, limit = 100) => {
    try {
        console.log('🏢 API: Поиск по названию:', { name, limit });
        const response = await api.get('/companies/search/by-name', {
            params: { name, limit }
        });
        console.log('✅ API: Поиск по названию завершен:', {
            found: response.data?.companies?.length || 0,
            total: response.data?.total || 0
        });
        return response.data;
    } catch (error) {
        console.error('❌ API: Ошибка поиска по названию:', error);
        throw error;
    }
};

// Поиск компаний по ОКВЭД
export const searchCompaniesByOkved = async (okved, limit = 100) => {
    try {
        console.log('📋 API: Поиск по ОКВЭД:', { okved, limit });
        const response = await api.get('/companies/search/by-okved', {
            params: { okved, limit }
        });
        console.log('✅ API: Поиск по ОКВЭД завершен:', {
            found: response.data?.companies?.length || 0,
            total: response.data?.total || 0
        });
        return response.data;
    } catch (error) {
        console.error('❌ API: Ошибка поиска по ОКВЭД:', error);
        throw error;
    }
};

// Получение детальной информации о компании
export const getCompanyById = async (inn) => {
    try {
        console.log('🏢 API: Получение информации о компании:', inn);
        const response = await api.get(`/companies/${inn}`);
        console.log('✅ API: Информация о компании получена:', response.data?.name);
        return response.data;
    } catch (error) {
        console.error('❌ API: Ошибка получения компании:', error);
        throw error;
    }
};

// Получение аналитики компании
export const getCompanyAnalytics = async (inn) => {
    try {
        console.log('📊 API: Получение аналитики компании:', inn);
        const response = await api.get(`/companies/${inn}/analytics`);
        console.log('✅ API: Аналитика компании получена:', {
            companyName: response.data?.company?.name,
            reportsCount: response.data?.reports?.length || 0,
            similarCount: response.data?.similar_companies?.length || 0
        });
        return response.data;
    } catch (error) {
        console.error('❌ API: Ошибка получения аналитики:', error);
        throw error;
    }
};

export default api;