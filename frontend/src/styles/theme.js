import { theme } from 'antd';

export const customTheme = {
    token: {
        // Цветовая схема в стиле Eleven Labs
        colorPrimary: '#6366f1', // Индиго
        colorSuccess: '#10b981',
        colorWarning: '#f59e0b',
        colorError: '#ef4444',
        colorInfo: '#3b82f6',

        // Типографика
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: 16,
        fontSizeHeading1: 48,
        fontSizeHeading2: 32,
        fontSizeHeading3: 24,

        // Отступы и размеры
        borderRadius: 12,
        controlHeight: 48,
        paddingLG: 32,
        marginLG: 32,

        // Цвета фона
        colorBgContainer: '#ffffff',
        colorBgLayout: '#fafbfc',
        colorBgElevated: '#ffffff',

        // Тени
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        boxShadowSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    components: {
        Button: {
            borderRadius: 12,
            fontWeight: 500,
        },
        Card: {
            borderRadius: 16,
            paddingLG: 24,
        },
        Input: {
            borderRadius: 12,
            paddingBlock: 12,
        },
        Table: {
            borderRadius: 12,
        },
    },
};