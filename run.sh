#!/usr/bin/env bash
# Rabbit Security Assessment Platform - Linux/macOS Startup Script

echo -e "\033[1;36m=============================================================\033[0m"
echo -e "\033[1;36m       RABBIT SECURITY ASSESSMENT PLATFORM (v1.0)\033[0m"
echo -e "\033[1;37m  Rabbit Pvt. Ltd. Minor Project Practical Cybersecurity Assessment\033[0m"
echo -e "\033[1;36m=============================================================\033[0m"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "\033[1;31m[-] python3 could not be found. Please install Python 3.10+.\033[0m"
    exit 1
fi

echo -e "\033[1;33m[*] Installing/verifying backend dependencies...\033[0m"
python3 -m pip install -r backend/requirements.txt --quiet

# Check frontend dist
if [ ! -f "frontend/dist/index.html" ]; then
    echo -e "\033[1;33m[*] Building frontend with Vite...\033[0m"
    cd frontend && npm install && npm run build && cd ..
fi

echo -e "\n\033[1;32m[+] Starting Rabbit Security Assessment Platform...\033[0m"
echo -e "\033[1;36m[+] Platform URL: http://127.0.0.1:8000\033[0m"
echo -e "\033[1;36m[+] Interactive API Docs: http://127.0.0.1:8000/docs\033[0m"
echo -e "\033[0;37m[*] Press Ctrl+C to terminate the server.\033[0m\n"

# Open browser if available
if command -v xdg-open &> /dev/null; then
    xdg-open "http://127.0.0.1:8000" &
elif command -v open &> /dev/null; then
    open "http://127.0.0.1:8000" &
fi

python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

