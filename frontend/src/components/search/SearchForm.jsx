import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Typography, Select } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';

const { Title } = Typography;
const { Option } = Select;

// Упрощенная стилизованная форма без двойной подложки
const StyledForm = styled(Form)`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
    position: relative;

    @media (max-width: 768px) {
        padding: 24px;
        border-radius: 20px;
    }
`;

const FormTitle = styled(Title)`
    &.ant-typography {
        color: white;
        text-align: center;
        margin-bottom: 32px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

        @media (max-width: 768px) {
            font-size: 24px !important;
            margin-bottom: 24px;
        }
    }
`;

const StyledFormItem = styled(Form.Item)`
    .ant-form-item-label > label {
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .ant-form-item-explain-error {
        color: #fecaca;
    }
`;

const GlassInput = styled(Input)`
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    color: white;
    font-size: 16px;
    height: 48px;
    transition: all 0.3s ease;

    &::placeholder {
        color: rgba(255, 255, 255, 0.6);
    }

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
    }

    &:focus {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(99, 102, 241, 0.5);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        outline: none;
    }

    &.ant-input-status-error {
        border-color: rgba(239, 68, 68, 0.5);

        &:focus {
            border-color: rgba(239, 68, 68, 0.5);
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }
    }

    /* ✅ Стили для отключенного состояния */
    &:disabled {
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        color: rgba(255, 255, 255, 0.5) !important;
        cursor: not-allowed !important;
    }
`;

const SearchButton = styled(Button)`
    height: 56px;
    border-radius: 16px;
    font-weight: 600;
    font-size: 16px;
    padding: 0 32px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    border: none;
    color: white;
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    min-width: 200px;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }

    &:hover:not(.ant-btn-loading):not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
        background: linear-gradient(135deg, #5b5fd8 0%, #7c3aed 50%, #9333ea 100%);

        &::before {
            left: 100%;
        }
    }

    &:focus:not(.ant-btn-loading):not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
        background: linear-gradient(135deg, #5b5fd8 0%, #7c3aed 50%, #9333ea 100%);
    }

    &:active:not(.ant-btn-loading):not(:disabled) {
        transform: translateY(0);
    }

    /* ✅ ИСПРАВЛЕННЫЕ стили для состояния загрузки */
    &.ant-btn-loading {
        cursor: not-allowed !important;
        background: linear-gradient(135deg, #4c4fb8 0%, #6b46c1 50%, #7c2d92 100%) !important;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2) !important;
        transform: none !important;

        &::before {
            display: none;
        }

        /* ✅ Анимация пульсации при загрузке */
        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            animation: shimmer 2s infinite;
        }

        .ant-btn-loading-icon {
            margin-right: 8px;

            .anticon {
                color: white !important;
                font-size: 16px;
            }
        }
    }

    /* ✅ Стили для отключенного состояния (не загрузка) */
    &:disabled:not(.ant-btn-loading) {
        background: rgba(99, 102, 241, 0.3) !important;
        box-shadow: none !important;
        cursor: not-allowed;
        transform: none !important;
        color: rgba(255, 255, 255, 0.6) !important;
    }

    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    @media (max-width: 768px) {
        height: 48px;
        font-size: 14px;
        padding: 0 24px;
        min-width: 160px;
    }
`;

const GlassSelect = styled(Select)`
    .ant-select-selector {
        background: rgba(255, 255, 255, 0.15) !important;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 16px !important;
        color: white !important;
        height: 48px !important;

        .ant-select-selection-placeholder {
            color: rgba(255, 255, 255, 0.6) !important;
        }

        .ant-select-selection-item {
            color: white !important;
            line-height: 46px !important;
        }
    }

    &:hover:not(.ant-select-disabled) .ant-select-selector {
        background: rgba(255, 255, 255, 0.2) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
    }

    &.ant-select-focused .ant-select-selector {
        background: rgba(255, 255, 255, 0.2) !important;
        border-color: rgba(99, 102, 241, 0.5) !important;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
    }

    /* ✅ Стили для отключенного состояния */
    &.ant-select-disabled .ant-select-selector {
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        color: rgba(255, 255, 255, 0.5) !important;
        cursor: not-allowed !important;
    }
`;

const ResetButton = styled(Button)`
    height: 56px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    &:focus:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
    }

    /* ✅ Стили для отключенного состояния */
    &:disabled {
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        color: rgba(255, 255, 255, 0.3) !important;
        cursor: not-allowed !important;
        transform: none !important;
    }

    @media (max-width: 768px) {
        height: 48px;
    }
`;

// ✅ НОВЫЙ стилизованный контейнер для кнопок с адаптивными отступами
const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;

    @media (max-width: 576px) {
        flex-direction: column;
        align-items: center;
        gap: 16px; /* ✅ Увеличенный отступ между кнопками на мобильных */
        
        button {
            width: 100%;
            max-width: 280px; /* ✅ Ограничиваем максимальную ширину кнопок */
        }
    }

    @media (min-width: 577px) and (max-width: 768px) {
        gap: 12px; /* ✅ Средний отступ для планшетов */
    }
`;

const SearchForm = ({ onSearch, loading, initialValues, initialSearchType }) => {
    const [form] = Form.useForm();
    const [searchType, setSearchType] = useState(initialSearchType || 'universal');

    // ✅ Добавляем логирование props
    console.log('📝 SearchForm: Props:', {
        loading,
        initialValues,
        initialSearchType,
        searchType
    });

    // Восстанавливаем значения формы при загрузке компонента
    useEffect(() => {
        if (initialValues) {
            console.log('🔄 SearchForm: Восстанавливаем значения формы:', initialValues);
            form.setFieldsValue(initialValues);
        }
        if (initialSearchType) {
            console.log('🔄 SearchForm: Восстанавливаем тип поиска:', initialSearchType);
            setSearchType(initialSearchType);
            form.setFieldsValue({ searchType: initialSearchType });
        }
    }, [initialValues, initialSearchType, form]);

    const handleSubmit = (values) => {
        console.log('📤 SearchForm: Отправка формы:', values);

        // Фильтруем пустые значения и обрезаем пробелы
        const filteredValues = Object.entries(values)
            .filter(([key, value]) => key !== 'searchType' && value && value.trim())
            .reduce((acc, [key, value]) => {
                let processedValue = value.trim();

                // Преобразуем название компании в заглавные буквы
                if (key === 'name') {
                    processedValue = processedValue.toUpperCase();
                }

                return {
                    ...acc,
                    [key]: processedValue
                };
            }, {});

        console.log('✅ SearchForm: Отправляем параметры поиска:', filteredValues);

        if (Object.keys(filteredValues).length > 0) {
            onSearch(filteredValues, searchType);
        } else {
            console.log('⚠️ SearchForm: Нет параметров для поиска');
        }
    };

    const handleReset = () => {
        console.log('🧹 SearchForm: Сброс формы');
        form.resetFields();
        setSearchType('universal');
    };

    // Обработчик изменения поля названия для автоматического преобразования в заглавные буквы
    const handleNameChange = (e) => {
        const value = e.target.value;
        const upperValue = value.toUpperCase();
        form.setFieldsValue({ name: upperValue });
    };

    const handleSearchTypeChange = (value) => {
        console.log('🔄 SearchForm: Смена типа поиска:', value);
        setSearchType(value);
        // Очищаем форму при смене типа поиска, кроме случая когда восстанавливаем из контекста
        if (!initialSearchType || value !== initialSearchType) {
            form.resetFields(['name', 'inn', 'okved', 'region']);
        }
    };

    return (
        <StyledForm
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
        >
            <FormTitle level={3}>Поиск предприятий</FormTitle>

            <Row gutter={[24, 0]} style={{ marginBottom: 16 }}>
                <Col xs={24}>
                    <StyledFormItem
                        name="searchType"
                        label="Тип поиска"
                        initialValue={searchType}
                    >
                        <GlassSelect
                            onChange={handleSearchTypeChange}
                            size="large"
                            value={searchType}
                            disabled={loading} // ✅ Отключаем при загрузке
                        >
                            <Option value="universal">Универсальный поиск</Option>
                            <Option value="name">Только по названию</Option>
                            <Option value="okved">Только по ОКВЭД</Option>
                        </GlassSelect>
                    </StyledFormItem>
                </Col>
            </Row>

            {searchType === 'universal' && (
                <Row gutter={[24, 0]}>
                    <Col xs={24} md={8}>
                        <StyledFormItem
                            name="name"
                            label="Название предприятия"
                        >
                            <GlassInput
                                placeholder="Введите название"
                                onChange={handleNameChange}
                                disabled={loading} // ✅ Отключаем при загрузке
                            />
                        </StyledFormItem>
                    </Col>

                    <Col xs={24} md={6}>
                        <StyledFormItem
                            name="inn"
                            label="ИНН"
                        >
                            <GlassInput
                                placeholder="Введите ИНН"
                                maxLength={12}
                                disabled={loading} // ✅ Отключаем при загрузке
                            />
                        </StyledFormItem>
                    </Col>

                    <Col xs={24} md={6}>
                        <StyledFormItem
                            name="okved"
                            label="Код ОКВЭД"
                        >
                            <GlassInput
                                placeholder="Например: 62.01"
                                disabled={loading} // ✅ Отключаем при загрузке
                            />
                        </StyledFormItem>
                    </Col>

                    <Col xs={24} md={4}>
                        <StyledFormItem
                            name="region"
                            label="Регион"
                        >
                            <GlassInput
                                placeholder="Код региона"
                                disabled={loading} // ✅ Отключаем при загрузке
                            />
                        </StyledFormItem>
                    </Col>
                </Row>
            )}

            {searchType === 'name' && (
                <Row gutter={[24, 0]}>
                    <Col xs={24}>
                        <StyledFormItem
                            name="name"
                            label="Название предприятия"
                            rules={[{ required: true, message: 'Введите название для поиска' }]}
                        >
                            <GlassInput
                                placeholder="Введите название компании"
                                size="large"
                                onChange={handleNameChange}
                                disabled={loading} // ✅ Отключаем при загрузке
                            />
                        </StyledFormItem>
                    </Col>
                </Row>
            )}

            {searchType === 'okved' && (
                <Row gutter={[24, 0]}>
                    <Col xs={24}>
                        <StyledFormItem
                            name="okved"
                            label="Код ОКВЭД"
                            rules={[{ required: true, message: 'Введите код ОКВЭД для поиска' }]}
                        >
                            <GlassInput
                                placeholder="Введите код ОКВЭД (например: 62.01)"
                                size="large"
                                disabled={loading} // ✅ Отключаем при загрузке
                            />
                        </StyledFormItem>
                    </Col>
                </Row>
            )}

            {/* ✅ ИСПРАВЛЕНО: Используем новый ButtonContainer вместо Row/Col */}
            <ButtonContainer>
                <SearchButton
                    type="primary"
                    htmlType="submit"
                    loading={loading} // ✅ Используем встроенный loading
                    icon={!loading ? <SearchOutlined /> : undefined} // ✅ Показываем иконку только когда не загружается
                    size="large"
                    disabled={loading} // ✅ Отключаем кнопку при загрузке
                >
                    {loading ? 'Поиск...' : 'Найти предприятия'} {/* ✅ Динамический текст */}
                </SearchButton>

                <ResetButton
                    onClick={handleReset}
                    size="large"
                    disabled={loading} // ✅ Отключаем при загрузке
                >
                    Очистить
                </ResetButton>
            </ButtonContainer>
        </StyledForm>
    );
};

export default SearchForm;