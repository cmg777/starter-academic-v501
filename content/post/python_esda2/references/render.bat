@echo off
REM One-click render wrapper for Windows. Double-click in Explorer, or run
REM from a terminal: render.bat
REM
REM Order matters: setup_env.py creates the .venv and registers the Jupyter
REM kernel BEFORE Quarto looks them up. QUARTO_PYTHON pins Quarto's Jupyter
REM discovery to the bundle's .venv so it sees the kernel regardless of what
REM python on the user's PATH points at.

setlocal
cd /d "%~dp0"

python setup_env.py || exit /b 1

set "QUARTO_PYTHON=%CD%\.venv\Scripts\python.exe"
quarto render tutorial.qmd || exit /b 1

start "" tutorial.html
endlocal
