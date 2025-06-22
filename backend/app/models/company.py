from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class Company(Base):
    __tablename__ = "company"

    company_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    inn = Column(String, nullable=False, index=True, unique=True)
    okved = Column(String)
    okved_o = Column(String)
    kod_re = Column(String)  # Код региона

    # Связь с отчетами
    reports = relationship("Report", back_populates="company")