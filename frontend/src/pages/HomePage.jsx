// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Typography } from 'antd';
import styled from '@emotion/styled';
import SearchForm from '../components/search/SearchForm';
import SearchResults from '../components/search/SearchResults';
import { useSearch } from '../contexts/SearchContext';
import {
    searchCompanies,
    searchCompaniesByName,
    searchCompaniesByOkved
} from '../services/api';
import SavedSearchIndicator from '../components/common/SavedSearchIndicator';

const { Title, Paragraph } = Typography;

/* ======= СТИЛИ ======= */
const Container = styled.div`
    max-width: 100%;
    margin: 0 auto;
`;

const HeroSection = styled.div`
    text-align: center;
    margin-bottom: 48px;

    @media (max-width: 768px) {
        margin-bottom: 32px;
    }
`;

const HeroTitle = styled(Title)`
    &.ant-typography {
        color: white;
        font-weight: 800;
        font-size: 3.5rem;
        margin-bottom: 16px;
        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        position: relative;

        &::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 4px;
            background: linear-gradient(90deg, #94a3b8, #cbd5e1, #e2e8f0);
            border-radius: 2px;
            opacity: 0.7;
        }

        @media (max-width: 768px) {
            font-size: 2.5rem;
        }

        @media (max-width: 480px) {
            font-size: 2rem;
        }
    }
`;

const HeroSubtitle = styled(Paragraph)`
    &.ant-typography {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.25rem;
        margin-bottom: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;

        @media (max-width: 768px) {
            font-size: 1.1rem;
        }
    }
`;

const SearchSection = styled.div`
    margin-bottom: 32px;
`;

/* ======= КОМПОНЕНТ ======= */
const HomePage = () => {
    const {
        searchResults,
        loading,
        error,
        hasSearched,
        lastSearchParams,
        lastSearchType,
        saveSearchResults,
        setLoading,
        setError
    } = useSearch();

    /* Запускаем поиск */
    const handleSearch = async (values, searchType) => {
        console.log('🚀 HomePage: Начинаем поиск:', { values, searchType });

        // 1. ✅ Показываем спиннер СРАЗУ (только в кнопке)
        setLoading(true);

        try {
            let response;
            console.log('📡 HomePage: Выбираем тип поиска:', searchType);

            switch (searchType) {
                case 'name':
                    console.log('🏢 HomePage: Поиск по названию:', values.name);
                    response = await searchCompaniesByName(values.name);
                    break;
                case 'okved':
                    console.log('📋 HomePage: Поиск по ОКВЭД:', values.okved);
                    response = await searchCompaniesByOkved(values.okved);
                    break;
                default:
                    console.log('🔍 HomePage: Универсальный поиск:', values);
                    response = await searchCompanies(values);
            }

            console.log('✅ HomePage: Получили ответ:', {
                companiesCount: response?.companies?.length || 0,
                total: response?.total || 0
            });

            // 2. ✅ Сохраняем результат (loading сбросится внутри saveSearchResults)
            saveSearchResults(values, searchType, response);

        } catch (err) {
            console.error('❌ HomePage: Ошибка поиска:', err);
            setError(err.message || 'Ошибка при поиске предприятий');
        }
        // ✅ setLoading(false) выполняется либо в saveSearchResults, либо в setError
    };

    // ✅ Добавляем логирование текущего состояния
    console.log('🏠 HomePage: Текущее состояние:', {
        loading,
        hasResults: !!searchResults,
        hasError: !!error,
        hasSearched,
        resultsCount: searchResults?.companies?.length || 0
    });

    return (
        <Container>
            {/* Шапка страницы */}
            <HeroSection>
                <HeroTitle level={1}>
                    Анализ российских предприятий
                </HeroTitle>
                <HeroSubtitle>
                    Найдите информацию о компаниях, изучите финансовые показатели
                    и сравните с конкурентами
                </HeroSubtitle>
            </HeroSection>

            {/* Поисковая форма */}
            <SearchSection>
                <SearchForm
                    onSearch={handleSearch}
                    loading={loading} // ✅ Передаем состояние загрузки только в форму
                    initialValues={lastSearchParams}
                    initialSearchType={lastSearchType}
                />
            </SearchSection>

            {/* Индикатор «показ сохранённого поиска» */}
            {hasSearched && searchResults && !loading && !error && (
                <SavedSearchIndicator
                    searchParams={lastSearchParams}
                    searchType={lastSearchType}
                />
            )}

            {/* ✅ SearchResults НЕ получает loading - показывает только результаты или ошибки */}
            <SearchResults
                data={searchResults}
                loading={false} // ✅ НЕ передаем loading в SearchResults
                error={error}
            />
        </Container>
    );
};

export default HomePage;