@echo off
title AthleteBridge - Backend API (FastAPI)
cd /d "%~dp0backend"
echo ========================================================
echo Starting AthleteBridge Backend API on http://127.0.0.1:8000
echo ========================================================
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
