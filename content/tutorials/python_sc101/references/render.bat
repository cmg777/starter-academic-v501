@echo off
REM One-click render wrapper for Windows. Double-click it in Explorer, or run it
REM from a terminal: render.bat
REM
REM The order matters: setup_env.py creates the .venv and registers the Jupyter
REM kernel BEFORE Quarto looks them up. QUARTO_PYTHON points the Jupyter discovery
REM of Quarto at the .venv of this bundle, so Quarto finds the kernel whatever
REM python the PATH points at.

setlocal
cd /d "%~dp0"

python setup_env.py || exit /b 1

set "QUARTO_PYTHON=%CD%\.venv\Scripts\python.exe"
quarto render tutorial.qmd || exit /b 1

start "" tutorial.html
endlocal
