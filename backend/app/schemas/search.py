from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.company import CompanySearch

class SearchParams(BaseModel):
    inn: Optional[str] = Field(None, description="ИНН компании")
    name: Optional[str] = Field(None, description="Название компании (регистронезависимый поиск)")
    okved: Optional[str] = Field(None, description="Код ОКВЭД (поиск по началу кода)")
    region: Optional[str] = Field(None, description="Код региона")

    class Config:
        # Автоматически обрезаем пробелы
        str_strip_whitespace = True

class SearchResponse(BaseModel):
    companies: List[CompanySearch]
    total: int