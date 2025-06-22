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
        setSearchState({
            lastSearchParams: params,
            lastSearchType: type,
            searchResults: results,
            loading: false,
            error: null,
            hasSearched: true
        });
    };

    const setLoading = (loading) => {
        setSearchState(prev => ({
            ...prev,
            loading
        }));
    };

    const setError = (error) => {
        setSearchState(prev => ({
            ...prev,
            error,
            loading: false
        }));
    };

    const clearResults = () => {
        setSearchState({
            lastSearchParams: null,
            lastSearchType: null,
            searchResults: null,
            loading: false,
            error: null,
            hasSearched: false
        });
    };

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