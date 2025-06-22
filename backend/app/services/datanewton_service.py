import requests
from typing import Optional, Dict, Any
from app.core.config import settings


class DataNewtonService:

    def __init__(self):
        self.api_key = settings.datanewton_api_key
        self.base_url = settings.datanewton_base_url

    async def get_counterparty(self, inn: str) -> Optional[Dict[str, Any]]:
        """Получить информацию о контрагенте"""
        url = f"{self.base_url}/v1/counterparty"
        params = {
            "key": self.api_key,
            "inn": inn,
            "filters": ["OWNER_BLOCK", "ADDRESS_BLOCK"]
        }

        try:
            # Используем requests в синхронном режиме
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error getting counterparty data: {e}")
            return None

    async def get_finance(self, inn: str) -> Optional[Dict[str, Any]]:
        """Получить финансовые данные"""
        url = f"{self.base_url}/v1/finance"
        params = {
            "key": self.api_key,
            "inn": inn
        }

        try:
            # Используем requests в синхронном режиме
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error getting finance data: {e}")
            return None