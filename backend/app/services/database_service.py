# backend/app/services/database_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, not_
from typing import List, Optional, Tuple, Dict, Any
from app.models.company import Company
from app.models.report import Report


class DatabaseService:

    @staticmethod
    def search_companies_flexible(db: Session, params: Dict[str, str], limit: int = 100) -> Tuple[List[Company], int]:
        """Гибкий поиск компаний в БД"""
        query = db.query(Company)
        filters = []

        # Поиск по ИНН
        if 'inn' in params and params['inn']:
            inn_value = params['inn']
            print(f"Поиск по ИНН: {inn_value}")
            filters.append(
                or_(
                    Company.inn == inn_value,
                    Company.inn.like(f"%{inn_value}%")
                )
            )

        # Поиск по названию
        if 'name' in params and params['name']:
            name_value = params['name']
            print(f"Поиск по названию: {name_value}")
            filters.append(
                Company.name.ilike(f"%{name_value}%")
            )

        # Поиск по ОКВЭД
        if 'okved' in params and params['okved']:
            okved_value = params['okved']
            print(f"Поиск по ОКВЭД: {okved_value}")
            filters.append(
                or_(
                    Company.okved.like(f"%{okved_value}%"),
                    Company.okved_o.like(f"%{okved_value}%")
                )
            )

        # Поиск по региону
        if 'region' in params and params['region']:
            region_value = params['region']
            print(f"Поиск по региону: {region_value}")
            filters.append(Company.kod_re.like(f"%{region_value}%"))

        # Применяем фильтры
        if filters:
            query = query.filter(and_(*filters))
        else:
            print("Нет параметров для поиска")
            return [], 0

        # НОВОЕ: Исключаем организации с ИНН, заканчивающимся на .0
        query = query.filter(not_(Company.inn.like('%.0')))

        # Подсчет общего количества
        try:
            total = query.count()
            print(f"Найдено записей всего: {total}")
        except Exception as e:
            print(f"Ошибка подсчета: {e}")
            total = 0

        # Получение результатов с ограничением
        try:
            companies = query.order_by(Company.name).limit(limit).all()
            print(f"Возвращаем {len(companies)} записей (лимит: {limit})")

            if companies:
                print(f"Первые результаты: {[f'{c.name} (ИНН: {c.inn})' for c in companies[:3]]}")

        except Exception as e:
            print(f"Ошибка получения результатов: {e}")
            companies = []

        return companies, total

    @staticmethod
    def search_by_name(db: Session, name: str, limit: int = 100) -> Tuple[List[Company], int]:
        """Поиск компаний по названию"""
        try:
            query = db.query(Company).filter(
                Company.name.ilike(f"%{name}%")
            )

            # НОВОЕ: Исключаем организации с ИНН, заканчивающимся на .0
            query = query.filter(not_(Company.inn.like('%.0')))

            total = query.count()
            companies = query.order_by(Company.name).limit(limit).all()

            print(f"Поиск по названию '{name}': найдено {total}, возвращено {len(companies)}")
            return companies, total

        except Exception as e:
            print(f"Ошибка поиска по названию: {e}")
            return [], 0

    @staticmethod
    def search_by_okved(db: Session, okved: str, limit: int = 100) -> Tuple[List[Company], int]:
        """Поиск компаний по ОКВЭД"""
        try:
            query = db.query(Company).filter(
                or_(
                    Company.okved.like(f"%{okved}%"),
                    Company.okved_o.like(f"%{okved}%")
                )
            )

            # НОВОЕ: Исключаем организации с ИНН, заканчивающимся на .0
            query = query.filter(not_(Company.inn.like('%.0')))

            total = query.count()
            companies = query.order_by(Company.name).limit(limit).all()

            print(f"Поиск по ОКВЭД '{okved}': найдено {total}, возвращено {len(companies)}")
            return companies, total

        except Exception as e:
            print(f"Ошибка поиска по ОКВЭД: {e}")
            return [], 0

    @staticmethod
    def get_company_by_inn(db: Session, inn: str) -> Optional[Company]:
        """Получить компанию по ИНН"""
        inn_clean = inn.strip()
        company = db.query(Company).filter(
            or_(
                Company.inn == inn_clean,
                Company.inn == f"{inn_clean}.0",
                func.replace(Company.inn, '.0', '') == inn_clean
            )
        ).first()

        print(f"Поиск компании по ИНН {inn_clean}: {'найдена' if company else 'не найдена'}")
        if company:
            print(f"Найденная компания: ID={company.company_id}, Name={company.name}")

        return company

    @staticmethod
    def get_reports_from_db(db: Session, company_id: int) -> List[Report]:
        """Получить отчеты компании из БД"""
        reports = db.query(Report).filter(
            Report.company_id == company_id
        ).order_by(Report.year).all()

        print(f"Поиск отчетов для company_id {company_id}: найдено {len(reports)} отчетов")
        for report in reports:
            print(f"  Отчет за {report.year}: выручка={report.revenue_cur}, прибыль={report.net_profit_cur}")

        return reports

    @staticmethod
    def get_similar_companies(db: Session, okved: str, current_inn: str, limit: int = 10) -> List[Company]:
        """Получить похожие компании по ОКВЭД"""
        if not okved:
            return []

        current_inn_clean = current_inn.strip()

        similar = db.query(Company).filter(
            or_(
                Company.okved.like(f"%{okved}%"),
                Company.okved_o.like(f"%{okved}%")
            ),
            Company.inn != current_inn_clean,
            # НОВОЕ: Исключаем организации с ИНН, заканчивающимся на .0
            not_(Company.inn.like('%.0'))
        ).order_by(Company.name).limit(limit).all()

        print(f"Поиск похожих компаний по ОКВЭД {okved}: найдено {len(similar)} компаний")

        return similar