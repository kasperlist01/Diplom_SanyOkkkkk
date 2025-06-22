import { useState, useEffect } from 'react';
import { searchCompanies } from '../services/api';

export const useCompanySearch = (searchParams) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!searchParams) {
            setData(null);
            setError(null);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log('Начинаем поиск с параметрами:', searchParams);
                const response = await searchCompanies(searchParams);
                console.log('Получен ответ:', response);
                setData(response);
            } catch (err) {
                console.error('Ошибка в хуке поиска:', err);
                setError(err.message || 'Ошибка при поиске предприятий');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    return { data, loading, error };
};