@echo off
echo 🛑 Stopping development environment...

docker-compose -f docker-compose.dev.yml down

echo ✅ Development server stopped!