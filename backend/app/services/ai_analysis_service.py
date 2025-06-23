# backend/app/services/ai_analysis_service.py
import json
import logging
import asyncio
from typing import Dict, Any, Generator, Optional
import anthropic
import os

from app.core.config import settings
from app.schemas.company import CompanyDetail, FinancialReport

logger = logging.getLogger(__name__)


class AIAnalysisService:
    """Сервис для ИИ-анализа компаний"""

    def __init__(self):
        # Получаем API ключ Anthropic из переменных окружения
        self.api_key = os.getenv('ANTHROPIC_API_KEY') or settings.anthropic_api_key
        self.api_url = os.getenv('ANTHROPIC_API_URL') or settings.anthropic_api_url

        if not self.api_key:
            raise ValueError("Anthropic API key не настроен. Установите переменную окружения ANTHROPIC_API_KEY")

        # Инициализируем клиент Anthropic
        self.claude_client = anthropic.Anthropic(api_key=self.api_key, base_url=self.api_url)

        logger.info(f"AIAnalysisService инициализирован с Anthropic API ключом: {self.api_key[:10]}...")

    def analyze_company_stream(
            self,
            company: CompanyDetail,
            reports: list[FinancialReport],
            similar_companies: list = None
    ) -> Generator[str, None, None]:
        """
        Потоковый анализ компании с помощью ИИ Claude
        """
        try:
            # Подготавливаем данные для анализа
            analysis_data = self._prepare_analysis_data(company, reports, similar_companies)

            # Создаем промпт для анализа
            prompt = self._create_analysis_prompt(analysis_data)

            logger.info(f"Начинаем ИИ-анализ компании {company.name} (ИНН: {company.inn})")

            # Запускаем потоковый анализ в отдельном потоке
            def run_claude_stream():
                try:
                    # Используем потоковый режим Claude
                    with self.claude_client.messages.stream(
                            model="claude-sonnet-4-20250514",  # Используем актуальную модель
                            max_tokens=4000,
                            temperature=0.7,
                            messages=[
                                {
                                    "role": "user",
                                    "content": prompt
                                }
                            ]
                    ) as stream:
                        for text in stream.text_stream:
                            if text:
                                yield text
                except anthropic.APIError as e:
                    logger.error(f"Ошибка Anthropic API: {e}")
                    yield f"**Ошибка API:** {str(e)}\n\nПроверьте API ключ и попробуйте позже."
                except Exception as e:
                    logger.error(f"Ошибка потокового анализа: {e}")
                    yield f"**Ошибка анализа:** {str(e)}\n\nПопробуйте позже или обратитесь к администратору."

            # Запускаем генератор потока
            for chunk in run_claude_stream():
                yield chunk

        except ValueError as e:
            logger.error(f"Ошибка конфигурации ИИ-анализа: {e}")
            yield f"**Ошибка конфигурации:** {str(e)}"
        except Exception as e:
            logger.error(f"Ошибка ИИ-анализа: {e}")
            yield f"**Ошибка анализа:** {str(e)}\n\nПопробуйте позже или обратитесь к администратору."

    def _prepare_analysis_data(
            self,
            company: CompanyDetail,
            reports: list[FinancialReport],
            similar_companies: list = None
    ) -> Dict[str, Any]:
        """Подготавливает данные компании для анализа"""

        # Базовая информация о компании
        company_info = {
            "name": company.name,
            "full_name": company.full_name,
            "inn": company.inn,
            "ogrn": company.ogrn,
            "okved": company.okved,
            "okved_description": company.okved_o,
            "registration_date": company.registration_date,
            "address": company.address,
            "charter_capital": company.charter_capital,
            "status": company.status,
            "opf": company.opf
        }

        # Финансовые данные
        financial_data = []
        for report in reports[-5:]:  # Берем последние 5 лет
            financial_data.append({
                "year": report.year,
                "revenue": report.revenue_cur,
                "gross_profit": report.gross_profit_cur,
                "operating_profit": report.oper_profit_cur,
                "net_profit": report.net_profit_cur,
                "assets": report.balance_assets_eoy,
                "equity": report.equity_eoy
            })

        # Информация о владельцах
        ownership_info = None
        if company.owners:
            ownership_info = {
                "individual_owners": len(company.owners.get('fl', [])),
                "legal_owners": len(company.owners.get('ul', [])),
                "ownership_structure": company.owners
            }

        # Конкуренты
        competitors_info = None
        if similar_companies:
            competitors_info = {
                "count": len(similar_companies),
                "companies": [{"name": comp.name, "inn": comp.inn} for comp in similar_companies[:5]]
            }

        return {
            "company_info": company_info,
            "financial_data": financial_data,
            "ownership_info": ownership_info,
            "competitors_info": competitors_info
        }

    def _create_analysis_prompt(self, data: Dict[str, Any]) -> str:
        """Создает промпт для ИИ-анализа"""

        company_info = data["company_info"]
        financial_data = data["financial_data"]

        prompt = f"""
Проведи комплексный анализ российской компании на основе следующих данных:

## ИНФОРМАЦИЯ О КОМПАНИИ
- **Название:** {company_info['name']}
- **Полное название:** {company_info['full_name']}
- **ИНН:** {company_info['inn']}
- **ОГРН:** {company_info['ogrn']}
- **ОКВЭД:** {company_info['okved']} ({company_info['okved_description']})
- **Дата регистрации:** {company_info['registration_date']}
- **Уставный капитал:** {company_info['charter_capital']}
- **Организационно-правовая форма:** {company_info['opf']}
- **Адрес:** {company_info['address']}

## ФИНАНСОВЫЕ ДАННЫЕ (последние годы)
"""

        # Добавляем финансовые данные
        for report in financial_data:
            prompt += f"""
### {report['year']} год:
- Выручка: {self._format_currency(report['revenue'])}
- Валовая прибыль: {self._format_currency(report['gross_profit'])}
- Операционная прибыль: {self._format_currency(report['operating_profit'])}
- Чистая прибыль: {self._format_currency(report['net_profit'])}
- Активы: {self._format_currency(report['assets'])}
- Собственный капитал: {self._format_currency(report['equity'])}
"""

        # Добавляем информацию о владельцах
        if data["ownership_info"]:
            ownership = data["ownership_info"]
            prompt += f"""
## СТРУКТУРА СОБСТВЕННОСТИ
- Физических лиц-учредителей: {ownership['individual_owners']}
- Юридических лиц-учредителей: {ownership['legal_owners']}
"""

        # Добавляем информацию о конкурентах
        if data["competitors_info"]:
            competitors = data["competitors_info"]
            prompt += f"""
## КОНКУРЕНТЫ (по ОКВЭД)
Найдено {competitors['count']} похожих компаний в отрасли.
"""

        prompt += """

## ЗАДАЧИ ДЛЯ АНАЛИЗА:

Проведи глубокий анализ и предоставь структурированный отчет по следующим разделам:

### 1. 📊 Финансовое состояние
- Оцени динамику выручки, прибыльности и рентабельности
- Проанализируй структуру активов и капитала
- Выяви финансовые тренды и закономерности
- Оцени финансовую устойчивость компании

### 2. 🎯 Бизнес-модель и отрасль
- Опиши основную деятельность компании по ОКВЭД
- Проанализируй особенности отрасли
- Оцени рыночную позицию компании
- Определи ключевые факторы успеха в данной отрасли

### 3. 💡 SWOT-анализ
- **Сильные стороны** компании
- **Слабые стороны** и риски
- **Возможности** для развития
- **Угрозы** внешней среды

### 4. 📈 Инвестиционная привлекательность
- Оцени компанию как объект инвестиций
- Проанализируй потенциал роста
- Определи ключевые риски для инвесторов
- Дай рекомендации по инвестированию

### 5. 🔮 Прогноз и рекомендации
- Спрогнозируй развитие компании на ближайшие 2-3 года
- Предложи стратегические рекомендации для менеджмента
- Определи ключевые показатели для мониторинга
- Предложи пути повышения эффективности

### 6. ⚠️ Риски и предупреждения
- Выяви основные бизнес-риски
- Оцени финансовые риски
- Проанализируй отраслевые и макроэкономические риски
- Предложи способы минимизации рисков

Будь конкретным, используй числовые показатели из предоставленных данных, делай обоснованные выводы и предоставляй практические рекомендации. Отвечай на русском языке в формате Markdown.
"""

        return prompt

    def _format_currency(self, value: Optional[float]) -> str:
        """Форматирует валютные значения"""
        if value is None or value == 0:
            return "0 ₽"

        if abs(value) >= 1_000_000_000:
            return f"{value / 1_000_000_000:.1f} млрд ₽"
        elif abs(value) >= 1_000_000:
            return f"{value / 1_000_000:.1f} млн ₽"
        elif abs(value) >= 1_000:
            return f"{value / 1_000:.1f} тыс ₽"
        else:
            return f"{value:.0f} ₽"