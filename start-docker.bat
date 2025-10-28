@echo off
REM Build and run the Docker container for production

echo 🐳 Building Docker image...
docker build -t image-upload-server .

echo 🚀 Starting container...
docker run -d ^
  --name image-upload-server ^
  -p 5000:5000 ^
  -e NODE_ENV=production ^
  -e FRONTEND_URL=http://localhost:3000 ^
  -v uploads_data:/app/uploads ^
  image-upload-server

echo ✅ Container started successfully!
echo 🌐 Server is running at: http://localhost:5000
echo.
echo 📋 Useful commands:
echo   View logs: docker logs image-upload-server
echo   Stop container: docker stop image-upload-server
echo   Remove container: docker rm image-upload-server
echo   Remove image: docker rmi image-upload-server