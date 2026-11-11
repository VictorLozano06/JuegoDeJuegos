@echo off
title Dev Empire 3D - Servidor del Juego
echo ========================================================
echo   Iniciando Dev Empire 3D...
echo ========================================================

cd /d "%~dp0"

set "NODE_BIN="
for /f "delims=" %%I in ('dir /b /s "C:\Users\Raul\AppData\Local\OpenAI\Codex\runtimes\cua_node\node.exe" 2^>nul') do (
    set "NODE_BIN=%%I"
    goto :found_node
)

where node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_BIN=node"
    goto :found_node
)

:found_node
if "%NODE_BIN%"=="" (
    echo [ERROR] No se ha encontrado node.exe en el sistema.
    pause
    exit /b 1
)

echo Servidor preparado. Abriendo navegador en http://127.0.0.1:5173/ ...
start "" "http://127.0.0.1:5173/"
"%NODE_BIN%" node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173

