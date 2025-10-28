# GitHub Secrets Setup Guide

## 🔑 Required GitHub Secrets

Vào GitHub repository → Settings → Secrets and variables → Actions, thêm các secrets sau:

### DockerHub Secrets:

```
DOCKERHUB_USERNAME=nhhnam
DOCKERHUB_TOKEN=your_dockerhub_access_token
```

### VPS Secrets:

```
VPS_HOST=163.223.8.130
VPS_USERNAME=root
VPS_SSH_KEY=your_private_ssh_key_content
VPS_PORT=22
```

## 🔧 Cách lấy DockerHub Token:

1. Đăng nhập vào [hub.docker.com](https://hub.docker.com)
2. Vào Account Settings → Security
3. Click "New Access Token"
4. Đặt tên token (ví dụ: "github-actions")
5. Chọn permissions: Read, Write, Delete
6. Copy token và paste vào GitHub Secret `DOCKERHUB_TOKEN`

## 🔐 Cách tạo SSH Key:

### Option 1: Sử dụng SSH Key có sẵn

Nếu bạn đã có SSH key để connect vào VPS:

```bash
# Copy private key content
cat ~/.ssh/id_rsa
```

### Option 2: Tạo SSH Key mới cho CI/CD

```bash
# Tạo SSH key mới
ssh-keygen -t rsa -b 4096 -C "github-actions@shopacc" -f ~/.ssh/shopacc_deploy

# Copy public key lên VPS
ssh-copy-id -i ~/.ssh/shopacc_deploy.pub root@163.223.8.130

# Copy private key content để paste vào GitHub Secret
cat ~/.ssh/shopacc_deploy
```

## 📋 VPS Setup Commands:

### 1. Upload setup script lên VPS:

```bash
scp vps-quick-setup.sh root@163.223.8.130:/tmp/
```

### 2. SSH vào VPS và chạy setup:

```bash
ssh root@163.223.8.130
chmod +x /tmp/vps-quick-setup.sh
/tmp/vps-quick-setup.sh
```

### 3. Kiểm tra setup:

```bash
cd /opt/shopacc-backend
./status.sh
```

## 🚀 Test Deployment:

1. **Setup GitHub Secrets** (như hướng dẫn trên)

2. **Push code để trigger CI/CD:**

```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

3. **Monitor deployment:**
   - GitHub: Actions tab để xem build progress
   - VPS: `ssh root@163.223.8.130 && cd /opt/shopacc-backend && ./status.sh`

4. **Test application:**
   - URL: http://163.223.8.130:5002
   - Health check: http://163.223.8.130:5002/health

## 🛠️ VPS Management Commands:

```bash
# SSH vào VPS
ssh root@163.223.8.130

# Check application status
cd /opt/shopacc-backend && ./status.sh

# Start application
./start.sh

# Stop application
./stop.sh

# Update application (manual)
./update.sh

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔍 Troubleshooting:

### Build fails:

- Check GitHub Actions logs
- Verify DockerHub credentials

### Deploy fails:

- Check SSH connection: `ssh root@163.223.8.130`
- Verify VPS has Docker installed
- Check VPS disk space: `df -h`

### Application not accessible:

- Check container status: `docker ps`
- Check firewall: `ufw status`
- Check logs: `docker-compose logs -f`

## 📞 Quick Reference:

- **DockerHub Repository:** https://hub.docker.com/r/nhnam/shopacc-backend
- **VPS IP:** 163.223.8.130
- **Application Port:** 5002
- **Application URL:** http://163.223.8.130:5002
- **VPS User:** root
- **App Directory:** /opt/shopacc-backend
