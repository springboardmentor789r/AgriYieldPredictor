@echo off
setlocal

REM Resolve this script's directory (with trailing backslash)
set SCRIPT_DIR=%~dp0

set BACKEND_DIR="%SCRIPT_DIR%fastapi"
set FRONTEND_DIR="%SCRIPT_DIR%frontend"

REM Start FastAPI (uvicorn) in a new terminal
start cmd /k "cd /d %BACKEND_DIR% && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Start Vite dev server in another terminal
start cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

endlocal 