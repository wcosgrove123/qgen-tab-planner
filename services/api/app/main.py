# services/api/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import questionnaires, tabplans, banners, reports, health
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Market Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:1776",
        "http://localhost:1776",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(questionnaires.router, prefix="/api/v1")
app.include_router(tabplans.router, prefix="/api/v1")
app.include_router(banners.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")

@app.get("/api/v1/health")
def health(): return {"ok": True}