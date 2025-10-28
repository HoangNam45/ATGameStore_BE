@echo off
echo 🐳 Building and starting development environment...
echo.

REM Stop any existing containers
docker-compose -f docker-compose.dev.yml down

REM Build and start containers
docker-compose -f docker-compose.dev.yml up --build

echo.
echo ✅ Development server started!
echo 🌐 Server is running at: http://localhost:5000
echo 📋 Press Ctrl+C to stop