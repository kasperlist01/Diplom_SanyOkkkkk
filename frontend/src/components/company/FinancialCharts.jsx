import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import ReactECharts from 'echarts-for-react';
import styled from '@emotion/styled';
import { useResponsive } from '../../hooks/useResponsive';

const { Title } = Typography;

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

const FinancialCharts = ({ chartData }) => {
    const { isMobile } = useResponsive();

    if (!chartData || !chartData.years || chartData.years.length === 0) {
        return (
            <GlassChartCard>
                <EmptyStateTitle level={4}>
                    Финансовые данные отсутствуют
                </EmptyStateTitle>
            </GlassChartCard>
        );
    }

    // ИСПРАВЛЕНИЕ: Данные уже корректно обработаны в бэкенде (умножены на 1000)
    const processedRevenueData = chartData.revenue;
    const processedProfitData = chartData.net_profit;

    // Настройки графика выручки
    const revenueOptions = {
        title: {
            text: 'Выручка по годам',
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
                const value = params[0].value;
                return `${params[0].name}<br/>Выручка: ${value.toLocaleString('ru-RU')} ₽`;
            }
        },
        xAxis: {
            type: 'category',
            data: chartData.years,
            axisLabel: {
                fontSize: isMobile ? 10 : 12,
                color: 'rgba(255, 255, 255, 0.8)'
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
        series: [{
            data: processedRevenueData,
            type: 'line',
            smooth: true,
            lineStyle: {
                width: 3,
                color: '#6366f1'
            },
            itemStyle: {
                color: '#6366f1'
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(99, 102, 241, 0.3)'
                    }, {
                        offset: 1, color: 'rgba(99, 102, 241, 0.05)'
                    }]
                }
            }
        }],
        grid: {
            left: isMobile ? '20%' : '15%',
            right: isMobile ? '10%' : '5%',
            top: '15%',
            bottom: '15%'
        }
    };

    // Настройки графика прибыли
    const profitOptions = {
        ...revenueOptions,
        title: {
            ...revenueOptions.title,
            text: 'Чистая прибыль по годам'
        },
        tooltip: {
            ...revenueOptions.tooltip,
            formatter: (params) => {
                const value = params[0].value;
                const isPositive = value >= 0;
                return `${params[0].name}<br/>Прибыль: ${isPositive ? '+' : ''}${value.toLocaleString('ru-RU')} ₽`;
            }
        },
        yAxis: {
            ...revenueOptions.yAxis,
            axisLabel: {
                ...revenueOptions.yAxis.axisLabel,
                formatter: (value) => {
                    const absValue = Math.abs(value);
                    const sign = value < 0 ? '-' : '';

                    if (absValue >= 1000000000) {
                        return `${sign}${(absValue / 1000000000).toFixed(1)}млрд ₽`;
                    } else if (absValue >= 1000000) {
                        return `${sign}${(absValue / 1000000).toFixed(1)}млн ₽`;
                    } else if (absValue >= 1000) {
                        return `${sign}${(absValue / 1000).toFixed(1)}тыс ₽`;
                    }
                    return `${sign}${absValue} ₽`;
                }
            }
        },
        series: [{
            ...revenueOptions.series[0],
            data: processedProfitData,
            lineStyle: {
                width: 3,
                color: '#10b981'
            },
            itemStyle: {
                color: '#10b981'
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(16, 185, 129, 0.3)'
                    }, {
                        offset: 1, color: 'rgba(16, 185, 129, 0.05)'
                    }]
                }
            }
        }]
    };

    return (
        <div>
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