@echo off
echo 📋 Development Environment Status
echo.

echo 🐳 Docker containers:
docker-compose -f docker-compose.dev.yml ps

echo.
echo 📊 Recent logs:
docker-compose -f docker-compose.dev.yml logs --tail=20

echo.
echo 📋 Useful commands:
echo   Full logs: docker-compose -f docker-compose.dev.yml logs -f
echo   Restart: docker-compose -f docker-compose.dev.yml restart
echo   Stop: docker-compose -f docker-compose.dev.yml down