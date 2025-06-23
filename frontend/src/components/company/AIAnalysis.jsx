import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Alert, Typography, Spin } from 'antd';
import { RobotOutlined, PlayCircleOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { Title, Text } = Typography;

const GlassAnalysisCard = styled(Card)`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
    min-height: 400px;

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
        max-height: 80vh;
        overflow-y: auto;

        @media (max-width: 768px) {
            padding: 24px;
            max-height: 70vh;
        }
    }

    /* Кастомные скроллбары */
    .ant-card-body::-webkit-scrollbar {
        width: 8px;
    }

    .ant-card-body::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    .ant-card-body::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
    }

    .ant-card-body::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
    }
`;

const AnalysisHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const AnalysisTitle = styled(Title)`
    &.ant-typography {
        color: white;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;

        .anticon {
            color: #fbbf24;
        }

        @media (max-width: 768px) {
            font-size: 20px !important;
        }
    }
`;

const ControlButtons = styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: stretch;

        button {
            flex: 1;
        }
    }
`;

const AIButton = styled(Button)`
    background: ${props => {
        if (props.variant === 'start') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        if (props.variant === 'stop') return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        return 'rgba(255, 255, 255, 0.1)';
    }};
    border: 1px solid ${props => {
        if (props.variant === 'start') return '#10b981';
        if (props.variant === 'stop') return '#ef4444';
        return 'rgba(255, 255, 255, 0.2)';
    }};
    color: white;
    backdrop-filter: blur(10px);
    border-radius: 12px;
    font-weight: 600;
    height: 44px;
    padding: 0 20px;
    transition: all 0.3s ease;
    box-shadow: ${props => {
        if (props.variant === 'start') return '0 8px 25px rgba(16, 185, 129, 0.4)';
        if (props.variant === 'stop') return '0 8px 25px rgba(239, 68, 68, 0.4)';
        return '0 4px 15px rgba(255, 255, 255, 0.2)';
    }};

    &:hover:not(:disabled) {
        background: ${props => {
            if (props.variant === 'start') return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            if (props.variant === 'stop') return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            return 'rgba(255, 255, 255, 0.2)';
        }};
        transform: translateY(-2px);
        box-shadow: ${props => {
            if (props.variant === 'start') return '0 12px 35px rgba(16, 185, 129, 0.5)';
            if (props.variant === 'stop') return '0 12px 35px rgba(239, 68, 68, 0.5)';
            return '0 8px 25px rgba(255, 255, 255, 0.3)';
        }};
    }

    &:focus {
        background: ${props => {
            if (props.variant === 'start') return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            if (props.variant === 'stop') return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            return 'rgba(255, 255, 255, 0.2)';
        }};
    }

    &:disabled {
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        color: rgba(255, 255, 255, 0.3) !important;
        cursor: not-allowed !important;
        transform: none !important;
        box-shadow: none !important;
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

const AnalysisContent = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    min-height: 300px;
    position: relative;

    @media (max-width: 768px) {
        padding: 16px;
        min-height: 250px;
    }
`;

const MarkdownContent = styled.div`
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.8;
    font-size: 16px;

    h1, h2, h3, h4, h5, h6 {
        color: white;
        margin-top: 32px;
        margin-bottom: 16px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        
        &:first-child {
            margin-top: 0;
        }
    }

    h1 { font-size: 28px; border-bottom: 2px solid rgba(255, 255, 255, 0.2); padding-bottom: 8px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; color: #fbbf24; }
    h4 { font-size: 18px; color: #93c5fd; }

    p {
        margin-bottom: 16px;
        text-align: justify;
    }

    ul, ol {
        margin-bottom: 16px;
        padding-left: 24px;
    }

    li {
        margin-bottom: 8px;
    }

    strong {
        color: white;
        font-weight: 600;
    }

    em {
        color: #fbbf24;
        font-style: italic;
    }

    blockquote {
        border-left: 4px solid #6366f1;
        background: rgba(99, 102, 241, 0.1);
        margin: 16px 0;
        padding: 16px 20px;
        border-radius: 8px;
        font-style: italic;
    }

    code {
        background: rgba(255, 255, 255, 0.1);
        color: #fbbf24;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 14px;
    }

    pre {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 16px;
        overflow-x: auto;
        margin: 16px 0;

        code {
            background: none;
            padding: 0;
            color: #e5e7eb;
        }
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        overflow: hidden;

        th, td {
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 12px;
            text-align: left;
        }

        th {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-weight: 600;
        }
    }

    @media (max-width: 768px) {
        font-size: 14px;

        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        h3 { font-size: 18px; }
        h4 { font-size: 16px; }

        ul, ol {
            padding-left: 20px;
        }

        table {
            font-size: 12px;
            
            th, td {
                padding: 8px;
            }
        }
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    gap: 16px;
`;

const LoadingText = styled(Text)`
    &.ant-typography {
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
        text-align: center;
    }
`;

const ErrorAlert = styled(Alert)`
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .ant-alert-message {
        color: #fecaca;
    }

    .ant-alert-description {
        color: rgba(254, 202, 202, 0.8);
    }

    .ant-alert-icon {
        color: #f87171;
    }
`;

const TypingIndicator = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
    
    span {
        width: 8px;
        height: 8px;
        background: #fbbf24;
        border-radius: 50%;
        animation: typing 1.4s ease-in-out infinite both;
        
        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
        &:nth-child(3) { animation-delay: 0s; }
    }

    @keyframes typing {
        0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

const AIAnalysis = ({ company }) => {
    const [analysisContent, setAnalysisContent] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [hasStarted, setHasStarted] = useState(false);
    const eventSourceRef = useRef(null);
    const contentRef = useRef(null);

    // Автоскролл при добавлении нового контента
    useEffect(() => {
        if (contentRef.current && isAnalyzing) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [analysisContent, isAnalyzing]);

    const startAnalysis = async () => {
        if (!company?.inn) {
            setError('Не удалось получить ИНН компании');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysisContent('');
        setHasStarted(true);

        try {
            // Создаем EventSource для получения потоковых данных
            const eventSource = new EventSource(
                `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/companies/${company.inn}/ai-analysis`
            );

            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.error) {
                        setError(data.content);
                        setIsAnalyzing(false);
                        eventSource.close();
                        return;
                    }

                    if (data.done) {
                        setIsAnalyzing(false);
                        eventSource.close();
                        return;
                    }

                    if (data.content) {
                        setAnalysisContent(prev => prev + data.content);
                    }
                } catch (e) {
                    console.error('Ошибка парсинга данных:', e);
                }
            };

            eventSource.onerror = (event) => {
                console.error('EventSource error:', event);
                setError('Ошибка соединения с сервером. Попробуйте позже.');
                setIsAnalyzing(false);
                eventSource.close();
            };

        } catch (err) {
            console.error('Ошибка запуска анализа:', err);
            setError('Не удалось запустить анализ. Попробуйте позже.');
            setIsAnalyzing(false);
        }
    };

    const stopAnalysis = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setIsAnalyzing(false);
    };

    const resetAnalysis = () => {
        stopAnalysis();
        setAnalysisContent('');
        setError(null);
        setHasStarted(false);
    };

    // Очистка при размонтировании компонента
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const renderMarkdown = (content) => {
        return (
            <ReactMarkdown
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={tomorrow}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        );
    };

    return (
        <GlassAnalysisCard>
            <AnalysisHeader>
                <AnalysisTitle level={4}>
                    <RobotOutlined />
                    ИИ-анализ компании
                    {isAnalyzing && (
                        <TypingIndicator>
                            <span></span>
                            <span></span>
                            <span></span>
                        </TypingIndicator>
                    )}
                </AnalysisTitle>

                <ControlButtons>
                    {!hasStarted || (!isAnalyzing && !analysisContent) ? (
                        <AIButton
                            variant="start"
                            icon={<PlayCircleOutlined />}
                            onClick={startAnalysis}
                            disabled={isAnalyzing}
                            size="large"
                        >
                            Запустить анализ
                        </AIButton>
                    ) : (
                        <>
                            {isAnalyzing ? (
                                <AIButton
                                    variant="stop"
                                    icon={<StopOutlined />}
                                    onClick={stopAnalysis}
                                    size="large"
                                >
                                    Остановить
                                </AIButton>
                            ) : (
                                <AIButton
                                    icon={<ReloadOutlined />}
                                    onClick={resetAnalysis}
                                    size="large"
                                >
                                    Новый анализ
                                </AIButton>
                            )}
                        </>
                    )}
                </ControlButtons>
            </AnalysisHeader>

            <AnalysisContent ref={contentRef}>
                {error && (
                    <ErrorAlert
                        message="Ошибка анализа"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                {!hasStarted && !error && (
                    <LoadingContainer>
                        <RobotOutlined style={{ fontSize: 48, color: '#fbbf24' }} />
                        <LoadingText>
                            Нажмите "Запустить анализ" для получения детального ИИ-анализа компании
                        </LoadingText>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', textAlign: 'center' }}>
                            Анализ включает финансовое состояние, SWOT-анализ, прогнозы и рекомендации
                        </Text>
                    </LoadingContainer>
                )}

                {isAnalyzing && !analysisContent && (
                    <LoadingContainer>
                        <Spin size="large" />
                        <LoadingText>
                            ИИ анализирует данные компании...
                        </LoadingText>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                            Это может занять несколько минут
                        </Text>
                    </LoadingContainer>
                )}

                {analysisContent && (
                    <MarkdownContent>
                        {renderMarkdown(analysisContent)}
                        {isAnalyzing && (
                            <TypingIndicator style={{ marginLeft: 0, marginTop: 8 }}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </TypingIndicator>
                        )}
                    </MarkdownContent>
                )}
            </AnalysisContent>
        </GlassAnalysisCard>
    );
};

export default AIAnalysis;