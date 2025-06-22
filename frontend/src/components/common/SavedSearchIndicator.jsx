import React from 'react';
import { Alert } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';

const GlassAlert = styled(Alert)`
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    margin-bottom: 16px;

    .ant-alert-message {
        color: #bbf7d0;
    }

    .ant-alert-description {
        color: rgba(187, 247, 208, 0.8);
    }

    .ant-alert-icon {
        color: #6ee7b7;
    }
`;

const SavedSearchIndicator = ({ searchParams, searchType }) => {
    const getSearchDescription = () => {
        if (searchType === 'name' && searchParams?.name) {
            return `Поиск по названию: "${searchParams.name}"`;
        } else if (searchType === 'okved' && searchParams?.okved) {
            return `Поиск по ОКВЭД: "${searchParams.okved}"`;
        } else if (searchType === 'universal') {
            const params = [];
            if (searchParams?.name) params.push(`название: "${searchParams.name}"`);
            if (searchParams?.inn) params.push(`ИНН: "${searchParams.inn}"`);
            if (searchParams?.okved) params.push(`ОКВЭД: "${searchParams.okved}"`);
            if (searchParams?.region) params.push(`регион: "${searchParams.region}"`);

            return `Универсальный поиск: ${params.join(', ')}`;
        }
        return 'Сохраненный поиск';
    };

    return (
        <GlassAlert
            message="Показаны результаты предыдущего поиска"
            description={getSearchDescription()}
            type="success"
            icon={<HistoryOutlined />}
            showIcon
            closable
        />
    );
};

export default SavedSearchIndicator;