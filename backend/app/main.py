# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import companies
from app.core.config import settings
from app.core.database import init_database

app = FastAPI(
    title="Company Analytics API",
    description="API для анализа российских предприятий",
    version="2.0.0"
)

# Создаем таблицы при запуске
@app.on_event("startup")
async def startup_event():
    init_database()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])

@app.get("/")
async def root():
    return {"message": "Company Analytics API v2.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0"}