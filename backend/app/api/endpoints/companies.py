# backend/app/api/endpoints/companies.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.schemas.company import CompanyDetail, CompanyAnalytics, FinancialReport, CompanySearch
from app.schemas.search import SearchResponse
from app.services.database_service import DatabaseService
from app.services.datanewton_service import DataNewtonService
from app.services.rusprofile_service import RusProfileService
from app.services.prediction_service import FinancialPredictionService  # НОВОЕ
import json

router = APIRouter()


@router.get("/search", response_model=SearchResponse)
async def search_companies(
        name: Optional[str] = Query(None, description="Название компании (частичное совпадение)"),
        okved: Optional[str] = Query(None, description="Код ОКВЭД (частичное совпадение)"),
        inn: Optional[str] = Query(None, description="ИНН компании"),
        region: Optional[str] = Query(None, description="Код региона"),
        limit: int = Query(100, description="Количество результатов", le=500),
        db: Session = Depends(get_db)
):
    """
    Поиск компаний по различным критериям
    """
    try:
        # Создаем параметры поиска
        search_params = {}
        if name:
            search_params['name'] = name.strip()
        if okved:
            search_params['okved'] = okved.strip()
        if inn:
            search_params['inn'] = inn.strip()
        if region:
            search_params['region'] = region.strip()

        if not search_params:
            raise HTTPException(status_code=400, detail="Необходимо указать хотя бы один параметр поиска")

        companies, total = DatabaseService.search_companies_flexible(db, search_params, limit)

        # Преобразуем в схему ответа
        company_list = []
        for company in companies:
            company_search = CompanySearch(
                company_id=company.company_id,
                name=company.name,
                inn=company.inn,
                okved=company.okved,
                okved_o=company.okved_o,
                location=f"Код региона: {company.kod_re}" if company.kod_re else None
            )
            company_list.append(company_search)

        return SearchResponse(
            companies=company_list,
            total=total
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка поиска: {str(e)}")


@router.get("/search/by-name", response_model=SearchResponse)
async def search_companies_by_name(
        name: str = Query(..., description="Название компании для поиска"),
        limit: int = Query(100, description="Количество результатов", le=500),
        db: Session = Depends(get_db)
):
    """
    Поиск компаний по названию
    """
    try:
        if not name or len(name.strip()) < 2:
            raise HTTPException(status_code=400, detail="Название должно содержать минимум 2 символа")

        companies, total = DatabaseService.search_by_name(db, name.strip(), limit)

        company_list = []
        for company in companies:
            company_search = CompanySearch(
                company_id=company.company_id,
                name=company.name,
                inn=company.inn,
                okved=company.okved,
                okved_o=company.okved_o,
                location=f"Код региона: {company.kod_re}" if company.kod_re else None
            )
            company_list.append(company_search)

        return SearchResponse(
            companies=company_list,
            total=total
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка поиска по названию: {str(e)}")


@router.get("/search/by-okved", response_model=SearchResponse)
async def search_companies_by_okved(
        okved: str = Query(..., description="Код ОКВЭД для поиска"),
        limit: int = Query(100, description="Количество результатов", le=500),
        db: Session = Depends(get_db)
):
    """
    Поиск компаний по коду ОКВЭД
    """
    try:
        if not okved or len(okved.strip()) < 2:
            raise HTTPException(status_code=400, detail="Код ОКВЭД должен содержать минимум 2 символа")

        companies, total = DatabaseService.search_by_okved(db, okved.strip(), limit)

        company_list = []
        for company in companies:
            company_search = CompanySearch(
                company_id=company.company_id,
                name=company.name,
                inn=company.inn,
                okved=company.okved,
                okved_o=company.okved_o,
                location=f"Код региона: {company.kod_re}" if company.kod_re else None
            )
            company_list.append(company_search)

        return SearchResponse(
            companies=company_list,
            total=total
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка поиска по ОКВЭД: {str(e)}")


@router.get("/{inn}", response_model=CompanyDetail)
async def get_company(
        inn: str,
        db: Session = Depends(get_db)
):
    """Получить детальную информацию о компании из БД и внешних API"""
    try:
        # Получаем базовую информацию из БД
        company = DatabaseService.get_company_by_inn(db, inn)
        if not company:
            raise HTTPException(status_code=404, detail="Компания не найдена")

        # Получаем данные из внешних API
        datanewton_service = DataNewtonService()
        rusprofile_service = RusProfileService()

        counterparty_data = await datanewton_service.get_counterparty(inn)
        rusprofile_data = await rusprofile_service.get_company_data(inn)

        # Формируем ответ
        company_detail = CompanyDetail(
            company_id=company.company_id,
            name=company.name,
            inn=inn,
            okved=company.okved,
            okved_o=company.okved_o,
            location=f"Код региона: {company.kod_re}" if company.kod_re else None
        )

        # Добавляем данные из DataNewton API
        if counterparty_data and 'company' in counterparty_data:
            company_info = counterparty_data['company']
            company_detail.full_name = company_info.get('company_names', {}).get('full_name')
            company_detail.ogrn = counterparty_data.get('ogrn')
            company_detail.kpp = company_info.get('kpp')
            company_detail.opf = company_info.get('opf')
            company_detail.address = company_info.get('address', {}).get('line_address')
            company_detail.registration_date = company_info.get('registration_date')
            company_detail.charter_capital = company_info.get('charter_capital')
            company_detail.status = company_info.get('status')
            company_detail.owners = company_info.get('owners')
            company_detail.managers = company_info.get('managers')
            company_detail.tax_mode_info = company_info.get('tax_mode_info')

        # Добавляем данные из RusProfile
        if rusprofile_data:
            company_detail.rusprofile_data = rusprofile_data

        return company_detail

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{inn}/analytics", response_model=CompanyAnalytics)
async def get_company_analytics(
        inn: str,
        db: Session = Depends(get_db)
):
    """Получить аналитику компании из БД и внешних API"""
    try:
        # ИСПРАВЛЕНИЕ: Сначала получаем базовую информацию из БД
        db_company = DatabaseService.get_company_by_inn(db, inn)
        if not db_company:
            raise HTTPException(status_code=404, detail="Компания не найдена в базе данных")

        # Получаем данные из внешних API
        datanewton_service = DataNewtonService()
        rusprofile_service = RusProfileService()

        # Получаем основную информацию о компании
        counterparty_data = await datanewton_service.get_counterparty(inn)

        # Получаем финансовые данные из API
        finance_data = await datanewton_service.get_finance(inn)

        # Получаем данные из RusProfile
        rusprofile_data = await rusprofile_service.get_company_data(inn)

        # ИСПРАВЛЕНИЕ: Формируем детальную информацию о компании, используя данные из БД как основу
        company_detail = create_company_detail_from_db_and_api(
            db_company, counterparty_data, rusprofile_data, inn
        )

        # Преобразуем финансовые данные из API в отчеты (ИСПРАВЛЕНИЕ: умножаем на 1000)
        reports = []
        if finance_data:
            reports = convert_api_finance_to_reports(finance_data)

        # Подготавливаем данные для графиков (ИСПРАВЛЕНИЕ: умножаем на 1000)
        chart_data = prepare_chart_data(reports)

        # ИСПРАВЛЕНИЕ: Получаем похожие компании используя ОКВЭД из БД
        similar_companies = get_similar_companies_from_db(db, db_company.okved, inn)

        # НОВОЕ: Генерируем предсказание на следующий год
        predicted_data = None
        if reports and len(reports) >= 2:
            try:
                predicted_data = FinancialPredictionService.predict_next_year(reports)
                print(f"Предсказание для {inn}: {predicted_data}")
            except Exception as e:
                print(f"Ошибка предсказания для {inn}: {e}")

        return CompanyAnalytics(
            company=company_detail,
            reports=reports,
            chart_data=chart_data,
            similar_companies=similar_companies,
            predicted_data=predicted_data  # НОВОЕ
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# НОВЫЙ ЭНДПОИНТ: Получение предсказания отдельно
@router.get("/{inn}/prediction")
async def get_company_prediction(
        inn: str,
        db: Session = Depends(get_db)
):
    """Получить предсказание финансовых показателей на следующий год"""
    try:
        # Получаем компанию из БД
        db_company = DatabaseService.get_company_by_inn(db, inn)
        if not db_company:
            raise HTTPException(status_code=404, detail="Компания не найдена")

        # Получаем финансовые данные
        datanewton_service = DataNewtonService()
        finance_data = await datanewton_service.get_finance(inn)

        if not finance_data:
            raise HTTPException(status_code=404, detail="Финансовые данные не найдены")

        # Преобразуем в отчеты
        reports = convert_api_finance_to_reports(finance_data)

        if len(reports) < 2:
            raise HTTPException(status_code=400, detail="Недостаточно данных для предсказания (нужно минимум 2 года)")

        # Генерируем предсказание
        predicted_data = FinancialPredictionService.predict_next_year(reports)

        if not predicted_data:
            raise HTTPException(status_code=500, detail="Не удалось сгенерировать предсказание")

        # Получаем объяснение предсказания
        explanation = FinancialPredictionService.get_prediction_explanation(predicted_data, reports)

        return {
            "prediction": predicted_data,
            "explanation": explanation,
            "base_data_years": len(reports),
            "last_year": max(report.year for report in reports)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def create_company_detail_from_db_and_api(db_company, counterparty_data, rusprofile_data, inn):
    """ИСПРАВЛЕННАЯ ФУНКЦИЯ: Создает детальную информацию о компании из данных БД и API"""

    # Начинаем с данных из БД
    company_detail = CompanyDetail(
        company_id=db_company.company_id,
        name=db_company.name,
        inn=inn,
        okved=db_company.okved,  # Используем ОКВЭД из БД
        okved_o=db_company.okved_o,  # Используем дополнительный ОКВЭД из БД
        location=f"Код региона: {db_company.kod_re}" if db_company.kod_re else None
    )

    # Дополняем данными из API DataNewton, если они есть
    if counterparty_data and 'company' in counterparty_data:
        company_info = counterparty_data['company']

        # Обновляем название, если в API оно более полное
        api_name = company_info.get('company_names', {}).get('short_name')
        if api_name and len(api_name) > len(company_detail.name):
            company_detail.name = api_name

        company_detail.full_name = company_info.get('company_names', {}).get('full_name')
        company_detail.ogrn = counterparty_data.get('ogrn')
        company_detail.kpp = company_info.get('kpp')
        company_detail.opf = company_info.get('opf')
        company_detail.address = company_info.get('address', {}).get('line_address')
        company_detail.registration_date = company_info.get('registration_date')
        company_detail.charter_capital = company_info.get('charter_capital')
        company_detail.status = company_info.get('status')

        # ИСПРАВЛЕНИЕ: Обрабатываем данные владельцев
        owners = company_info.get('owners')
        if owners:
            company_detail.owners = process_owners_data(owners)

        company_detail.managers = company_info.get('managers')
        company_detail.tax_mode_info = company_info.get('tax_mode_info')

        # Если в БД нет ОКВЭД, пытаемся получить из API
        if not company_detail.okved:
            api_okved = extract_okved_from_api(company_info)
            if api_okved:
                company_detail.okved = api_okved.get('main')
                company_detail.okved_o = api_okved.get('additional')

    # Добавляем данные из RusProfile
    if rusprofile_data:
        company_detail.rusprofile_data = rusprofile_data

    return company_detail


def process_owners_data(owners):
    """НОВАЯ ФУНКЦИЯ: Обрабатывает данные владельцев для корректного отображения"""
    if not owners:
        return owners

    processed_owners = {}

    # Обрабатываем физических лиц
    if 'fl' in owners and owners['fl']:
        processed_fl = []
        for owner in owners['fl']:
            processed_owner = owner.copy()

            # Округляем долю до 2 знаков после запятой
            if 'share' in processed_owner and processed_owner['share']:
                try:
                    share_value = float(processed_owner['share'])
                    processed_owner['share'] = round(share_value, 2)
                except (ValueError, TypeError):
                    pass

            processed_fl.append(processed_owner)

        processed_owners['fl'] = processed_fl

    # Обрабатываем юридических лиц аналогично
    if 'ul' in owners and owners['ul']:
        processed_ul = []
        for owner in owners['ul']:
            processed_owner = owner.copy()

            # Округляем долю до 2 знаков после запятой
            if 'share' in processed_owner and processed_owner['share']:
                try:
                    share_value = float(processed_owner['share'])
                    processed_owner['share'] = round(share_value, 2)
                except (ValueError, TypeError):
                    pass

            processed_ul.append(processed_owner)

        processed_owners['ul'] = processed_ul

    return processed_owners


def extract_okved_from_api(company_info):
    """Извлекает ОКВЭД из данных API"""
    okved_data = {}

    # Пытаемся получить ОКВЭД из различных мест в API ответе
    if 'okved' in company_info:
        okved_data['main'] = company_info['okved']
    elif 'okveds' in company_info and company_info['okveds']:
        # Если есть массив ОКВЭД, берем первый как основной
        okveds = company_info['okveds']
        if isinstance(okveds, list) and len(okveds) > 0:
            okved_data['main'] = okveds[0].get('code') if isinstance(okveds[0], dict) else str(okveds[0])
            if len(okveds) > 1:
                okved_data['additional'] = okveds[1].get('code') if isinstance(okveds[1], dict) else str(okveds[1])

    return okved_data if okved_data else None


def get_similar_companies_from_db(db: Session, okved: str, current_inn: str):
    """ИСПРАВЛЕННАЯ ФУНКЦИЯ: Получает похожие компании из БД по ОКВЭД"""
    similar_companies = []

    if okved:
        try:
            # Получаем похожие компании из БД
            db_similar = DatabaseService.get_similar_companies(db, okved, current_inn, 20)

            for company in db_similar:
                similar_company = CompanySearch(
                    company_id=company.company_id,
                    name=company.name,
                    inn=company.inn,
                    okved=company.okved,
                    okved_o=company.okved_o,
                    location=f"Код региона: {company.kod_re}" if company.kod_re else None
                )
                similar_companies.append(similar_company)

            print(f"Найдено {len(similar_companies)} похожих компаний для ОКВЭД {okved}")

        except Exception as e:
            print(f"Ошибка получения похожих компаний: {e}")

    return similar_companies


def convert_api_finance_to_reports(finance_data):
    """Преобразует данные из API в отчеты (ИСПРАВЛЕНИЕ: умножаем на 1000)"""
    reports = []

    balances = finance_data.get('balances', {})
    fin_results = finance_data.get('fin_results', {})

    balance_years = balances.get('years', [])
    fin_years = fin_results.get('years', [])
    all_years = sorted(set(balance_years + fin_years))

    for year in all_years:
        year_str = str(year)

        # ИСПРАВЛЕНИЕ: Умножаем все финансовые данные на 1000 (так как они в тысячах)
        report = FinancialReport(
            year=year,
            revenue_cur=multiply_by_thousand(get_fin_result_value(fin_results, '2110', year_str)),
            gross_profit_cur=multiply_by_thousand(get_fin_result_value(fin_results, '2100', year_str)),
            oper_profit_cur=multiply_by_thousand(get_fin_result_value(fin_results, '2200', year_str)),
            net_profit_cur=multiply_by_thousand(get_fin_result_value(fin_results, '2400', year_str)),
            balance_assets_eoy=multiply_by_thousand(get_balance_value(balances, '1600', year_str)),
            equity_eoy=multiply_by_thousand(get_balance_value(balances, '1300', year_str))
        )

        reports.append(report)

    return sorted(reports, key=lambda x: x.year)


def multiply_by_thousand(value):
    """Умножает значение на 1000, обрабатывая None и 0"""
    if value is None or value == 0:
        return 0.0
    return float(value) * 1000


def get_balance_value(balances, code, year):
    """Получает значение из баланса"""
    try:
        indicators = balances.get('indicators', [])
        for indicator in indicators:
            if indicator.get('code') == code:
                return indicator.get('sum', {}).get(year, 0.0) or 0.0
        return 0.0
    except:
        return 0.0


def get_fin_result_value(fin_results, code, year):
    """Получает значение из отчета о прибылях и убытках"""
    try:
        indicators = fin_results.get('indicators', [])
        for indicator in indicators:
            if indicator.get('code') == code:
                return indicator.get('sum', {}).get(year, 0.0) or 0.0
        return 0.0
    except:
        return 0.0


def prepare_chart_data(reports):
    """Подготавливает данные для графиков (ИСПРАВЛЕНИЕ: данные уже умножены на 1000)"""
    chart_data = {
        'years': [],
        'revenue': [],
        'net_profit': [],
        'assets': [],
        'equity': [],
        'profitability': []
    }

    for report in reports:
        chart_data['years'].append(report.year)
        # ИСПРАВЛЕНИЕ: Данные уже умножены на 1000 в convert_api_finance_to_reports
        chart_data['revenue'].append(report.revenue_cur or 0)
        chart_data['net_profit'].append(report.net_profit_cur or 0)
        chart_data['assets'].append(report.balance_assets_eoy or 0)
        chart_data['equity'].append(report.equity_eoy or 0)

        # Рассчитываем рентабельность
        if report.revenue_cur and report.net_profit_cur and report.revenue_cur != 0:
            profitability = (report.net_profit_cur / report.revenue_cur) * 100
        else:
            profitability = 0
        chart_data['profitability'].append(profitability)

    return chart_data