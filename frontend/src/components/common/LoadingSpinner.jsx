import React from 'react';
import { Spin, Card } from 'antd';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Анимация пульсации
const pulse = keyframes`
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.05);
    }
`;

// Анимация волн
const wave = keyframes`
    0%, 60%, 100% {
        transform: initial;
    }
    30% {
        transform: translateY(-15px);
    }
`;

// Анимация вращения градиента
const gradientRotate = keyframes`
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
`;

// Анимация появления точек
const dotPulse = keyframes`
    0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
`;

// Анимация скелетона
const shimmer = keyframes`
    0% {
        background-position: -468px 0;
    }
    100% {
        background-position: 468px 0;
    }
`;

const GlassLoadingCard = styled(Card)`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    text-align: center;
    padding: 48px 24px;
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
        animation: ${gradientRotate} 3s ease infinite;
        background-size: 400% 400%;
    }

    .ant-card-body {
        position: relative;
        z-index: 1;
    }

    .ant-spin {
        .ant-spin-dot {
            font-size: 32px; /* УВЕЛИЧЕНО с 24px до 32px */
        }

        .ant-spin-dot-item {
            background-color: rgba(255, 255, 255, 0.8);
            width: 12px; /* УВЕЛИЧЕНО с стандартного размера */
            height: 12px; /* УВЕЛИЧЕНО с стандартного размера */
        }
    }
`;

// Компонент для поиска с анимированными точками
const SearchLoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
`;

const SearchIcon = styled.div`
    width: 100px; /* УВЕЛИЧЕНО с 80px до 100px */
    height: 100px; /* УВЕЛИЧЕНО с 80px до 100px */
    border: 4px solid rgba(255, 255, 255, 0.3); /* УВЕЛИЧЕНО с 3px до 4px */
    border-top: 4px solid rgba(99, 102, 241, 0.8); /* УВЕЛИЧЕНО с 3px до 4px */
    border-radius: 50%;
    animation: spin 1s linear infinite;
    position: relative;

    &::before {
        content: '🔍';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 32px; /* УВЕЛИЧЕНО с 24px до 32px */
        animation: ${pulse} 2s ease-in-out infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const DotsContainer = styled.div`
    display: flex;
    gap: 12px; /* УВЕЛИЧЕНО с 8px до 12px */
    align-items: center;
`;

const Dot = styled.div`
    width: 16px; /* УВЕЛИЧЕНО с 12px до 16px */
    height: 16px; /* УВЕЛИЧЕНО с 12px до 16px */
    background: rgba(99, 102, 241, 0.8);
    border-radius: 50%;
    animation: ${dotPulse} 1.4s ease-in-out infinite both;
    animation-delay: ${props => props.delay}s;
`;

const WaveContainer = styled.div`
    display: flex;
    gap: 6px; /* УВЕЛИЧЕНО с 4px до 6px */
    align-items: center;
`;

const WaveBar = styled.div`
    width: 6px; /* УВЕЛИЧЕНО с 4px до 6px */
    height: 50px; /* УВЕЛИЧЕНО с 40px до 50px */
    background: linear-gradient(45deg, #6366f1, #8b5cf6);
    border-radius: 3px; /* УВЕЛИЧЕНО с 2px до 3px */
    animation: ${wave} 1.2s ease-in-out infinite;
    animation-delay: ${props => props.delay}s;
`;

// Компонент скелетона для страницы компании
const SkeletonContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const SkeletonBlock = styled.div`
    height: ${props => props.height || '20px'};
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
    background-size: 200px 100%;
    border-radius: 12px;
    animation: ${shimmer} 1.2s ease-in-out infinite;
    width: ${props => props.width || '100%'};
`;

const SkeletonRow = styled.div`
    display: flex;
    gap: 16px;
    align-items: center;
`;

const SkeletonAvatar = styled.div`
    width: 100px; /* УВЕЛИЧЕНО с 80px до 100px */
    height: 100px; /* УВЕЛИЧЕНО с 80px до 100px */
    border-radius: 50%;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
    background-size: 200px 100%;
    animation: ${shimmer} 1.2s ease-in-out infinite;
`;

const LoadingText = styled.p`
    margin-top: 16px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 18px; /* УВЕЛИЧЕНО с 16px до 18px */
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    font-weight: 500;
`;

// НОВЫЙ стиль для большого спиннера на странице компании
const BigSpinContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 32px;
`;

const BigSpinner = styled.div`
    width: 80px;
    height: 80px;
    border: 6px solid rgba(255, 255, 255, 0.2);
    border-top: 6px solid #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const BigLoadingText = styled.div`
    color: white;
    font-size: 20px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    text-align: center;
`;

// Основной компонент LoadingSpinner
const LoadingSpinner = ({ tip = "Загрузка...", type = "default" }) => {
    // Анимация поиска
    if (type === "search") {
        return (
            <GlassLoadingCard>
                <SearchLoadingContainer>
                    <SearchIcon />
                    <LoadingText>{tip}</LoadingText>
                    <DotsContainer>
                        <Dot delay={0} />
                        <Dot delay={0.2} />
                        <Dot delay={0.4} />
                    </DotsContainer>
                </SearchLoadingContainer>
            </GlassLoadingCard>
        );
    }

    // Анимация загрузки компании со скелетоном
    if (type === "company") {
        return (
            <GlassLoadingCard>
                <SkeletonContainer>
                    <LoadingText>{tip}</LoadingText>

                    {/* Заголовок компании */}
                    <SkeletonRow>
                        <SkeletonAvatar />
                        <div style={{ flex: 1 }}>
                            <SkeletonBlock height="32px" width="60%" />
                            <div style={{ marginTop: '12px' }}>
                                <SkeletonBlock height="16px" width="80%" />
                            </div>
                        </div>
                    </SkeletonRow>

                    {/* Информационные блоки */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '32px' }}>
                        <SkeletonBlock height="60px" />
                        <SkeletonBlock height="60px" />
                        <SkeletonBlock height="60px" />
                        <SkeletonBlock height="60px" />
                    </div>

                    {/* Графики */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
                        <SkeletonBlock height="300px" />
                        <SkeletonBlock height="300px" />
                    </div>

                    {/* Волновая анимация внизу */}
                    <WaveContainer style={{ justifyContent: 'center', marginTop: '24px' }}>
                        {[...Array(8)].map((_, i) => (
                            <WaveBar key={i} delay={i * 0.1} />
                        ))}
                    </WaveContainer>
                </SkeletonContainer>
            </GlassLoadingCard>
        );
    }

    // НОВЫЙ тип: большой спиннер для страницы компании
    if (type === "big") {
        return (
            <GlassLoadingCard>
                <BigSpinContainer>
                    <BigSpinner />
                    <BigLoadingText>{tip}</BigLoadingText>
                </BigSpinContainer>
            </GlassLoadingCard>
        );
    }

    // Стандартная анимация с увеличенным размером
    return (
        <GlassLoadingCard>
            <Spin size="large">
                <div style={{ padding: '60px' }}> {/* УВЕЛИЧЕНО с 50px до 60px */}
                    <LoadingText>{tip}</LoadingText>
                </div>
            </Spin>
        </GlassLoadingCard>
    );
};

export default LoadingSpinner;