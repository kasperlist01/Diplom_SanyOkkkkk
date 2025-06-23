import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    Row,
    Col,
    Tag,
    Space,
    Button,
    Divider,
    Descriptions,
    Tabs,
    Statistic,
    Table,
    List,
    Alert,
    Badge,
    Avatar
} from 'antd';
import {
    ArrowLeftOutlined,
    NumberOutlined,
    EnvironmentOutlined,
    BankOutlined,
    CalendarOutlined,
    UserOutlined,
    DollarOutlined,
    FileTextOutlined,
    TrophyOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    BuildOutlined,
    HomeOutlined,
    TeamOutlined
} from '@ant-design/icons';
import styled from '@emotion/styled';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import FinancialCharts from '../components/company/FinancialCharts';
import { getCompanyById, getCompanyAnalytics } from '../services/api';
import { useSearch } from '../contexts/SearchContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Container = styled.div`
    max-width: 100%;
    margin: 0 auto;
`;

const GlassBackButton = styled(Button)`
    margin-bottom: 24px;
    border-radius: 16px;
    height: 44px;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    &:focus {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
    }
`;

// Стеклянная карточка компании с эффектом стекла
const CompanyHeroCard = styled(Card)`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
    margin-bottom: 32px;
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
        padding: 40px;
        position: relative;
        z-index: 1;

        @media (max-width: 768px) {
            padding: 24px;
        }

        @media (max-width: 480px) {
            padding: 20px;
        }
    }
`;

// Стеклянные карточки для контента
const GlassContentCard = styled(Card)`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
    margin-bottom: 32px;
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

    .ant-tabs {
        .ant-tabs-nav {
            &::before {
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
        }

        .ant-tabs-tab {
            color: rgba(255, 255, 255, 0.8);

            &:hover {
                color: white;
            }

            &.ant-tabs-tab-active {
                .ant-tabs-tab-btn {
                    color: white;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                }
            }
        }

        .ant-tabs-ink-bar {
            background: rgba(255, 255, 255, 0.8);
        }

        .ant-tabs-content-holder {
            color: rgba(255, 255, 255, 0.9);
        }
    }
`;

const GlassStatisticCard = styled(Card)`
    text-align: center;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .ant-statistic {
        .ant-statistic-title {
            color: rgba(255, 255, 255, 0.8);
        }

        .ant-statistic-content {
            color: white;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
    }
`;

const GlassTable = styled(Table)`
    .ant-table {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;

        .ant-table-thead > tr > th {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            font-weight: 600;
        }

        .ant-table-tbody > tr > td {
            background: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.9);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ant-table-tbody > tr:hover > td {
            background: rgba(255, 255, 255, 0.1);
        }
    }
`;

const GlassAlert = styled(Alert)`
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .ant-alert-message {
        color: #dbeafe;
    }

    .ant-alert-description {
        color: rgba(219, 234, 254, 0.8);
    }

    .ant-alert-icon {
        color: #93c5fd;
    }
`;

const CompanyAvatar = styled(Avatar)`
    background: rgba(255, 255, 255, 0.2);
    border: 3px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    color: white;
    font-weight: bold;
    font-size: 24px;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
        width: 60px;
        height: 60px;
        font-size: 18px;
    }
`;

const CompanyTitle = styled(Title)`
    &.ant-typography {
        color: white;
        margin-bottom: 12px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        font-weight: 700;

        @media (max-width: 768px) {
            font-size: 24px !important;
            margin-bottom: 8px;
        }

        @media (max-width: 480px) {
            font-size: 20px !important;
        }
    }
`;

const CompanySubtitle = styled(Text)`
    &.ant-typography {
        color: rgba(255, 255, 255, 0.9);
        font-size: 16px;
        display: block;
        margin-bottom: 24px;
        line-height: 1.5;

        @media (max-width: 768px) {
            font-size: 14px;
            margin-bottom: 20px;
        }
    }
`;

const StatusBadge = styled(Badge)`
    .ant-badge-status-dot {
        width: 12px;
        height: 12px;
    }
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 32px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 16px;
        margin-top: 24px;
    }
`;

const InfoCard = styled.div`
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 20px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        background: rgba(255, 255, 255, 0.2);
    }

    @media (max-width: 768px) {
        padding: 16px;
    }
`;

const InfoTitle = styled.div`
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;

    .anticon {
        font-size: 14px;
    }
`;

const InfoValue = styled.div`
    color: white;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    word-break: break-word;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const StatusTagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;

    @media (max-width: 768px) {
        margin-top: 16px;
    }
`;

const GlassTag = styled(Tag)`
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    font-size: 12px;

    &.status-active {
        background: rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.4);
        color: #bbf7d0;
    }

    &.status-inactive {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.4);
        color: #fecaca;
    }

    &.okved-secondary {
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(16, 185, 129, 0.3);
        color: #bbf7d0;
    }
`;

const StyledText = styled(Text)`
    &.ant-typography {
        color: rgba(255, 255, 255, 0.9);

        &.ant-typography-strong {
            color: white;
        }
    }
`;

const StyledTitle = styled(Title)`
    &.ant-typography {
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
`;

// Стилизованная карточка для похожих компаний
const SimilarCompanyCard = styled(Card)`
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    margin-bottom: 16px;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
    }

    .ant-card-body {
        padding: 16px;
    }
`;

const CompanyPage = () => {
    const { inn } = useParams();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { hasSearched } = useSearch();

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                setLoading(true);
                setError(null);

                const analyticsData = await getCompanyAnalytics(inn);
                setAnalytics(analyticsData);
            } catch (err) {
                console.error('Error fetching company data:', err);
                setError('Ошибка при загрузке данных о компании');
            } finally {
                setLoading(false);
            }
        };

        if (inn) {
            fetchCompanyData();
        }
    }, [inn]);

    // ИСПРАВЛЕНИЕ: Функция для форматирования валюты (данные уже корректные)
    const formatCurrency = (value) => {
        if (!value || value === 0) return '0 ₽';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // НОВАЯ ФУНКЦИЯ: Форматирование процентов
    const formatPercentage = (value) => {
        if (!value && value !== 0) return '0%';
        return `${value}%`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Не указано';
        try {
            return new Date(dateString).toLocaleDateString('ru-RU');
        } catch {
            return dateString;
        }
    };

    const getCompanyInitials = (name) => {
        if (!name) return 'К';
        const words = name.split(' ').filter(word => word.length > 0);
        if (words.length >= 2) {
            return words[0][0] + words[1][0];
        }
        return words[0] ? words[0][0] : 'К';
    };

    const getStatusInfo = (status) => {
        if (!status) return { text: 'Неизвестно', type: 'default', color: 'default' };

        if (status.active_status) {
            return {
                text: status.status_rus_short || 'Действующая',
                type: 'active',
                color: 'success',
                icon: <CheckCircleOutlined />
            };
        } else {
            return {
                text: status.status_rus_short || 'Недействующая',
                type: 'inactive',
                color: 'error',
                icon: <ExclamationCircleOutlined />
            };
        }
    };

    // Функция для перехода к похожей компании
    const handleSimilarCompanyClick = (company) => {
        navigate(`/company/${company.inn}`);
    };

    if (loading) {
        return <LoadingSpinner type="big" tip="Загрузка информации о компании..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
    }

    if (!analytics || !analytics.company) {
        return <ErrorMessage message="Компания не найдена" />;
    }

    const { company, reports, chart_data, similar_companies } = analytics;
    const rusprofileData = company.rusprofile_data?.data || {};
    const statusInfo = getStatusInfo(company.status);

    // Подготавливаем данные для таблицы финансовых отчетов
    const reportColumns = [
        {
            title: 'Год',
            dataIndex: 'year',
            key: 'year',
            width: 80,
        },
        {
            title: 'Выручка',
            dataIndex: 'revenue_cur',
            key: 'revenue_cur',
            render: (value) => formatCurrency(value), // ИСПРАВЛЕНИЕ: Данные уже корректные
        },
        {
            title: 'Валовая прибыль',
            dataIndex: 'gross_profit_cur',
            key: 'gross_profit_cur',
            render: (value) => formatCurrency(value), // ИСПРАВЛЕНИЕ: Данные уже корректные
        },
        {
            title: 'Чистая прибыль',
            dataIndex: 'net_profit_cur',
            key: 'net_profit_cur',
            render: (value) => (
                <StyledText style={{ color: value >= 0 ? '#bbf7d0' : '#fecaca' }}>
                    {formatCurrency(value)} {/* ИСПРАВЛЕНИЕ: Данные уже корректные */}
                </StyledText>
            ),
        },
        {
            title: 'Активы',
            dataIndex: 'balance_assets_eoy',
            key: 'balance_assets_eoy',
            render: (value) => formatCurrency(value), // ИСПРАВЛЕНИЕ: Данные уже корректные
        },
    ];

    const reportData = reports.map((report, index) => ({
        ...report,
        key: index,
    }));

    return (
        <Container>
            <GlassBackButton
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
                size="large"
            >
                {hasSearched ? 'Вернуться к результатам' : 'Вернуться к поиску'}
            </GlassBackButton>

            {/* Верхний блок с информацией о компании */}
            <CompanyHeroCard>
                <Row align="top" gutter={[24, 24]}>
                    <Col xs={24} sm={4} md={3} style={{ textAlign: 'center' }}>
                        <CompanyAvatar size={80}>
                            {getCompanyInitials(company.name)}
                        </CompanyAvatar>
                    </Col>

                    <Col xs={24} sm={20} md={21}>
                        <Row align="middle" justify="space-between">
                            <Col xs={24} lg={18}>
                                <CompanyTitle level={1}>
                                    {company.name}
                                </CompanyTitle>
                                <CompanySubtitle>
                                    {company.full_name}
                                </CompanySubtitle>

                                <StatusTagsContainer>
                                    <StatusBadge
                                        status={statusInfo.type === 'active' ? 'success' : 'error'}
                                        text={
                                            <GlassTag className={`status-${statusInfo.type}`}>
                                                {statusInfo.icon} {statusInfo.text}
                                            </GlassTag>
                                        }
                                    />
                                    {company.opf && (
                                        <GlassTag>
                                            <BuildOutlined /> {company.opf}
                                        </GlassTag>
                                    )}
                                    {company.tax_mode_info?.usn_sign && (
                                        <GlassTag>УСН</GlassTag>
                                    )}
                                    {company.tax_mode_info?.envd_sign && (
                                        <GlassTag>ЕНВД</GlassTag>
                                    )}
                                    {company.tax_mode_info?.common_mode && (
                                        <GlassTag>Общий режим</GlassTag>
                                    )}
                                </StatusTagsContainer>
                            </Col>
                        </Row>

                        <InfoGrid>
                            <InfoCard>
                                <InfoTitle>
                                    <NumberOutlined /> ИНН / ОГРН
                                </InfoTitle>
                                <InfoValue>
                                    {company.inn}
                                    {company.ogrn && (
                                        <>
                                            <br />
                                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                                ОГРН: {company.ogrn}
                                            </Text>
                                        </>
                                    )}
                                </InfoValue>
                            </InfoCard>

                            <InfoCard>
                                <InfoTitle>
                                    <HomeOutlined /> Адрес
                                </InfoTitle>
                                <InfoValue>
                                    {company.address || company.location || 'Не указан'}
                                </InfoValue>
                            </InfoCard>

                            <InfoCard>
                                <InfoTitle>
                                    <CalendarOutlined /> Регистрация
                                </InfoTitle>
                                <InfoValue>
                                    {formatDate(company.registration_date)}
                                </InfoValue>
                            </InfoCard>

                            <InfoCard>
                                <InfoTitle>
                                    <DollarOutlined /> Уставный капитал
                                </InfoTitle>
                                <InfoValue>
                                    {company.charter_capital
                                        ? formatCurrency(parseFloat(company.charter_capital))
                                        : 'Не указан'
                                    }
                                </InfoValue>
                            </InfoCard>

                            {company.kpp && (
                                <InfoCard>
                                    <InfoTitle>
                                        <BankOutlined /> КПП
                                    </InfoTitle>
                                    <InfoValue>
                                        {company.kpp}
                                    </InfoValue>
                                </InfoCard>
                            )}

                            {(company.okved || company.okved_o) && (
                                <InfoCard>
                                    <InfoTitle>
                                        <FileTextOutlined /> ОКВЭД
                                    </InfoTitle>
                                    <InfoValue>
                                        {company.okved && (
                                            <div style={{ marginBottom: '4px' }}>
                                                Основной: {company.okved}
                                            </div>
                                        )}
                                        {company.okved_o && (
                                            <div style={{ fontSize: '14px', opacity: 0.8 }}>
                                                Доп.: {company.okved_o}
                                            </div>
                                        )}
                                    </InfoValue>
                                </InfoCard>
                            )}
                        </InfoGrid>
                    </Col>
                </Row>
            </CompanyHeroCard>

            {/* Стеклянные вкладки с детальной информацией */}
            <GlassContentCard>
                <Tabs defaultActiveKey="1" size="large">
                    {/* Финансовые показатели */}
                    <TabPane tab={<span><DollarOutlined />Финансы</span>} key="1">
                        {reports && reports.length > 0 ? (
                            <>
                                {/* Ключевые показатели - ИСПРАВЛЕНИЕ: данные уже корректные */}
                                <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                                    <Col xs={24} sm={8}>
                                        <GlassStatisticCard>
                                            <Statistic
                                                title="Выручка 2024"
                                                value={reports[reports.length - 1]?.revenue_cur}
                                                formatter={(value) => formatCurrency(value)}
                                                valueStyle={{ color: '#bbf7d0' }}
                                            />
                                        </GlassStatisticCard>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <GlassStatisticCard>
                                            <Statistic
                                                title="Прибыль 2024"
                                                value={reports[reports.length - 1]?.net_profit_cur}
                                                formatter={(value) => formatCurrency(value)}
                                                valueStyle={{
                                                    color: reports[reports.length - 1]?.net_profit_cur >= 0 ? '#bbf7d0' : '#fecaca'
                                                }}
                                            />
                                        </GlassStatisticCard>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <GlassStatisticCard>
                                            <Statistic
                                                title="Активы 2024"
                                                value={reports[reports.length - 1]?.balance_assets_eoy}
                                                formatter={(value) => formatCurrency(value)}
                                                valueStyle={{ color: '#bbf7d0' }}
                                            />
                                        </GlassStatisticCard>
                                    </Col>
                                </Row>

                                {/* Графики */}
                                <FinancialCharts chartData={chart_data} />

                                {/* Таблица отчетов */}
                                <StyledTitle level={4} style={{ marginTop: 32 }}>
                                    Финансовые отчеты по годам
                                </StyledTitle>
                                <GlassTable
                                    columns={reportColumns}
                                    dataSource={reportData}
                                    pagination={false}
                                    scroll={{ x: 800 }}
                                    size="middle"
                                />
                            </>
                        ) : (
                            <GlassAlert
                                message="Финансовые данные отсутствуют"
                                description="Для данной компании финансовая отчетность недоступна"
                                type="info"
                                showIcon
                            />
                        )}
                    </TabPane>

                    {/* Владельцы */}
                    <TabPane tab={<span><UserOutlined />Владельцы</span>} key="2">
                        {company.owners?.fl && company.owners.fl.length > 0 && (
                            <>
                                <StyledTitle level={4}>Учредители (физические лица)</StyledTitle>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={company.owners.fl}
                                    renderItem={(owner) => (
                                        <List.Item style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                            <List.Item.Meta
                                                avatar={<UserOutlined style={{ fontSize: 24, color: '#93c5fd' }} />}
                                                title={<StyledText strong>{owner.name}</StyledText>}
                                                description={
                                                    <Space direction="vertical">
                                                        <StyledText>Доля: {formatPercentage(owner.share)}</StyledText>
                                                        <StyledText>ИНН: {owner.inn}</StyledText>
                                                        {/* ИСПРАВЛЕНИЕ: Размер доли уже корректный из API (деленный на 1000) */}
                                                        <StyledText>Размер доли: {formatCurrency(owner.captable_size)}</StyledText>
                                                        <StyledText>Дата: {formatDate(owner.date)}</StyledText>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </>
                        )}

                        {/* НОВОЕ: Добавляем учредителей юридических лиц */}
                        {company.owners?.ul && company.owners.ul.length > 0 && (
                            <>
                                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                                <StyledTitle level={4}>Учредители (юридические лица)</StyledTitle>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={company.owners.ul}
                                    renderItem={(owner) => (
                                        <List.Item style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                            <List.Item.Meta
                                                avatar={<BankOutlined style={{ fontSize: 24, color: '#93c5fd' }} />}
                                                title={<StyledText strong>{owner.name}</StyledText>}
                                                description={
                                                    <Space direction="vertical">
                                                        <StyledText>Доля: {formatPercentage(owner.share)}</StyledText>
                                                        <StyledText>ИНН: {owner.inn}</StyledText>
                                                        <StyledText>Размер доли: {formatCurrency(owner.captable_size)}</StyledText>
                                                        <StyledText>Дата: {formatDate(owner.date)}</StyledText>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </>
                        )}

                        {rusprofileData.director && (
                            <>
                                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                                <StyledTitle level={4}>Руководство</StyledTitle>
                                <Card
                                    size="small"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}
                                >
                                    <StyledText strong>Директор: </StyledText>
                                    <StyledText>{rusprofileData.director}</StyledText>
                                </Card>
                            </>
                        )}
                    </TabPane>

                    {/* Дополнительные данные */}
                    <TabPane tab={<span><FileTextOutlined />Дополнительно</span>} key="3">
                        <Row gutter={[24, 24]}>
                            {/* Коды статистики */}
                            <Col xs={24} lg={12}>
                                <Card
                                    title={<StyledText strong>Коды статистики</StyledText>}
                                    size="small"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}
                                >
                                    <Descriptions size="small" column={1}>
                                        <Descriptions.Item label={<StyledText>ОКПО</StyledText>}>
                                            <StyledText>{rusprofileData.okpo}</StyledText>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<StyledText>ОКАТО</StyledText>}>
                                            <StyledText>{rusprofileData.okato}</StyledText>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<StyledText>ОКТМО</StyledText>}>
                                            <StyledText>{rusprofileData.oktmo}</StyledText>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<StyledText>ОКФС</StyledText>}>
                                            <StyledText>{rusprofileData.okfs}</StyledText>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<StyledText>ОКОГУ</StyledText>}>
                                            <StyledText>{rusprofileData.okogu}</StyledText>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<StyledText>ОКОПФ</StyledText>}>
                                            <StyledText>{rusprofileData.okopf}</StyledText>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            {/* Связи */}
                            <Col xs={24} lg={12}>
                                <Card
                                    title={<StyledText strong>Связи с другими организациями</StyledText>}
                                    size="small"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <StyledText><strong>Всего связей:</strong> {rusprofileData.total_connections}</StyledText>
                                        <StyledText><strong>По адресу:</strong> {rusprofileData.connections_by_address}</StyledText>
                                        <StyledText><strong>По руководителю:</strong> {rusprofileData.connections_by_director}</StyledText>
                                        <StyledText><strong>По учредителю:</strong> {rusprofileData.connections_by_founder}</StyledText>
                                    </Space>
                                </Card>
                            </Col>

                            {/* Госзакупки */}
                            {rusprofileData.government_contracts_count && (
                                <Col xs={24} lg={12}>
                                    <Card
                                        title={<StyledText strong>Государственные закупки</StyledText>}
                                        size="small"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <StyledText><strong>Количество:</strong> {rusprofileData.government_contracts_count}</StyledText>
                                            <StyledText><strong>Сумма:</strong> {rusprofileData.government_contracts_sum}</StyledText>
                                            <StyledText><strong>Основной заказчик:</strong> {rusprofileData.main_contractor}</StyledText>
                                        </Space>
                                    </Card>
                                </Col>
                            )}

                            {/* Налоги и взносы */}
                            {(rusprofileData.taxes_2023 || rusprofileData.contributions_2023) && (
                                <Col xs={24} lg={12}>
                                    <Card
                                        title={<StyledText strong>Налоги и взносы 2023</StyledText>}
                                        size="small"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <StyledText><strong>Налоги:</strong> {rusprofileData.taxes_2023}</StyledText>
                                            <StyledText><strong>Взносы:</strong> {rusprofileData.contributions_2023}</StyledText>
                                        </Space>
                                    </Card>
                                </Col>
                            )}

                            {/* Арбитражные дела */}
                            {rusprofileData.arbitration_cases && (
                                <Col xs={24} lg={12}>
                                    <Card
                                        title={<StyledText strong>Арбитражные дела</StyledText>}
                                        size="small"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <StyledText><strong>Количество дел:</strong> {rusprofileData.arbitration_cases}</StyledText>
                                            <StyledText><strong>Сумма:</strong> {rusprofileData.arbitration_sum}</StyledText>
                                        </Space>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    </TabPane>

                    {/* ОКВЭД информация */}
                    {rusprofileData.okved && (
                        <TabPane tab={<span><TrophyOutlined />ОКВЭД</span>} key="4">
                            <Row gutter={[24, 24]}>
                                <Col xs={24} lg={12}>
                                    <Card
                                        title={<StyledText strong>Основная деятельность</StyledText>}
                                        size="small"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <StyledText><strong>Отрасль:</strong> {rusprofileData.okved.industry}</StyledText>
                                            <StyledText><strong>Основной вид:</strong> {rusprofileData.okved.main_activity}</StyledText>
                                            <StyledText><strong>Регион:</strong> {rusprofileData.okved.region}</StyledText>
                                        </Space>
                                    </Card>
                                </Col>

                                <Col xs={24} lg={12}>
                                    <Card
                                        title={<StyledText strong>Рейтинг в отрасли</StyledText>}
                                        size="small"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <StyledText><strong>Место в России:</strong> {rusprofileData.okved.rank_russia} из {rusprofileData.okved.total_russia}</StyledText>
                                            <StyledText><strong>Место в регионе:</strong> {rusprofileData.okved.rank_region} из {rusprofileData.okved.total_region}</StyledText>
                                            <StyledText><strong>Средняя выручка в отрасли:</strong> {rusprofileData.okved.average_revenue}</StyledText>
                                        </Space>
                                    </Card>
                                </Col>

                                {rusprofileData.okved.top_companies && rusprofileData.okved.top_companies.length > 0 && (
                                    <Col xs={24}>
                                        <Card
                                            title={<StyledText strong>Топ компаний отрасли</StyledText>}
                                            size="small"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)'
                                            }}
                                        >
                                            <List
                                                dataSource={rusprofileData.okved.top_companies}
                                                renderItem={(company, index) => (
                                                    <List.Item style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                                        <StyledText>{index + 1}. {company}</StyledText>
                                                    </List.Item>
                                                )}
                                            />
                                        </Card>
                                    </Col>
                                )}
                            </Row>
                        </TabPane>
                    )}

                    {/* Похожие организации */}
                    <TabPane tab={<span><TeamOutlined />Похожие организации</span>} key="5">
                        {similar_companies && similar_companies.length > 0 ? (
                            <>
                                <StyledTitle level={4} style={{ marginBottom: 24 }}>
                                    Организации с аналогичным ОКВЭД ({similar_companies.length})
                                </StyledTitle>

                                <Row gutter={[16, 16]}>
                                    {similar_companies.map((similarCompany) => (
                                        <Col xs={24} lg={12} key={similarCompany.company_id}>
                                            <SimilarCompanyCard
                                                onClick={() => handleSimilarCompanyClick(similarCompany)}
                                                hoverable
                                            >
                                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                                    <StyledText strong style={{ fontSize: '16px' }}>
                                                        {similarCompany.name}
                                                    </StyledText>

                                                    <Space wrap>
                                                        <StyledText>
                                                            <NumberOutlined style={{ marginRight: 4, color: '#93c5fd' }} />
                                                            ИНН: {similarCompany.inn}
                                                        </StyledText>
                                                    </Space>

                                                    {similarCompany.okved && (
                                                        <Space wrap>
                                                            <StyledText>ОКВЭД:</StyledText>
                                                            <GlassTag>
                                                                {similarCompany.okved}
                                                            </GlassTag>
                                                        </Space>
                                                    )}

                                                    {similarCompany.okved_o && (
                                                        <Space wrap>
                                                            <StyledText>Доп. ОКВЭД:</StyledText>
                                                            <GlassTag className="okved-secondary">
                                                                {similarCompany.okved_o}
                                                            </GlassTag>
                                                        </Space>
                                                    )}

                                                    {similarCompany.location && (
                                                        <StyledText style={{ fontSize: '14px', opacity: 0.8 }}>
                                                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                                                            {similarCompany.location}
                                                        </StyledText>
                                                    )}
                                                </Space>
                                            </SimilarCompanyCard>
                                        </Col>
                                    ))}
                                </Row>

                                <Alert
                                    message="Совет"
                                    description="Сравните финансовые показатели с похожими компаниями для анализа конкурентоспособности"
                                    type="info"
                                    showIcon
                                    style={{
                                        marginTop: 24,
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: '12px'
                                    }}
                                />
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                <StyledTitle level={4}>
                                    Похожие организации не найдены
                                </StyledTitle>
                                <StyledText>
                                    {company.okved
                                        ? `Нет других организаций с ОКВЭД ${company.okved}`
                                        : 'У данной организации не указан код ОКВЭД'
                                    }
                                </StyledText>
                            </div>
                        )}
                    </TabPane>
                </Tabs>
            </GlassContentCard>
        </Container>
    );
};

export default CompanyPage;