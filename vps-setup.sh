#!/bin/bash

# VPS Setup Script for ShopAcc Backend
# Run this script on your VPS to setup the deployment environment

set -e

echo "🚀 Setting up ShopAcc Backend on VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose already installed"
fi

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/shopacc-backend
sudo chown $USER:$USER /opt/shopacc-backend
cd /opt/shopacc-backend

# Clone repository (replace with your repo URL)
echo "📥 Cloning repository..."
if [ ! -d ".git" ]; then
    git clone https://github.com/nhhnam/shopacc-backend.git .
else
    git pull origin main
fi

# Create .env file
echo "⚙️ Creating environment file..."
cat > .env << EOF
# Copy your production environment variables here
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://at-game-store-fe-v2mo.vercel.app

# Add all your other environment variables here
# FIREBASE_API_KEY=...
# FIREBASE_AUTH_DOMAIN=...
# etc.
EOF

echo "📝 Please edit /opt/shopacc-backend/.env with your production environment variables"

# Create systemd service for auto-restart
echo "🔄 Creating systemd service..."
sudo tee /etc/systemd/system/shopacc-backend.service > /dev/null << EOF
[Unit]
Description=ShopAcc Backend
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/shopacc-backend
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable shopacc-backend

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 5002/tcp
sudo ufw --force enable

echo "✅ VPS setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit /opt/shopacc-backend/.env with your production environment variables"
echo "2. Update docker-compose.prod.yml with your DockerHub image name"
echo "3. Setup GitHub Secrets for CI/CD"
echo "4. Push code to trigger deployment"
echo ""
echo "🔧 Useful commands:"
echo "  Start service: sudo systemctl start shopacc-backend"
echo "  Stop service: sudo systemctl stop shopacc-backend"
echo "  Check logs: cd /opt/shopacc-backend && docker-compose logs -f"
echo "  Check status: cd /opt/shopacc-backend && docker-compose ps"