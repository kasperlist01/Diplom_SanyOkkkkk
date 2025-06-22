import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { customTheme } from './styles/theme';
import { SearchProvider } from './contexts/SearchContext';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import CompanyPage from './pages/CompanyPage';
import NotFoundPage from './pages/NotFoundPage';
import './styles/globals.css';

function App() {
    return (
        <ConfigProvider theme={customTheme}>
            <SearchProvider>
                <Router>
                    <MainLayout>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/company/:inn" element={<CompanyPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </MainLayout>
                </Router>
            </SearchProvider>
        </ConfigProvider>
    );
}

export default App;