from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class CompanyBase(BaseModel):
    name: str
    inn: str
    okved: Optional[str] = None
    okved_o: Optional[str] = None


class CompanySearch(CompanyBase):
    company_id: int
    location: Optional[str] = None

    class Config:
        from_attributes = True
        # Добавляем валидацию полей
        str_strip_whitespace = True


class CompanyDetail(BaseModel):
    # Основная информация из БД
    company_id: int
    name: str
    inn: str
    okved: Optional[str] = None
    okved_o: Optional[str] = None
    location: Optional[str] = None

    # Данные из API DataNewton
    full_name: Optional[str] = None
    ogrn: Optional[str] = None
    kpp: Optional[str] = None
    opf: Optional[str] = None
    address: Optional[str] = None
    registration_date: Optional[str] = None
    charter_capital: Optional[str] = None
    status: Optional[Dict[str, Any]] = None
    owners: Optional[Dict[str, Any]] = None
    managers: Optional[List[Dict[str, Any]]] = None
    tax_mode_info: Optional[Dict[str, Any]] = None

    # Данные из RusProfile
    rusprofile_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class FinancialReport(BaseModel):
    year: int
    revenue_cur: Optional[float] = None
    gross_profit_cur: Optional[float] = None
    oper_profit_cur: Optional[float] = None
    net_profit_cur: Optional[float] = None
    balance_assets_eoy: Optional[float] = None
    equity_eoy: Optional[float] = None

    class Config:
        from_attributes = True


class CompanyAnalytics(BaseModel):
    company: CompanyDetail
    reports: List[FinancialReport]
    chart_data: Dict[str, Any]
    similar_companies: List[CompanySearch]