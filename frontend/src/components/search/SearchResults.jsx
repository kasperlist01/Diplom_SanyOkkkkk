// frontend/src/components/search/SearchResults.jsx
import React from 'react';
import { Card, Typography, Tag, Space, Row, Col, Button } from 'antd';
import { NumberOutlined, EnvironmentOutlined, ClearOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const { Title, Text } = Typography;

// Стеклянная карточка результатов
const GlassResultsCard = styled(Card)`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        pointer-events: none;
    }

    .ant-card-body {
        padding: 32px;
        position: relative;
        z-index: 1;

        @media (max-width: 768px) {
            padding: 24px;
        }
    }
`;

// Стеклянная карточка компании
const GlassCompanyCard = styled(Card)`
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    margin-bottom: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
    overflow: hidden;
    position: relative;
    opacity: 0;
    transform: translateY(20px);
    animation: slideInUp 0.6s ease-out forwards;
    animation-delay: ${props => props.index * 0.1}s;

    @keyframes slideInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        pointer-events: none;
        transition: all 0.3s ease;
    }

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);

        &::before {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
        }
    }

    .ant-card-body {
        padding: 24px;
        position: relative;
        z-index: 1;

        @media (max-width: 768px) {
            padding: 16px;
        }
    }
`;

const CompanyName = styled(Title)`
    &.ant-typography {
        margin-bottom: 8px;
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

        @media (max-width: 768px) {
            font-size: 18px !important;
        }
    }
`;

const InfoRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    @media (max-width: 768px) {
        flex-wrap: wrap;
    }
`;

const GlassTag = styled(Tag)`
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: #e0e7ff;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 12px;
    backdrop-filter: blur(10px);

    &.okved-secondary {
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(16, 185, 129, 0.3);
        color: #bbf7d0;
    }
`;

const InfoText = styled(Text)`
    &.ant-typography {
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

        &.ant-typography-strong {
            color: white;
        }
    }
`;

const ResultsTitle = styled(Title)`
    &.ant-typography {
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        margin-bottom: 24px;
    }
`;

const EmptyStateText = styled(Text)`
    &.ant-typography {
        color: rgba(255, 255, 255, 0.8);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
`;

const EmptyStateTitle = styled(Title)`
    &.ant-typography {
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
`;

const SearchResults = ({ data, loading, error }) => {
    const navigate = useNavigate();
    const { clearResults } = useSearch();

    // ИСПРАВЛЕНИЕ: Показываем спиннер во время загрузки
    if (loading) {
        return <LoadingSpinner type="search" tip="Поиск компаний..." />;
    }

    // Показываем ошибку
    if (error) {
        return <ErrorMessage message={error} />;
    }

    // ИСПРАВЛЕНИЕ: Если нет данных И не было поиска, не показываем ничего
    if (!data) {
        return null; // Не показываем пустое состояние до первого поиска
    }

    // Показываем пустое состояние только если был выполнен поиск, но результатов нет
    if (!data.companies || data.companies.length === 0) {
        return (
            <GlassResultsCard>
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <EmptyStateTitle level={4}>
                        Предприятия не найдены
                    </EmptyStateTitle>
                    <EmptyStateText>
                        Попробуйте изменить параметры поиска
                    </EmptyStateText>
                </div>
            </GlassResultsCard>
        );
    }

    const handleCompanyClick = (company) => {
        navigate(`/company/${company.inn}`);
    };

    return (
        <GlassResultsCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <ResultsTitle level={3} style={{ margin: 0 }}>
                    Найдено предприятий: {data.total} (показано: {data.companies.length})
                </ResultsTitle>
                <Button
                    icon={<ClearOutlined />}
                    onClick={clearResults}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        borderRadius: '12px'
                    }}
                >
                    Очистить результаты
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                {data.companies.map((company, index) => (
                    <Col xs={24} lg={12} key={company.company_id}>
                        <GlassCompanyCard
                            onClick={() => handleCompanyClick(company)}
                            index={index}
                        >
                            <CompanyName level={4}>
                                {company.name}
                            </CompanyName>

                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <InfoRow>
                                    <NumberOutlined style={{ color: '#e0e7ff' }} />
                                    <InfoText strong>ИНН:</InfoText>
                                    <InfoText>{company.inn}</InfoText>
                                </InfoRow>

                                {company.location && (
                                    <InfoRow>
                                        <EnvironmentOutlined style={{ color: '#bbf7d0' }} />
                                        <InfoText strong>Регион:</InfoText>
                                        <InfoText ellipsis style={{ flex: 1 }}>
                                            {company.location}
                                        </InfoText>
                                    </InfoRow>
                                )}

                                {company.okved && (
                                    <InfoRow>
                                        <InfoText strong>ОКВЭД:</InfoText>
                                        <GlassTag>
                                            {company.okved}
                                        </GlassTag>
                                    </InfoRow>
                                )}

                                {company.okved_o && (
                                    <InfoRow>
                                        <InfoText strong>Доп. ОКВЭД:</InfoText>
                                        <GlassTag className="okved-secondary">
                                            {company.okved_o}
                                        </GlassTag>
                                    </InfoRow>
                                )}
                            </Space>
                        </GlassCompanyCard>
                    </Col>
                ))}
            </Row>
        </GlassResultsCard>
    );
};

export default SearchResults;