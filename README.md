# Company Analytics - Анализ российских предприятий

Веб-приложение для поиска и анализа информации о российских предприятиях с использованием данных из различных источников.

## 🚀 Возможности

- **Универсальный поиск** предприятий по названию, ИНН, ОКВЭД и региону
- **Детальная информация** о компаниях из официальных источников
- **Финансовая аналитика** с интерактивными графиками
- **Сравнение** с похожими компаниями по отрасли
- **Адаптивный дизайн** для всех устройств
- **Интеграция** с внешними API (DataNewton, RusProfile)

## 🛠 Технологический стек

### Backend
- **FastAPI** - современный веб-фреймворк для Python
- **PostgreSQL** - основная база данных
- **SQLAlchemy** - ORM для работы с БД
- **Pydantic** - валидация данных
- **Requests** - HTTP клиент для внешних API
- **BeautifulSoup** - парсинг веб-страниц

### Frontend
- **React** - библиотека для создания пользовательских интерфейсов
- **Ant Design** - UI компоненты
- **React Router** - маршрутизация
- **ECharts** - интерактивные графики
- **Emotion** - CSS-in-JS стилизация
- **Axios** - HTTP клиент

### Инфраструктура
- **Docker & Docker Compose** - контейнеризация
- **PostgreSQL 15** - база данных

## 📁 Структура проекта

```
company-analytics-2/
├── backend/                    # Серверная часть
│   ├── app/
│   │   ├── api/endpoints/     # API эндпоинты
│   │   ├── core/              # Конфигурация и БД
│   │   ├── models/            # Модели данных
│   │   ├── schemas/           # Pydantic схемы
│   │   ├── services/          # Бизнес-логика
│   │   └── main.py           # Точка входа
│   ├── migration/             # Скрипты миграции
│   └── requirements.txt
├── frontend/                   # Клиентская часть
│   ├── src/
│   │   ├── components/        # React компоненты
│   │   ├── contexts/          # React контексты
│   │   ├── hooks/             # Пользовательские хуки
│   │   ├── pages/             # Страницы приложения
│   │   ├── services/          # API сервисы
│   │   └── styles/            # Стили и темы
│   └── package.json
├── postgres/                   # Инициализация БД
└── docker-compose.yml         # Конфигурация Docker
```

## 🚀 Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Git

### Установка и запуск

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd company-analytics-2
```

2. **Запустите приложение:**
```bash
docker-compose up -d
```

3. **Дождитесь запуска всех сервисов:**
```bash
docker-compose logs -f
```

4. **Откройте приложение:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API документация: http://localhost:8000/docs

### Первоначальная настройка данных

Если у вас есть SQLite база данных для миграции:

1. **Поместите файл `finance.db` в директорию `backend/migration/`**

2. **Выполните миграцию:**
```bash
cd backend/migration
pip install -r requirements.txt
python migrate_to_postgres.py
```

## 📊 API Endpoints

### Поиск компаний

- `GET /api/companies/search` - Универсальный поиск
- `GET /api/companies/search/by-name` - Поиск по названию
- `GET /api/companies/search/by-okved` - Поиск по ОКВЭД

### Информация о компании

- `GET /api/companies/{inn}` - Базовая информация
- `GET /api/companies/{inn}/analytics` - Полная аналитика

### Примеры запросов

```bash
# Поиск по названию
curl "http://localhost:8000/api/companies/search/by-name?name=СБЕРБАНК"

# Поиск по ОКВЭД
curl "http://localhost:8000/api/companies/search/by-okved?okved=64.19"

# Универсальный поиск
curl "http://localhost:8000/api/companies/search?name=ГАЗПРОМ&region=77"

# Аналитика компании
curl "http://localhost:8000/api/companies/7707083893/analytics"
```

## 🔧 Конфигурация

### Переменные окружения

#### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://company_user:company_password@postgres:5432/company_analytics
DATANEWTON_API_KEY=your_api_key_here
DEBUG=True
```

#### Frontend
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### Docker Compose

Основные сервисы настроены в `docker-compose.yml`:

- **postgres**: База данных на порту 5432
- **backend**: FastAPI сервер на порту 8000
- **frontend**: React приложение на порту 3000

## 🗄️ База данных

### Основные таблицы

#### `company`
- `company_id` - Уникальный идентификатор
- `name` - Название компании
- `inn` - ИНН
- `okved` - Основной код ОКВЭД
- `okved_o` - Дополнительные коды ОКВЭД
- `kod_re` - Код региона

#### `report`
- `report_id` - Идентификатор отчета
- `company_id` - Связь с компанией
- `year` - Отчетный год
- Финансовые показатели (выручка, прибыль, активы и т.д.)

### Миграция данных

Для миграции из SQLite в PostgreSQL используйте скрипт:

```bash
cd backend/migration
python migrate_to_postgres.py
```

## 🎨 Интерфейс

### Основные компоненты

- **SearchForm** - Форма поиска с тремя режимами
- **SearchResults** - Результаты поиска с пагинацией
- **CompanyPage** - Детальная страница компании
- **FinancialCharts** - Интерактивные графики

### Стилизация

Приложение использует стеклянный дизайн (glassmorphism) с:
- Полупрозрачными элементами
- Размытием фона (backdrop-filter)
- Градиентными переходами
- Адаптивной версткой

## 🔌 Внешние интеграции

### DataNewton API
- Получение информации о контрагентах
- Финансовые данные компаний
- Информация о владельцах и менеджерах

### RusProfile
- Парсинг дополнительной информации
- Данные об арбитражных делах
- Информация о госзакупках
- Рейтинги в отрасли

## 🚀 Развертывание

### Production

1. **Обновите переменные окружения для production**
2. **Настройте reverse proxy (nginx)**
3. **Используйте внешнюю базу данных**
4. **Настройте SSL сертификаты**

### Пример nginx конфигурации

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🛠 Разработка

### Backend разработка

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend разработка

```bash
cd frontend
npm install
npm start
```

### Полезные команды

```bash
# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f frontend

# Перезапуск сервиса
docker-compose restart backend

# Подключение к базе данных
docker-compose exec postgres psql -U company_user -d company_analytics

# Выполнение миграций
docker-compose exec backend python -c "from app.core.database import init_database; init_database()"
```

## 📈 Мониторинг и логирование

### Логи приложения

- Backend логи: `docker-compose logs backend`
- Frontend логи: `docker-compose logs frontend`
- PostgreSQL логи: `docker-compose logs postgres`

### Метрики

API предоставляет эндпоинт для проверки здоровья:
- `GET /health` - Статус приложения

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для функции (`git checkout -b feature/AmazingFeature`)
3. Зафиксируйте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Отправьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs`
2. Убедитесь, что все сервисы запущены: `docker-compose ps`
3. Проверьте подключение к базе данных
4. Создайте issue в репозитории с подробным описанием проблемы

## 📞 Контакты

- Email: support@company-analytics.com
- Telegram: @company_analytics_support

---

**Company Analytics** - ваш инструмент для анализа российского бизнеса! 🚀