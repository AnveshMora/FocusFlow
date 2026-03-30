# FocusFlow Frontend Setup Script
# Run this script with administrator privileges: powershell -ExecutionPolicy Bypass -File setup-frontend.ps1

$projectRoot = "E:\github\FocusFlow"
$frontendRoot = Join-Path $projectRoot "frontend"
$srcRoot = Join-Path $frontendRoot "src"

# Create all directories
$directories = @(
    $frontendRoot,
    (Join-Path $srcRoot "types"),
    (Join-Path $srcRoot "store"),
    (Join-Path $srcRoot "services\api"),
    (Join-Path $srcRoot "hooks"),
    (Join-Path $srcRoot "components\common"),
    (Join-Path $srcRoot "components\timeline"),
    (Join-Path $srcRoot "components\widgets"),
    (Join-Path $srcRoot "components\modals"),
    (Join-Path $srcRoot "components\timer"),
    (Join-Path $srcRoot "pages\auth"),
    (Join-Path $srcRoot "pages\home"),
    (Join-Path $srcRoot "pages\activity"),
    (Join-Path $srcRoot "pages\analytics"),
    (Join-Path $srcRoot "pages\schedule"),
    (Join-Path $srcRoot "pages\settings"),
    (Join-Path $srcRoot "styles")
)

Write-Host "Creating frontend directory structure..." -ForegroundColor Green

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "✓ Already exists: $dir" -ForegroundColor Cyan
    }
}

# Create package.json
$packageJsonContent = @{
    name = "focusflow-frontend"
    version = "1.0.0"
    description = "FocusFlow - Pomodoro Timer with Timeline Visualization"
    type = "module"
    scripts = @{
        dev = "vite"
        build = "tsc && vite build"
        preview = "vite preview"
        lint = "tsc --noEmit"
    }
    dependencies = @{
        react = "^18.2.0"
        "react-dom" = "^18.2.0"
        zustand = "^4.4.0"
        axios = "^1.6.0"
        "react-router-dom" = "^6.20.0"
        "lucide-react" = "^0.292.0"
        recharts = "^2.10.0"
    }
    devDependencies = @{
        typescript = "^5.3.0"
        vite = "^5.0.0"
        "@vitejs/plugin-react" = "^4.2.0"
        tailwindcss = "^3.3.0"
        postcss = "^8.4.0"
        autoprefixer = "^10.4.0"
    }
} | ConvertTo-Json -Depth 10

$packageJsonPath = Join-Path $frontendRoot "package.json"
Set-Content -Path $packageJsonPath -Value $packageJsonContent -Encoding UTF8

Write-Host "`n✓ Created: $packageJsonPath" -ForegroundColor Green

# Verify structure
Write-Host "`nVerifying directory structure..." -ForegroundColor Green
Write-Host "`nDirectory listing:" -ForegroundColor Cyan
Get-ChildItem -Path $srcRoot -Recurse -Directory | Sort-Object FullName | ForEach-Object {
    $relativePath = $_.FullName.Substring($srcRoot.Length + 1)
    Write-Host "  $relativePath" -ForegroundColor Yellow
}

Write-Host "`nFrontend structure setup complete!" -ForegroundColor Green
Write-Host "Package.json location: $packageJsonPath" -ForegroundColor Cyan
