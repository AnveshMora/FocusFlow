@echo off
REM FocusFlow Frontend Setup Script (Batch)
REM This script creates the complete frontend directory structure

setlocal enabledelayedexpansion

set "PROJECT_ROOT=E:\github\FocusFlow"
set "FRONTEND_ROOT=%PROJECT_ROOT%\frontend"
set "SRC_ROOT=%FRONTEND_ROOT%\src"

echo.
echo Creating FocusFlow frontend directory structure...
echo.

REM Create all directories
mkdir "%SRC_ROOT%\types" >nul 2>&1
mkdir "%SRC_ROOT%\store" >nul 2>&1
mkdir "%SRC_ROOT%\services\api" >nul 2>&1
mkdir "%SRC_ROOT%\hooks" >nul 2>&1
mkdir "%SRC_ROOT%\components\common" >nul 2>&1
mkdir "%SRC_ROOT%\components\timeline" >nul 2>&1
mkdir "%SRC_ROOT%\components\widgets" >nul 2>&1
mkdir "%SRC_ROOT%\components\modals" >nul 2>&1
mkdir "%SRC_ROOT%\components\timer" >nul 2>&1
mkdir "%SRC_ROOT%\pages\auth" >nul 2>&1
mkdir "%SRC_ROOT%\pages\home" >nul 2>&1
mkdir "%SRC_ROOT%\pages\activity" >nul 2>&1
mkdir "%SRC_ROOT%\pages\analytics" >nul 2>&1
mkdir "%SRC_ROOT%\pages\schedule" >nul 2>&1
mkdir "%SRC_ROOT%\pages\settings" >nul 2>&1
mkdir "%SRC_ROOT%\styles" >nul 2>&1

echo [+] All directories created successfully

echo.
echo Verifying directory structure...
echo.
tree "%FRONTEND_ROOT%\src" /f

echo.
echo Frontend structure setup complete!
echo.
pause
