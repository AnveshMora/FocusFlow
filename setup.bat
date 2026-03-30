@echo off
REM FocusFlow Project Setup Script
REM Creates all necessary directories and initial configuration

echo Creating project structure...

REM Create backend directories
mkdir backend\src\types
mkdir backend\src\models
mkdir backend\src\controllers
mkdir backend\src\routes
mkdir backend\src\middleware
mkdir backend\src\utils
mkdir backend\src\services
mkdir backend\migrations
mkdir backend\seeds
mkdir backend\dist

REM Create frontend directories
mkdir frontend\src\pages\auth
mkdir frontend\src\pages\home
mkdir frontend\src\pages\settings
mkdir frontend\src\components\common
mkdir frontend\src\components\timeline
mkdir frontend\src\components\widgets
mkdir frontend\src\components\modal
mkdir frontend\src\services\api
mkdir frontend\src\store
mkdir frontend\src\hooks
mkdir frontend\src\types
mkdir frontend\src\styles
mkdir frontend\public
mkdir frontend\dist

REM Create shared directories
mkdir docs
mkdir tests

echo.
echo ✅ All directories created successfully!
echo.
echo Next steps:
echo 1. Copy backend files to backend/src/
echo 2. Copy frontend files to frontend/src/
echo 3. Install dependencies: npm install (in each directory)
echo 4. Set up database
echo 5. Start dev servers
