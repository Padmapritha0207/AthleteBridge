@echo off
title AthleteBridge Platform Launcher
echo ========================================================
echo Launching ATHLETEBRIDGE: Inclusive Athlete Development Platform
echo ========================================================
echo Starting Backend API and Frontend in separate windows...
start "AthleteBridge Backend" "%~dp0run_backend.bat"
start "AthleteBridge Frontend" "%~dp0run_frontend.bat"
echo.
echo Both servers have been launched!
echo Open your browser at: http://127.0.0.1:5173
echo.
timeout /t 5
