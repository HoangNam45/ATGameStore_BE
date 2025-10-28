@echo off
echo 🐳 Building and starting development environment in background...
echo.

REM Stop any existing containers
docker-compose -f docker-compose.dev.yml down

REM Build and start containers in background
docker-compose -f docker-compose.dev.yml up -d --build

echo.
echo ✅ Development server started in background!
echo 🌐 Server is running at: http://localhost:5000
echo.
echo 📋 Useful commands:
echo   View logs: docker-compose -f docker-compose.dev.yml logs -f
echo   Stop server: docker-compose -f docker-compose.dev.yml down
echo   Restart: docker-compose -f docker-compose.dev.yml restart