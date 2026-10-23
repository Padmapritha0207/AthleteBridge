import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal, ensure_schema_columns
from .seed import seed_database
from .routers import (
    auth, profile, schedule, coaches, opportunities,
    scholarships, support, progress, fuel_recovery,
    mindstrong, community, staff
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and seed initial data
    Base.metadata.create_all(bind=engine)
    ensure_schema_columns(engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="ATHLETEBRIDGE API — Inclusive Athlete Development Platform",
    description="One platform for every athlete. Personalized support for every ability.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for local development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(schedule.router)
app.include_router(coaches.router)
app.include_router(opportunities.router)
app.include_router(scholarships.router)
app.include_router(support.router)
app.include_router(progress.router)
app.include_router(fuel_recovery.router)
app.include_router(mindstrong.router)
app.include_router(community.router)
app.include_router(staff.router)

@app.get("/")
def root():
    return {
        "platform": "ATHLETEBRIDGE — Inclusive Athlete Development Platform",
        "tagline": "One platform for every athlete. Personalized support for every ability.",
        "status": "online",
        "environment": "prototype_demo",
        "docs_url": "/docs",
        "demo_disclaimer": "All seed listings, coaches, and scholarships are synthetic demo data."
    }

@app.get("/health")
def healthcheck():
    return {"status": "healthy", "database": "connected"}
