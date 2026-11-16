@echo off
rem Lexio 乐词 - portable launcher (double-click to run, no install needed)
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0portable-server.ps1"
pause
