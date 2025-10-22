@echo off
REM Startup script for Business Plan Generator Web UI (Windows)

echo ======================================
echo Business Plan Generator - Web UI
echo ======================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/upgrade dependencies
echo Installing dependencies...
pip install -q -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo.
    echo WARNING: .env file not found!
    echo Please create a .env file with your API keys.
    echo Example:
    echo   ANTHROPIC_API_KEY=your-key-here
    echo.
    pause
)

REM Start the Flask application
echo.
echo Starting web server...
echo.
python app.py
