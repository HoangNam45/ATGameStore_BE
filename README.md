# Image Upload Server

Một server Express.js đơn giản để xử lý upload và quản lý ảnh.

## Tính năng

- ✅ Upload ảnh đơn lẻ
- ✅ Upload nhiều ảnh cùng lúc
- ✅ Xóa ảnh theo tên file
- ✅ Liệt kê tất cả ảnh đã upload
- ✅ Xem thông tin chi tiết ảnh
- ✅ Serve static files (truy cập ảnh qua URL)
- ✅ Giới hạn kích thước file (5MB)
- ✅ Lọc chỉ cho phép file ảnh (jpeg, jpg, png, gif, webp)
- ✅ Tạo tên file unique để tránh trùng lặp
- ✅ Docker support

## Cài đặt

### Cách 1: Chạy trực tiếp với Node.js

1. Clone hoặc tải project
2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

4. Chạy server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Cách 2: Chạy với Docker

#### Development mode:

```bash
# Option 1: Sử dụng env_file (RECOMMENDED - more secure)
docker-compose -f docker-compose.secure.dev.yml up --build

# Option 2: Hardcoded environment variables
docker-compose -f docker-compose.dev.yml up --build
```

#### Production mode:

```bash
# Option 1: Sử dụng env_file (RECOMMENDED - more secure)
docker-compose -f docker-compose.secure.yml up --build

# Option 2: Hardcoded environment variables
docker-compose -f docker-compose.yml up --build
```

**⚠️ Security Note**: Files `docker-compose.secure.yml` và `docker-compose.secure.dev.yml` sử dụng `env_file: .env` nên an toàn hơn vì không expose sensitive data trong docker-compose file.

#### Chạy với Docker commands:

```bash
# Build image
docker build -t image-upload-server .

# Chạy container
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e FRONTEND_URL=http://localhost:3000 \
  -v uploads_data:/app/uploads \
  image-upload-server
```

#### Dừng và dọn dẹp:

```bash
# Dừng containers
docker-compose down

# Dừng và xóa volumes
docker-compose down -v

# Xóa images
docker rmi image-upload-server
```

Server sẽ chạy tại: `http://localhost:5000`

## API Endpoints

### Upload ảnh đơn lẻ

```
POST /api/images/upload
Content-Type: multipart/form-data
Body: image (file)
```

**Response:**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "a1b2c3d4e5f6.jpg",
    "originalName": "my-photo.jpg",
    "size": 1024567,
    "url": "http://localhost:5000/uploads/a1b2c3d4e5f6.jpg"
  }
}
```

### Upload nhiều ảnh

```
POST /api/images/upload-multiple
Content-Type: multipart/form-data
Body: images[] (multiple files)
```

### Liệt kê tất cả ảnh

```
GET /api/images
```

### Xem thông tin ảnh

```
GET /api/images/:filename
```

### Xóa ảnh

```
DELETE /api/images/:filename
```

### Truy cập ảnh trực tiếp

```
GET /uploads/:filename
```

## Cấu hình

File `.env` có thể cấu hình:

- `PORT`: Port server (mặc định: 5000)
- `NODE_ENV`: Môi trường (development/production)
- `FRONTEND_URL`: URL frontend cho CORS
- `MAX_FILE_SIZE`: Kích thước file tối đa (mặc định: 5MB)
- `UPLOAD_PATH`: Thư mục lưu ảnh (mặc định: uploads/)
- `API_RATE_LIMIT`: Giới hạn request (mặc định: 100)
- `LOG_LEVEL`: Mức độ log (mặc định: info)

## Docker Features

### Multi-stage builds

- Production image được tối ưu với Node.js Alpine
- Development image hỗ trợ live reload với nodemon
- Security: Chạy với non-root user

### Volumes

- Persistent storage cho uploaded images
- Development: Mount source code cho live reload

### Health checks

- Container health monitoring
- Automatic restart on failure

### Environment configs

- Production và development environments riêng biệt
- Configurable qua environment variables

## Cấu trúc thư mục

```
my-app-be/
├── src/
│   ├── routes/
│   │   └── images.js          # API routes cho ảnh
│   ├── middleware/
│   │   ├── errorHandler.js    # Xử lý lỗi
│   │   └── notFound.js        # Xử lý 404
│   └── app.js                 # Express app setup
├── uploads/                   # Thư mục lưu ảnh
├── docker-compose.yml         # Production docker config
├── docker-compose.dev.yml     # Development docker config
├── Dockerfile                 # Production dockerfile
├── Dockerfile.dev             # Development dockerfile
├── .dockerignore              # Docker ignore file
├── healthcheck.js             # Health check script
├── server.js                  # Entry point
├── package.json
├── .env                       # Biến môi trường
└── README.md
```

## Testing với cURL

### Upload ảnh:

```bash
curl -X POST -F "image=@path/to/your/image.jpg" http://localhost:5000/api/images/upload
```

### Liệt kê ảnh:

```bash
curl http://localhost:5000/api/images
```

### Xóa ảnh:

```bash
curl -X DELETE http://localhost:5000/api/images/filename.jpg
```

## Lưu ý

- Server chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)
- Kích thước file tối đa là 5MB
- File được đổi tên ngẫu nhiên để tránh trung lặp
- Thư mục `uploads/` sẽ được tạo tự động nếu chưa tồn tại
- Docker volumes đảm bảo data persistence
- Health check endpoint: `/health`
