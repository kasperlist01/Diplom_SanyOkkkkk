import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const GlassResult = styled(Result)`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    padding: 48px;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);

    .ant-result-title {
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .ant-result-subtitle {
        color: rgba(255, 255, 255, 0.8);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .ant-result-icon {
        .anticon {
            color: rgba(255, 255, 255, 0.6);
        }
    }
`;

const GlassButton = styled(Button)`
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: white;
    backdrop-filter: blur(10px);
    border-radius: 12px;
    font-weight: 500;
    height: 44px;
    padding: 0 24px;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(99, 102, 241, 0.3);
        border-color: rgba(99, 102, 241, 0.4);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
    }

    &:focus {
        background: rgba(99, 102, 241, 0.3);
        border-color: rgba(99, 102, 241, 0.4);
        color: white;
    }
`;

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Container>
            <GlassResult
                status="404"
                title="404"
                subTitle="Извините, страница не найдена"
                extra={
                    <GlassButton
                        size="large"
                        onClick={() => navigate('/')}
                    >
                        На главную
                    </GlassButton>
                }
            />
        </Container>
    );
};

export default NotFoundPage;