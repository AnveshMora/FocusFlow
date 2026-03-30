@echo off
REM Create FocusFlow Frontend Directory Structure

set BASE_PATH=E:\github\FocusFlow\frontend\src

REM Create base directory
if not exist "%BASE_PATH%" mkdir "%BASE_PATH%"

REM Create all subdirectories
mkdir "%BASE_PATH%\types"
mkdir "%BASE_PATH%\store"
mkdir "%BASE_PATH%\services\api"
mkdir "%BASE_PATH%\hooks"
mkdir "%BASE_PATH%\components\common"
mkdir "%BASE_PATH%\components\timeline"
mkdir "%BASE_PATH%\components\widgets"
mkdir "%BASE_PATH%\components\modals"
mkdir "%BASE_PATH%\components\timer"
mkdir "%BASE_PATH%\pages\auth"
mkdir "%BASE_PATH%\pages\home"
mkdir "%BASE_PATH%\pages\activity"
mkdir "%BASE_PATH%\pages\analytics"
mkdir "%BASE_PATH%\pages\schedule"
mkdir "%BASE_PATH%\pages\settings"
mkdir "%BASE_PATH%\styles"

echo.
echo ✓ Directory creation complete!
echo.
echo Listing created directories:
echo.
dir /S /B "%BASE_PATH%"

pause
