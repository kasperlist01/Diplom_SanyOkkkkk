from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Report(Base):
    __tablename__ = "report"

    report_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.company_id"), nullable=False)
    year = Column(Integer, nullable=False)

    # Актив
    intangible_assets_eoy = Column(Float)
    intangible_assets_poy = Column(Float)
    curr_assets_eoy = Column(Float)
    curr_assets_poy = Column(Float)
    balance_assets_eoy = Column(Float)
    balance_assets_poy = Column(Float)

    # Капитал и результаты
    retained_earnings_eoy = Column(Float)
    retained_earnings_poy = Column(Float)
    equity_eoy = Column(Float)
    equity_poy = Column(Float)

    # Обязательства
    lt_liabilities_eoy = Column(Float)
    lt_liabilities_poy = Column(Float)
    st_liabilities_eoy = Column(Float)
    st_liabilities_poy = Column(Float)
    balance_liab_eoy = Column(Float)
    balance_liab_poy = Column(Float)

    # Отчет о фин. результатах
    revenue_cur = Column(Float)
    revenue_prev = Column(Float)
    gross_profit_cur = Column(Float)
    gross_profit_prev = Column(Float)
    oper_profit_cur = Column(Float)
    oper_profit_prev = Column(Float)
    pbt_cur = Column(Float)
    pbt_prev = Column(Float)
    income_tax_cur = Column(Float)
    income_tax_prev = Column(Float)
    net_profit_cur = Column(Float)
    net_profit_prev = Column(Float)

    # Relationship with company
    company = relationship("Company", back_populates="reports")