@echo off
title Dev Empire 3D - Multijugador
cd /d "%~dp0"
where npm.cmd >nul 2>nul
if errorlevel 1 (
    echo Instala Node.js para iniciar el servidor de Dev Empire 3D.
    pause
    exit /b 1
)
call npm run build
if errorlevel 1 (
    echo No se pudo preparar el juego. Si faltan dependencias, ejecuta npm ci.
    pause
    exit /b 1
)
call npm run online:host
pause
