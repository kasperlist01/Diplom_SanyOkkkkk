from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database - теперь поддерживает PostgreSQL
    database_url: str = os.getenv(
        'DATABASE_URL',
        'postgresql://company_user:company_password@postgres:5432/company_analytics'
    )

    # API Keys
    datanewton_api_key: str = "ET05PwvL9kHa"

    # External APIs
    rusprofile_base_url: str = "https://www.rusprofile.ru"
    datanewton_base_url: str = "https://api.datanewton.ru"

    # App settings
    app_name: str = "Company Analytics API"
    debug: bool = True

    class Config:
        env_file = ".env"
        # Разрешаем дополнительные поля из переменных окружения
        extra = "allow"

settings = Settings()