import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch должен использоваться внутри SearchProvider');
    }
    return context;
};

export const SearchProvider = ({ children }) => {
    const [searchState, setSearchState] = useState({
        lastSearchParams: null,
        lastSearchType: null,
        searchResults: null,
        loading: false,
        error: null,
        hasSearched: false
    });

    const saveSearchResults = (params, type, results) => {
        console.log('📊 SearchContext: Сохраняем результаты поиска:', {
            params,
            type,
            resultsCount: results?.companies?.length || 0,
            total: results?.total || 0
        });

        setSearchState(prev => ({
            ...prev,
            lastSearchParams: params,
            lastSearchType: type,
            searchResults: results,
            loading: false, // ✅ Сбрасываем loading
            error: null,
            hasSearched: true
        }));
    };

    const setLoading = (loading) => {
        console.log('⏳ SearchContext: Устанавливаем loading:', loading);
        setSearchState(prev => ({
            ...prev,
            loading,
            error: loading ? null : prev.error // Очищаем ошибку при начале загрузки
        }));
    };

    const setError = (error) => {
        console.log('❌ SearchContext: Устанавливаем ошибку:', error);
        setSearchState(prev => ({
            ...prev,
            error,
            loading: false // ✅ Сбрасываем loading при ошибке
        }));
    };

    const clearResults = () => {
        console.log('🧹 SearchContext: Очищаем результаты поиска');
        setSearchState({
            lastSearchParams: null,
            lastSearchType: null,
            searchResults: null,
            loading: false,
            error: null,
            hasSearched: false
        });
    };

    // ✅ Добавляем логирование состояния
    console.log('🔍 SearchContext: Текущее состояние:', {
        loading: searchState.loading,
        hasResults: !!searchState.searchResults,
        hasError: !!searchState.error,
        hasSearched: searchState.hasSearched
    });

    return (
        <SearchContext.Provider value={{
            ...searchState,
            saveSearchResults,
            setLoading,
            setError,
            clearResults
        }}>
            {children}
        </SearchContext.Provider>
    );
};