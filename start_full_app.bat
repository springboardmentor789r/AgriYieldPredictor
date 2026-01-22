@echo off
title Agricultural Analytics Dashboard

echo ========================================
echo  Agricultural Analytics Dashboard
echo ========================================
echo.
echo Starting both Backend and Frontend...
echo.

REM Change to the project directory
cd /d "d:\BTech\Infosys-SpringBoard-Internship\FASTAPIDEMO"

REM Activate virtual environment
echo Activating virtual environment...
call myenv\Scripts\activate.bat

REM Start backend in background
echo Starting FastAPI Backend...
start "Backend Server" cmd /k "cd backend && python main.py"

REM Wait a moment for backend to start
timeout /t 5 /nobreak > nul

REM Start frontend
echo Starting React Frontend...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo  🚀 SERVERS STARTING...
echo  📡 Backend API: http://localhost:8000
echo  🌐 Frontend UI: http://localhost:3000
echo  📊 API Docs: http://localhost:8000/docs
echo  
echo  📓 Analysis Notebooks:
echo  🌾 crop_yield/Crop_Yield_Analysis.ipynb
echo  📈 time_series/Time_Series_Analysis.ipynb
echo ========================================
echo.
echo ⏳ Please wait for both servers to fully start...
echo 🌐 The frontend will open automatically in your browser
echo.

pause