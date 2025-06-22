import React from 'react';
import { Card, Typography, Button } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';

const { Title, Text } = Typography;

const GlassErrorCard = styled(Card)`
    background: rgba(239, 68, 68, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 24px;
    text-align: center;
    padding: 48px 24px;
    box-shadow: 0 25px 45px rgba(239, 68, 68, 0.1);
    overflow: hidden;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
        pointer-events: none;
    }

    .ant-card-body {
        position: relative;
        z-index: 1;
    }

    .anticon {
        color: #fecaca;
        font-size: 48px;
        margin-bottom: 16px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
`;

const ErrorTitle = styled(Title)`
    &.ant-typography {
        color: #fecaca;
        margin-bottom: 8px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
`;

const ErrorText = styled(Text)`
    &.ant-typography {
        color: rgba(254, 202, 202, 0.9);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
`;

const GlassRetryButton = styled(Button)`
    margin-top: 16px;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fecaca;
    backdrop-filter: blur(10px);
    border-radius: 12px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.3);
        border-color: rgba(239, 68, 68, 0.4);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
    }

    &:focus {
        background: rgba(239, 68, 68, 0.3);
        border-color: rgba(239, 68, 68, 0.4);
        color: white;
    }
`;

const ErrorMessage = ({ message, onRetry }) => {
    return (
        <GlassErrorCard>
            <ExclamationCircleOutlined />
            <ErrorTitle level={4}>
                Произошла ошибка
            </ErrorTitle>
            <ErrorText>
                {message || 'Что-то пошло не так. Попробуйте еще раз.'}
            </ErrorText>
            {onRetry && (
                <GlassRetryButton
                    icon={<ReloadOutlined />}
                    onClick={onRetry}
                >
                    Попробовать снова
                </GlassRetryButton>
            )}
        </GlassErrorCard>
    );
};

export default ErrorMessage;