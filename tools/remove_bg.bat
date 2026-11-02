@echo off
setlocal
if exist "%~dp0..\.venv\Scripts\python.exe" (
    "%~dp0..\.venv\Scripts\python.exe" "%~dp0remove_bg.py" %*
) else (
    python "%~dp0remove_bg.py" %*
)
