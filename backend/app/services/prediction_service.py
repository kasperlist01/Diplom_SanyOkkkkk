# backend/app/services/prediction_service.py
import numpy as np
from typing import List, Optional, Dict, Any
from app.schemas.company import FinancialReport, PredictedFinancialData
import logging

logger = logging.getLogger(__name__)


class FinancialPredictionService:
    """Сервис для предсказания финансовых показателей на основе трендового анализа"""

    @staticmethod
    def predict_next_year(reports: List[FinancialReport]) -> Optional[PredictedFinancialData]:
        """
        Предсказывает финансовые показатели на следующий год
        используя линейную регрессию на основе исторических данных
        """
        try:
            if not reports or len(reports) < 2:
                logger.warning("Недостаточно данных для предсказания (нужно минимум 2 года)")
                return None

            # Сортируем отчеты по годам
            sorted_reports = sorted(reports, key=lambda x: x.year)

            # Получаем годы и значения
            years = [report.year for report in sorted_reports]
            next_year = max(years) + 1

            # Предсказываем каждый показатель
            predicted_revenue = FinancialPredictionService._predict_metric(
                years, [report.revenue_cur for report in sorted_reports]
            )

            predicted_net_profit = FinancialPredictionService._predict_metric(
                years, [report.net_profit_cur for report in sorted_reports]
            )

            predicted_assets = FinancialPredictionService._predict_metric(
                years, [report.balance_assets_eoy for report in sorted_reports]
            )

            predicted_equity = FinancialPredictionService._predict_metric(
                years, [report.equity_eoy for report in sorted_reports]
            )

            # Рассчитываем общую уверенность в предсказании
            confidence = FinancialPredictionService._calculate_confidence(sorted_reports)

            return PredictedFinancialData(
                year=next_year,
                revenue_cur=predicted_revenue,
                net_profit_cur=predicted_net_profit,
                balance_assets_eoy=predicted_assets,
                equity_eoy=predicted_equity,
                confidence=confidence
            )

        except Exception as e:
            logger.error(f"Ошибка при предсказании данных: {e}")
            return None

    @staticmethod
    def _predict_metric(years: List[int], values: List[Optional[float]]) -> Optional[float]:
        """Предсказывает один финансовый показатель используя линейную регрессию"""
        try:
            # Фильтруем None значения
            valid_data = [(year, value) for year, value in zip(years, values)
                          if value is not None and value != 0]

            if len(valid_data) < 2:
                return None

            # Извлекаем валидные годы и значения
            valid_years = np.array([item[0] for item in valid_data])
            valid_values = np.array([item[1] for item in valid_data])

            # Выполняем линейную регрессию
            coefficients = np.polyfit(valid_years, valid_values, 1)
            slope, intercept = coefficients

            # Предсказываем значение на следующий год
            next_year = max(years) + 1
            predicted_value = slope * next_year + intercept

            # Применяем ограничения для реалистичности
            predicted_value = FinancialPredictionService._apply_constraints(
                predicted_value, valid_values, slope
            )

            return float(predicted_value)

        except Exception as e:
            logger.error(f"Ошибка при предсказании метрики: {e}")
            return None

    @staticmethod
    def _apply_constraints(predicted_value: float, historical_values: np.ndarray, slope: float) -> float:
        """Применяет ограничения к предсказанному значению для повышения реалистичности"""

        # Максимальное изменение не должно превышать 200% от среднего исторического значения
        avg_historical = np.mean(np.abs(historical_values))
        max_change = avg_historical * 2.0

        # Ограничиваем рост/падение
        last_value = historical_values[-1]
        change = predicted_value - last_value

        if abs(change) > max_change:
            if change > 0:
                predicted_value = last_value + max_change
            else:
                predicted_value = last_value - max_change

        # Для прибыли разрешаем отрицательные значения, но ограничиваем падение
        # Для выручки и активов не разрешаем отрицательные значения
        if predicted_value < 0 and np.all(historical_values >= 0):
            # Если исторически показатель всегда был положительным
            predicted_value = max(0, last_value * 0.1)  # Минимум 10% от последнего значения

        return predicted_value

    @staticmethod
    def _calculate_confidence(reports: List[FinancialReport]) -> float:
        """Рассчитывает уверенность в предсказании на основе стабильности данных"""
        try:
            if len(reports) < 3:
                return 0.5  # Средняя уверенность при малом количестве данных

            # Анализируем стабильность трендов для ключевых метрик
            revenue_values = [r.revenue_cur for r in reports if r.revenue_cur is not None]
            profit_values = [r.net_profit_cur for r in reports if r.net_profit_cur is not None]

            confidences = []

            # Уверенность на основе стабильности выручки
            if len(revenue_values) >= 3:
                revenue_stability = FinancialPredictionService._calculate_trend_stability(revenue_values)
                confidences.append(revenue_stability)

            # Уверенность на основе стабильности прибыли
            if len(profit_values) >= 3:
                profit_stability = FinancialPredictionService._calculate_trend_stability(profit_values)
                confidences.append(profit_stability)

            if not confidences:
                return 0.5

            # Возвращаем среднюю уверенность
            avg_confidence = np.mean(confidences)

            # Бонус за количество данных
            data_bonus = min(0.2, len(reports) * 0.05)

            return min(0.95, avg_confidence + data_bonus)

        except Exception as e:
            logger.error(f"Ошибка при расчете уверенности: {e}")
            return 0.5

    @staticmethod
    def _calculate_trend_stability(values: List[float]) -> float:
        """Рассчитывает стабильность тренда (0-1, где 1 - очень стабильный)"""
        try:
            if len(values) < 3:
                return 0.5

            values_array = np.array(values)

            # Рассчитываем коэффициент вариации
            mean_val = np.mean(values_array)
            if mean_val == 0:
                return 0.3

            std_val = np.std(values_array)
            cv = std_val / abs(mean_val)

            # Преобразуем коэффициент вариации в уверенность
            # CV < 0.1 -> высокая уверенность (0.9)
            # CV > 1.0 -> низкая уверенность (0.1)
            if cv < 0.1:
                return 0.9
            elif cv > 1.0:
                return 0.1
            else:
                return 0.9 - (cv * 0.8)

        except Exception as e:
            logger.error(f"Ошибка при расчете стабильности тренда: {e}")
            return 0.5

    @staticmethod
    def get_prediction_explanation(predicted_data: PredictedFinancialData, reports: List[FinancialReport]) -> Dict[
        str, Any]:
        """Возвращает объяснение предсказания для пользователя"""
        if not predicted_data or not reports:
            return {}

        sorted_reports = sorted(reports, key=lambda x: x.year)
        last_report = sorted_reports[-1]

        explanation = {
            "method": "Линейная экстраполяция тренда",
            "data_points": len(reports),
            "confidence_level": predicted_data.confidence,
            "confidence_text": FinancialPredictionService._get_confidence_text(predicted_data.confidence),
            "changes": {}
        }

        # Анализируем изменения
        if predicted_data.revenue_cur and last_report.revenue_cur:
            revenue_change = ((predicted_data.revenue_cur - last_report.revenue_cur) / last_report.revenue_cur) * 100
            explanation["changes"]["revenue"] = {
                "percent": round(revenue_change, 1),
                "direction": "рост" if revenue_change > 0 else "снижение"
            }

        if predicted_data.net_profit_cur and last_report.net_profit_cur:
            profit_change = ((
                                         predicted_data.net_profit_cur - last_report.net_profit_cur) / last_report.net_profit_cur) * 100
            explanation["changes"]["profit"] = {
                "percent": round(profit_change, 1),
                "direction": "рост" if profit_change > 0 else "снижение"
            }

        return explanation

    @staticmethod
    def _get_confidence_text(confidence: float) -> str:
        """Преобразует числовую уверенность в текстовое описание"""
        if confidence >= 0.8:
            return "Высокая"
        elif confidence >= 0.6:
            return "Средняя"
        elif confidence >= 0.4:
            return "Ниже средней"
        else:
            return "Низкая"