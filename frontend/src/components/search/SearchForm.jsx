import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Typography, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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

    &:hover {
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

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
        background: linear-gradient(135deg, #5b5fd8 0%, #7c3aed 50%, #9333ea 100%);

        &::before {
            left: 100%;
        }
    }

    &:focus {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
        background: linear-gradient(135deg, #5b5fd8 0%, #7c3aed 50%, #9333ea 100%);
    }

    &:active {
        transform: translateY(0);
    }

    &.ant-btn-loading {
        &::before {
            display: none;
        }
    }

    @media (max-width: 768px) {
        height: 48px;
        font-size: 14px;
        padding: 0 24px;
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

    &:hover .ant-select-selector {
        background: rgba(255, 255, 255, 0.2) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
    }

    &.ant-select-focused .ant-select-selector {
        background: rgba(255, 255, 255, 0.2) !important;
        border-color: rgba(99, 102, 241, 0.5) !important;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
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

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    &:focus {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
    }

    @media (max-width: 768px) {
        height: 48px;
    }
`;

const SearchForm = ({ onSearch, loading, initialValues, initialSearchType }) => {
    const [form] = Form.useForm();
    const [searchType, setSearchType] = useState(initialSearchType || 'universal');

    // Восстанавливаем значения формы при загрузке компонента
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
        if (initialSearchType) {
            setSearchType(initialSearchType);
            form.setFieldsValue({ searchType: initialSearchType });
        }
    }, [initialValues, initialSearchType, form]);

    const handleSubmit = (values) => {
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

        console.log('Отправляем параметры поиска:', filteredValues);

        if (Object.keys(filteredValues).length > 0) {
            onSearch(filteredValues, searchType);
        }
    };

    const handleReset = () => {
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
                            />
                        </StyledFormItem>
                    </Col>
                </Row>
            )}

            <Row justify="center" gutter={[16, 0]} style={{ marginTop: 16 }}>
                <Col>
                    <SearchButton
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SearchOutlined />}
                        size="large"
                    >
                        Найти предприятия
                    </SearchButton>
                </Col>
                <Col>
                    <ResetButton
                        onClick={handleReset}
                        size="large"
                    >
                        Очистить
                    </ResetButton>
                </Col>
            </Row>
        </StyledForm>
    );
};

export default SearchForm;