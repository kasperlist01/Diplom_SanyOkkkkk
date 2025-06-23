import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Alert, Space } from 'antd';
import { LineChartOutlined, EyeOutlined, EyeInvisibleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import styled from '@emotion/styled';
import { useResponsive } from '../../hooks/useResponsive';

const { Title, Text } = Typography;

const GlassChartCard = styled(Card)`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    margin-bottom: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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
        padding: 24px;
        position: relative;
        z-index: 1;

        @media (max-width: 768px) {
            padding: 16px;
        }
    }
`;

const EmptyStateTitle = styled(Title)`
    &.ant-typography {
        color: rgba(255, 255, 255, 0.8);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        text-align: center;
        padding: 48px 0;
    }
`;

// Стили для кнопки предсказания
const PredictionButton = styled(Button)`
    background: ${props => props.active
        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        : 'rgba(245, 158, 11, 0.2)'
    };
    border: 1px solid ${props => props.active ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)'};
    color: ${props => props.active ? 'white' : '#fbbf24'};
    backdrop-filter: blur(10px);
    border-radius: 12px;
    font-weight: 600;
    height: 44px;
    padding: 0 20px;
    transition: all 0.3s ease;
    box-shadow: ${props => props.active
        ? '0 8px 25px rgba(245, 158, 11, 0.4)'
        : '0 4px 15px rgba(245, 158, 11, 0.2)'
    };

    &:hover {
        background: ${props => props.active
            ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
            : 'rgba(245, 158, 11, 0.3)'
        };
        border-color: ${props => props.active ? '#d97706' : 'rgba(245, 158, 11, 0.4)'};
        color: ${props => props.active ? 'white' : '#fbbf24'};
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(245, 158, 11, 0.5);
    }

    &:focus {
        background: ${props => props.active
            ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
            : 'rgba(245, 158, 11, 0.3)'
        };
        border-color: ${props => props.active ? '#d97706' : 'rgba(245, 158, 11, 0.4)'};
        color: ${props => props.active ? 'white' : '#fbbf24'};
    }

    .anticon {
        margin-right: 8px;
    }

    @media (max-width: 768px) {
        height: 40px;
        font-size: 14px;
        padding: 0 16px;
    }
`;

const ControlsContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        gap: 12px;
        margin-bottom: 16px;
    }
`;

const PredictionAlert = styled(Alert)`
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    margin-bottom: 16px;

    .ant-alert-message {
        color: #fbbf24;
        font-weight: 600;
    }

    .ant-alert-description {
        color: rgba(251, 191, 36, 0.9);
    }

    .ant-alert-icon {
        color: #f59e0b;
    }
`;

const FinancialCharts = ({ chartData, predictedData }) => {
    const { isMobile } = useResponsive();
    const [showPrediction, setShowPrediction] = useState(false);

    console.log('📊 FinancialCharts: Props:', {
        hasChartData: !!chartData,
        hasPredictedData: !!predictedData,
        showPrediction
    });

    if (!chartData || !chartData.years || chartData.years.length === 0) {
        return (
            <GlassChartCard>
                <EmptyStateTitle level={4}>
                    Финансовые данные отсутствуют
                </EmptyStateTitle>
            </GlassChartCard>
        );
    }

    // ✅ ИСПРАВЛЕНО: Подготавливаем данные для графиков с предсказанием
    const prepareChartDataWithPrediction = () => {
        const baseYears = [...chartData.years];
        const baseRevenue = [...chartData.revenue];
        const baseProfit = [...chartData.net_profit];

        if (showPrediction && predictedData) {
            // Добавляем предсказанный год и данные
            baseYears.push(predictedData.year);
            baseRevenue.push(predictedData.revenue_cur || 0);
            baseProfit.push(predictedData.net_profit_cur || 0);
        }

        return {
            years: baseYears,
            revenue: baseRevenue,
            profit: baseProfit
        };
    };

    const chartDataWithPrediction = prepareChartDataWithPrediction();

    // ✅ ИСПРАВЛЕНО: Функция для создания опций графика с предсказанием в той же серии
    const createChartOptions = (title, dataKey, color, gradientColor) => {
        const data = chartDataWithPrediction[dataKey];
        const years = chartDataWithPrediction.years;

        // ✅ КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Создаем одну серию, но с разными стилями для предсказанной части
        const historicalDataLength = chartData.years.length;

        // Подготавливаем данные для отображения
        const seriesData = data.map((value, index) => {
            const isPredicted = showPrediction && predictedData && index >= historicalDataLength;

            return {
                value: value,
                itemStyle: isPredicted ? {
                    color: '#f59e0b', // Оранжевый цвет для предсказанной точки
                    borderWidth: 3,
                    borderColor: '#ffffff',
                    shadowBlur: 10,
                    shadowColor: '#f59e0b'
                } : {
                    color: color // Обычный цвет для исторических данных
                },
                symbol: isPredicted ? 'diamond' : 'circle', // Разные символы
                symbolSize: isPredicted ? 12 : 8
            };
        });

        // ✅ Создаем точки соединения для плавного перехода
        const lineStyle = {
            width: 3,
            color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: []
            }
        };

        // Если показываем предсказание, создаем градиент
        if (showPrediction && predictedData && data.length > historicalDataLength) {
            const historicalPercent = (historicalDataLength - 1) / (data.length - 1);
            lineStyle.color.colorStops = [
                { offset: 0, color: color },
                { offset: historicalPercent, color: color },
                { offset: historicalPercent + 0.01, color: '#f59e0b' },
                { offset: 1, color: '#f59e0b' }
            ];
        } else {
            lineStyle.color = color;
        }

        const series = [{
            name: title.replace(' по годам', ''),
            data: seriesData,
            type: 'line',
            smooth: true,
            lineStyle: lineStyle,
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: gradientColor
                    }, {
                        offset: 1, color: gradientColor.replace('0.3', '0.05')
                    }]
                }
            },
            // ✅ Добавляем маркировку для предсказанной точки
            markPoint: showPrediction && predictedData ? {
                data: [{
                    coord: [predictedData.year, data[data.length - 1]],
                    symbol: 'pin',
                    symbolSize: 40,
                    itemStyle: {
                        color: '#f59e0b'
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: 'Прогноз',
                        color: '#f59e0b',
                        fontWeight: 'bold',
                        fontSize: 12
                    }
                }]
            } : undefined
        }];

        return {
            title: {
                text: title,
                left: 'center',
                textStyle: {
                    fontSize: isMobile ? 16 : 18,
                    fontWeight: 'bold',
                    color: 'rgba(255, 255, 255, 0.9)'
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                textStyle: {
                    color: 'white'
                },
                formatter: (params) => {
                    if (!params || params.length === 0) return '';

                    const param = params[0];
                    const year = param.axisValue;
                    const value = param.value.value || param.value;
                    const isPredicted = showPrediction && predictedData && year == predictedData.year;

                    const prefix = isPredicted ? '🔮 Прогноз на ' : '';
                    return `${prefix}${year}<br/>${param.seriesName}: ${value.toLocaleString('ru-RU')} ₽`;
                }
            },
            legend: {
                show: false // Убираем легенду, так как у нас одна серия
            },
            xAxis: {
                type: 'category',
                data: years,
                axisLabel: {
                    fontSize: isMobile ? 10 : 12,
                    color: 'rgba(255, 255, 255, 0.8)',
                    // ✅ Выделяем предсказанный год
                    formatter: (value) => {
                        const isPredicted = showPrediction && predictedData && value == predictedData.year;
                        return isPredicted ? `${value}*` : value;
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.3)'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: (value) => {
                        if (value >= 1000000000) {
                            return `${(value / 1000000000).toFixed(1)}млрд ₽`;
                        } else if (value >= 1000000) {
                            return `${(value / 1000000).toFixed(1)}млн ₽`;
                        } else if (value >= 1000) {
                            return `${(value / 1000).toFixed(1)}тыс ₽`;
                        }
                        return `${value} ₽`;
                    },
                    fontSize: isMobile ? 10 : 12,
                    color: '#ffffff',
                    fontWeight: 'bold'
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
            series: series,
            grid: {
                left: isMobile ? '20%' : '15%',
                right: isMobile ? '10%' : '5%',
                top: '15%',
                bottom: '15%'
            }
        };
    };

    // Настройки графика выручки
    const revenueOptions = createChartOptions(
        'Выручка по годам',
        'revenue',
        '#6366f1',
        'rgba(99, 102, 241, 0.3)'
    );

    // Настройки графика прибыли
    const profitOptions = createChartOptions(
        'Чистая прибыль по годам',
        'profit',
        '#10b981',
        'rgba(16, 185, 129, 0.3)'
    );

    const handlePredictionToggle = () => {
        console.log('🔮 Переключение предсказания:', !showPrediction);
        setShowPrediction(!showPrediction);
    };

    const getConfidenceText = (confidence) => {
        if (!confidence) return 'Неизвестно';
        if (confidence >= 0.8) return 'Высокая';
        if (confidence >= 0.6) return 'Средняя';
        if (confidence >= 0.4) return 'Ниже средней';
        return 'Низкая';
    };

    const getConfidenceColor = (confidence) => {
        if (!confidence) return '#6b7280';
        if (confidence >= 0.8) return '#10b981';
        if (confidence >= 0.6) return '#f59e0b';
        if (confidence >= 0.4) return '#f97316';
        return '#ef4444';
    };

    return (
        <div>
            {/* Контролы для предсказания */}
            {predictedData && (
                <>
                    <ControlsContainer>
                        <PredictionButton
                            active={showPrediction}
                            onClick={handlePredictionToggle}
                            icon={showPrediction ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        >
                            {showPrediction ? 'Скрыть прогноз' : 'Показать прогноз на ' + predictedData.year}
                        </PredictionButton>
                    </ControlsContainer>

                    {/* Информация о предсказании */}
                    {showPrediction && (
                        <PredictionAlert
                            message={`Прогноз на ${predictedData.year} год`}
                            description={
                                <Space direction="vertical" size="small">
                                    <Text style={{ color: 'rgba(251, 191, 36, 0.9)', fontSize: '12px' }}>
                                        * Прогнозные значения отмечены оранжевым цветом и символом ромба
                                    </Text>
                                </Space>
                            }
                            type="warning"
                            icon={<InfoCircleOutlined />}
                            showIcon
                        />
                    )}
                </>
            )}

            {/* Графики */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <GlassChartCard>
                        <ReactECharts
                            option={revenueOptions}
                            style={{ height: isMobile ? '300px' : '400px' }}
                            opts={{ renderer: 'canvas' }}
                        />
                    </GlassChartCard>
                </Col>

                <Col xs={24} lg={12}>
                    <GlassChartCard>
                        <ReactECharts
                            option={profitOptions}
                            style={{ height: isMobile ? '300px' : '400px' }}
                            opts={{ renderer: 'canvas' }}
                        />
                    </GlassChartCard>
                </Col>
            </Row>
        </div>
    );
};

export default FinancialCharts;