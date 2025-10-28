# CI/CD Setup Guide

## 🔧 Setup Requirements

### 1. DockerHub Account

- Tạo account tại [hub.docker.com](https://hub.docker.com)
- Tạo repository mới (ví dụ: `your-username/shopacc-backend`)
- Tạo Access Token: Settings → Security → New Access Token

### 2. VPS Server

- Ubuntu 20.04+ (recommended)
- Minimum 1GB RAM, 1 CPU
- SSH access with key authentication

### 3. GitHub Repository Secrets

Vào GitHub repo → Settings → Secrets and variables → Actions, thêm các secrets sau:

#### DockerHub Secrets:

```
DOCKERHUB_USERNAME=your_dockerhub_username
DOCKERHUB_TOKEN=your_dockerhub_access_token
```

#### VPS Secrets:

```
VPS_HOST=your_vps_ip_address
VPS_USERNAME=your_vps_username
VPS_SSH_KEY=your_private_ssh_key_content
VPS_PORT=22
```

## 🚀 Deployment Setup

### Step 1: Setup VPS

1. Copy `vps-setup.sh` to your VPS:

```bash
scp vps-setup.sh user@your-vps-ip:/tmp/
```

2. Run setup script on VPS:

```bash
ssh user@your-vps-ip
chmod +x /tmp/vps-setup.sh
/tmp/vps-setup.sh
```

3. Edit environment variables:

```bash
sudo nano /opt/shopacc-backend/.env
```

### Step 2: Update Configuration Files

1. **Update GitHub Actions workflow** (`.github/workflows/ci-cd.yml`):
   - Replace `your-dockerhub-username/shopacc-backend` with your actual DockerHub repo

2. **Update docker-compose.prod.yml**:
   - Replace `your-dockerhub-username/shopacc-backend:latest` with your actual image name

3. **Update vps-setup.sh**:
   - Replace GitHub repo URL with your actual repo

### Step 3: Test Deployment

1. Push code to main/master branch:

```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

2. Check GitHub Actions:
   - Go to your repo → Actions tab
   - Monitor the workflow progress

3. Check VPS deployment:

```bash
ssh user@your-vps-ip
cd /opt/shopacc-backend
docker-compose logs -f
```

## 📋 Workflow Explanation

### 1. **Test Job**

- Checkout code
- Setup Node.js
- Install dependencies
- Run tests and linting

### 2. **Build and Push Job** (only on push)

- Build Docker image
- Push to DockerHub with multiple tags:
  - `latest` (for main branch)
  - `branch-name` (for branch pushes)
  - `branch-sha` (unique commit identifier)

### 3. **Deploy Job** (only on main/master push)

- SSH into VPS
- Pull latest Docker image
- Stop old containers
- Start new containers
- Clean up old images

## 🔍 Monitoring and Troubleshooting

### Check deployment status:

```bash
# On VPS
cd /opt/shopacc-backend
docker-compose ps
docker-compose logs -f
```

### Manual deployment:

```bash
# On VPS
cd /opt/shopacc-backend
docker-compose pull
docker-compose up -d
```

### Rollback to previous version:

```bash
# On VPS
cd /opt/shopacc-backend
docker-compose down
docker run -d --name temp-backend -p 5002:5000 your-username/shopacc-backend:previous-tag
```

## 🛡️ Security Best Practices

1. **Use SSH keys** instead of passwords
2. **Setup firewall** to only allow necessary ports
3. **Regular system updates** on VPS
4. **Monitor logs** for suspicious activities
5. **Use secrets** for sensitive environment variables
6. **Enable 2FA** on DockerHub and GitHub accounts

## 🚨 Common Issues

### Build fails:

- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check GitHub Actions logs

### Deployment fails:

- Verify VPS connectivity
- Check SSH key format
- Verify DockerHub credentials
- Check VPS disk space

### Application not accessible:

- Check firewall settings (port 5002)
- Verify container is running
- Check environment variables
- Review application logs

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Check VPS system logs: `journalctl -u shopacc-backend`
3. Check container logs: `docker-compose logs -f`
4. Verify all secrets are set correctly in GitHub
