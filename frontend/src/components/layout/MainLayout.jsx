import React from 'react';
import { Layout } from 'antd';
import styled from '@emotion/styled';

const { Content } = Layout;

const StyledLayout = styled(Layout)`
    min-height: 100vh;
    background: linear-gradient(135deg,
    #3a4db8 0%,
    #9c4bb5 50%,
    #2d7fb0 75%,
    #2e619f 100%
    );
    position: relative;
    overflow-x: hidden;

    &::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at bottom left, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(255, 255, 255, 0.06) 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
        animation: waveMove 25s ease-in-out infinite;
    }

    &::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5 L95 50 L50 95 L5 50 Z' fill='none' stroke='%23ffffff' stroke-width='0.4' opacity='0.08'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='%23ffffff' stroke-width='0.25' opacity='0.06'/%3E%3C/svg%3E");
        background-size: 150px 150px;
        pointer-events: none;
        z-index: 0;
        animation: patternFloat 35s linear infinite;
    }

    @keyframes waveMove {
        0%, 100% {
            background: radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(255, 255, 255, 0.06) 0%, transparent 50%);
        }
        25% {
            background: radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.06) 0%, transparent 50%);
        }
        50% {
            background: radial-gradient(ellipse at bottom right, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.06) 0%, transparent 50%);
        }
        75% {
            background: radial-gradient(ellipse at bottom left, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(255, 255, 255, 0.06) 0%, transparent 50%);
        }
    }

    @keyframes patternFloat {
        0% {
            transform: translateX(0) translateY(0);
        }
        33% {
            transform: translateX(30px) translateY(-20px);
        }
        66% {
            transform: translateX(-20px) translateY(30px);
        }
        100% {
            transform: translateX(0) translateY(0);
        }
    }
`;

const StyledContent = styled(Content)`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const MainLayout = ({ children }) => {
    return (
        <StyledLayout>
            <StyledContent>
                {children}
            </StyledContent>
        </StyledLayout>
    );
};

export default MainLayout;