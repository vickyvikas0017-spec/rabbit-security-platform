# Rabbit Security Assessment Platform - Windows Launch Script
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "       RABBIT SECURITY ASSESSMENT PLATFORM (v1.0)" -ForegroundColor Cyan
Write-Host "  Rabbit Pvt. Ltd. Minor Project Practical Cybersecurity Assessment" -ForegroundColor White
Write-Host "=============================================================" -ForegroundColor Cyan

# Set environment paths for Node and Nmap if present
$NodePath = "C:\Users\VIKAS VICKY\AppData\Local\Programs\nodejs"
$NmapPath = "C:\Users\VIKAS VICKY\AppData\Local\Programs\nmap"
$PyScripts = "C:\Users\VIKAS VICKY\AppData\Local\Programs\Python\Python313\Scripts"

if (Test-Path $NodePath) { $env:PATH = "$NodePath;" + $env:PATH }
if (Test-Path $NmapPath) { $env:PATH = "$NmapPath;" + $env:PATH }
if (Test-Path $PyScripts) { $env:PATH = "$PyScripts;" + $env:PATH }

# Verify Python
Write-Host "`n[*] Verifying Python runtime..." -ForegroundColor Yellow
py -c "import sys; print('Python', sys.version.split()[0])"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Python is required. Please install Python 3.10+." -ForegroundColor Red
    exit 1
}

# Install / update backend dependencies
Write-Host "[*] Checking Python dependencies..." -ForegroundColor Yellow
py -m pip install -r backend/requirements.txt --quiet --no-warn-script-location

# Check if frontend dist exists, if not build it
if (-not (Test-Path "frontend/dist/index.html")) {
    Write-Host "[*] Frontend production build not found. Building with Vite..." -ForegroundColor Yellow
    Set-Location frontend
    npm run build
    Set-Location ..
}

Write-Host "`n[+] Starting Rabbit Security Assessment Platform Server..." -ForegroundColor Green
Write-Host "[+] Local URL: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "[+] API Docs:  http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "`n[*] Press Ctrl+C in this terminal to shut down the server.`n" -ForegroundColor Gray

# Open default browser
Start-Process "http://127.0.0.1:8000"

# Launch FastAPI app with Uvicorn
py -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

