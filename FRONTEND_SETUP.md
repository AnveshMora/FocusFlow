# FocusFlow Frontend Setup Guide

Due to environment permission restrictions, I've created automated setup scripts for you. Follow one of the methods below to create the frontend directory structure.

## Method 1: PowerShell Script (Recommended)

1. Open PowerShell as Administrator
2. Navigate to the project directory:
   ```powershell
   cd E:\github\FocusFlow
   ```
3. Run the setup script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File setup-frontend.ps1
   ```

This script will:
- Create all 16 frontend directories
- Create the package.json file with all dependencies
- Verify the structure was created correctly

## Method 2: Batch Script

1. Open Command Prompt (cmd.exe) as Administrator
2. Navigate to the project directory:
   ```cmd
   cd /d E:\github\FocusFlow
   ```
3. Run the setup script:
   ```cmd
   setup-frontend.bat
   ```

## Method 3: Manual Directory Creation

If you prefer to create directories manually:

```powershell
# From PowerShell
$dirs = @(
    "E:\github\FocusFlow\frontend\src\types",
    "E:\github\FocusFlow\frontend\src\store",
    "E:\github\FocusFlow\frontend\src\services\api",
    "E:\github\FocusFlow\frontend\src\hooks",
    "E:\github\FocusFlow\frontend\src\components\common",
    "E:\github\FocusFlow\frontend\src\components\timeline",
    "E:\github\FocusFlow\frontend\src\components\widgets",
    "E:\github\FocusFlow\frontend\src\components\modals",
    "E:\github\FocusFlow\frontend\src\components\timer",
    "E:\github\FocusFlow\frontend\src\pages\auth",
    "E:\github\FocusFlow\frontend\src\pages\home",
    "E:\github\FocusFlow\frontend\src\pages\activity",
    "E:\github\FocusFlow\frontend\src\pages\analytics",
    "E:\github\FocusFlow\frontend\src\pages\schedule",
    "E:\github\FocusFlow\frontend\src\pages\settings",
    "E:\github\FocusFlow\frontend\src\styles"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force
}
```

## Step 2: Create package.json

After the directories are created:

1. Copy the content from `package.json.template` to `frontend\package.json`
2. Or run from PowerShell:
   ```powershell
   Copy-Item E:\github\FocusFlow\package.json.template E:\github\FocusFlow\frontend\package.json
   ```

## Directory Structure

Once setup is complete, you'll have:

```
frontend/
├── src/
│   ├── types/
│   ├── store/
│   ├── services/
│   │   └── api/
│   ├── hooks/
│   ├── components/
│   │   ├── common/
│   │   ├── timeline/
│   │   ├── widgets/
│   │   ├── modals/
│   │   └── timer/
│   ├── pages/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── activity/
│   │   ├── analytics/
│   │   ├── schedule/
│   │   └── settings/
│   └── styles/
└── package.json
```

## Next Steps

After setup:

1. Navigate to frontend directory:
   ```bash
   cd E:\github\FocusFlow\frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

- **PowerShell execution policy error**: Use `-ExecutionPolicy Bypass` flag as shown above
- **Access denied**: Run Command Prompt or PowerShell as Administrator
- **Missing Node.js**: Ensure Node.js is installed and accessible in PATH

Files created for setup:
- `setup-frontend.ps1` - PowerShell setup script
- `setup-frontend.bat` - Batch setup script  
- `package.json.template` - Package.json template (copy to frontend/package.json)
