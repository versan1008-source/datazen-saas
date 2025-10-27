# DataZen Local Development Startup Script
# Starts both backend and frontend servers for local testing

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Both
)

# Default to both if no parameters specified
if (-not $Backend -and -not $Frontend -and -not $Both) {
    $Both = $true
}

$BackendPath = ".\backend"
$FrontendPath = ".\frontend"

Write-Host "🚀 DataZen Local Development Startup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "📦 Starting Backend Server..." -ForegroundColor Green
    Write-Host "Location: $BackendPath" -ForegroundColor Gray
    
    # Check if virtual environment exists
    if (-not (Test-Path "$BackendPath\.venv")) {
        Write-Host "⚠️  Virtual environment not found. Creating..." -ForegroundColor Yellow
        cd $BackendPath
        python -m venv .venv
        cd ..
    }
    
    # Activate virtual environment
    & "$BackendPath\.venv\Scripts\Activate.ps1"
    
    # Check if requirements are installed
    Write-Host "Checking dependencies..." -ForegroundColor Gray
    pip install -q -r "$BackendPath\requirements.txt" 2>$null
    
    # Start backend
    Write-Host "✅ Backend starting on http://localhost:8000" -ForegroundColor Green
    Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Green
    Write-Host ""
    
    cd $BackendPath
    python main.py
}

# Function to start frontend
function Start-Frontend {
    Write-Host "⚛️  Starting Frontend Server..." -ForegroundColor Blue
    Write-Host "Location: $FrontendPath" -ForegroundColor Gray
    
    # Check if node_modules exists
    if (-not (Test-Path "$FrontendPath\node_modules")) {
        Write-Host "⚠️  Dependencies not found. Installing..." -ForegroundColor Yellow
        cd $FrontendPath
        npm install
        cd ..
    }
    
    # Start frontend
    Write-Host "✅ Frontend starting on http://localhost:3000" -ForegroundColor Blue
    Write-Host ""
    
    cd $FrontendPath
    npm run dev
}

# Main execution
if ($Both) {
    Write-Host "Starting both backend and frontend..." -ForegroundColor Cyan
    Write-Host ""
    
    # Start backend in a new window
    Write-Host "Opening backend in new window..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; & '$PSScriptRoot\START_LOCAL_DEV.ps1' -Backend"
    
    # Wait a moment for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend in current window
    Start-Frontend
}
elseif ($Backend) {
    Start-Backend
}
elseif ($Frontend) {
    Start-Frontend
}

Write-Host ""
Write-Host "🎉 Development servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Testing Guide: See PHONE_NUMBERS_TESTING_GUIDE.md" -ForegroundColor Cyan

