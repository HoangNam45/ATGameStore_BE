#!/bin/bash

# Quick VPS Setup for ShopAcc Backend
# IP: 163.223.8.130
# User: root

set -e

echo "🚀 Quick setup for ShopAcc Backend VPS (163.223.8.130)..."

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Create app directory
echo "📁 Setting up application directory..."
mkdir -p /opt/shopacc-backend
cd /opt/shopacc-backend

# Clone repository
echo "📥 Cloning repository..."
if [ ! -d ".git" ]; then
    git clone https://github.com/nhhnam/shopacc-backend.git .
else
    git pull origin main
fi

# Create environment file
echo "⚙️ Creating environment file..."
cat > .env << 'EOF'
# Production Environment Variables
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://at-game-store-fe-v2mo.vercel.app

# File Upload Configuration
MAX_FILE_SIZE=5MB
UPLOAD_PATH=uploads/

# Security
API_RATE_LIMIT=100

# Logging
LOG_LEVEL=info

# Firebase Configuration
FIREBASE_API_KEY=AIzaSyA0nLPiKT8hdEdATu7SslVsYLDafYItV7w
FIREBASE_AUTH_DOMAIN=gamestore-9fd3e.firebaseapp.com
FIREBASE_PROJECT_ID=gamestore-9fd3e
FIREBASE_STORAGE_BUCKET=gamestore-9fd3e.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=887415480611
FIREBASE_APP_ID=1:887415480611:web:ddd5d34734f44a779d2c96

# Firebase Admin SDK Configuration
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@gamestore-9fd3e.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCkwDZG4RwCcOlz\nrrEtc1iO286xffZI9lAIAVmO2V5Xdcp6MwVg+VvyMXs+UsWCEtHjhtQ46akgHqr8\npjg2pcH0Ykv0zL+xjmDbgxfBRueoMTvIu/AjC4T3Nv0W0rNMnei0ds3DtfjGyxEY\nCMlWxVQaY+nU2g8DM6oKHV0XMWrkgoKLNqbdF7YlgPezvx324sr/1mImN7cW762F\nZlGZ9aZBXm767ULLHn76oYKK69LJ577a0Y73eug9trSGZMRlQevjabcypF5sJuUq\nFT6hUKhw5sOb8e/9YYiZbY2RInAeZNibd4Kgg//NYLocnUjJQznwKw1BwKUmiOPN\n107j/wFdAgMBAAECggEAI6bMmA4Cp6yTeEsnYDSDx3Zdhh9B+owCyZixLq5vMfH1\nfPgpg9CySvjWOKhkwT8dWGVG64H07VR1n/LAW2MHU8EpurHMEbpDz3zQ2Sxk2Qq+\nazPwRUUq4uxtXFEAJ+ZMAzFqWZ25Vht/eXn9R9+v0X4pjbwaX5EAjOvJx0kUXppe\ncjUEToSAnzIJZWI9wlQmqSwII3FxXqa+o5L/jrfbL8Iphv4vq4MA1Sa//ngD5jlb\nZ05XrG1iLbLLDDUDfgT/hkfzAmk6YH5r9RxcPyGGAA5Zf4FGqV+q1AAK+dn2BcGQ\ntXLv6Co/r+rYCrEdc33POzPjZtufKQB1QvMrUrGFQQKBgQDYCEMqMq3ehN3uf3v7\nuB5Sa5ffcex3WGYomQ9vos7Yz8f9wdMGr5IV05/3PmLudccuVmLFH+uA/iJAqiCJ\nroUxiObI9EP49oM0Y5joNhJwzau0cnv04yE4vxCX+Iq+LfGJMsKwTT1Q5/Wck326\nu3oqmyzWj/xkOm8YwSdH3YVbOQKBgQDDOydbPlhiaM+lwNmx69eyENsrhvUPATc4\nINagqW8wXtOKOJDtMaF8+Dmph9Bwi3wyyMdUR5odXSqD+uFHZzIIKqZJk1IMsIHt\nSnggDu8iINwVKFPlwSUyEyLRPj+JOKA/uO58/wLQXBzPhwIqSvSofrTzmm0aUV/B\nGJfxQhnDRQKBgQCdSBauSEtx8EYr98DqmTfqRc9CrQy+Lyvhbt5gJqZ2D4DJbS4Y\ndgbjwTl7pn4cor8rK1Wpsv2g4mVJsxMRanAqikOMFtrODZukrsaKeaOfYP4b2CYL\nOrnbOK/6FMfeglCR1NUNyo5Tsy2Mm400QH5HOsbASAA3cJul6CqTFeKbcQKBgDLy\n6gdu0sQD1ETOekFraePncDsAwk1DJPT55OkSrpix9oS41GGCNUGWyf2LGwNz81qR\neStucDK/kIvW2hm3PaBR+Ql0b9It8gpKB+Vd4FxItQa0eoiYCivyQIDYvN4DsBZR\nHbPzHPnhQAeMlS0SWJzsTC7SmyxmFhYfY++rL2v9AoGBAM2wIdIq1GTqnVy9Ya2I\nG2X7BuTYn2InjE+tj0RRPr8kx/7u3cpVRwv9LKzTpYvtnhHsElJ6ez1tBwdocvf1\nEZMGPUnE4K2W13saFrA0C5KJFmcgYaNgDELPf/QkHinwk5ljdgep8G64NEezSCHB\nUummihMqnh2XUcCsvVgADm9q\n-----END PRIVATE KEY-----\n"

# Email Configuration
EMAIL_USER=namin3k@gmail.com
EMAIL_PASS=chkp dwix yhef pxtx

# Bank Configuration
BANK_ID=970418
BANK_ACCOUNT=8816728313
BANK_NAME=NGUYEN HUU HOANG NAM

# SePay Configuration
SEPAY_QR_API_URL=https://qr.sepay.vn/img
SEPAY_VIRTUAL_ACCOUNT=96247VVHYNOL806
SEPAY_BANK_CODE=BIDV

# Encryption
ENCRYPTION_KEY=4d8a9f2e1c6b5a3d7e9f2a5c8b6d4e7f1a3c9e5b2d8f6a4c7e1b9d3f5a8c2e6

# Ngrok Configuration
NGROK_AUTHTOKEN=33z58BAGw5HWSn4jpwU8n8E1kNv_7DsEBvuiCCWZgAkSPXhoy
EOF

# Setup systemd service
echo "🔄 Creating systemd service..."
cat > /etc/systemd/system/shopacc-backend.service << 'EOF'
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

systemctl daemon-reload
systemctl enable shopacc-backend

# Setup firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 5002/tcp
ufw --force enable

# Create management scripts
echo "📝 Creating management scripts..."

# Start script
cat > /opt/shopacc-backend/start.sh << 'EOF'
#!/bin/bash
cd /opt/shopacc-backend
docker-compose -f docker-compose.prod.yml up -d
echo "✅ ShopAcc Backend started!"
echo "🌐 Access at: http://163.223.8.130:5002"
EOF
chmod +x /opt/shopacc-backend/start.sh

# Stop script
cat > /opt/shopacc-backend/stop.sh << 'EOF'
#!/bin/bash
cd /opt/shopacc-backend
docker-compose -f docker-compose.prod.yml down
echo "🛑 ShopAcc Backend stopped!"
EOF
chmod +x /opt/shopacc-backend/stop.sh

# Status script
cat > /opt/shopacc-backend/status.sh << 'EOF'
#!/bin/bash
cd /opt/shopacc-backend
echo "📊 ShopAcc Backend Status:"
echo "=========================="
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=10
EOF
chmod +x /opt/shopacc-backend/status.sh

# Update script
cat > /opt/shopacc-backend/update.sh << 'EOF'
#!/bin/bash
cd /opt/shopacc-backend
echo "🔄 Updating ShopAcc Backend..."
git pull origin main
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
echo "✅ Update completed!"
EOF
chmod +x /opt/shopacc-backend/update.sh

echo ""
echo "✅ VPS Setup completed successfully!"
echo ""
echo "📊 VPS Information:"
echo "  IP: 163.223.8.130"
echo "  User: root"
echo "  App Directory: /opt/shopacc-backend"
echo "  Port: 5002"
echo ""
echo "🔧 Management Commands:"
echo "  Start: /opt/shopacc-backend/start.sh"
echo "  Stop: /opt/shopacc-backend/stop.sh"
echo "  Status: /opt/shopacc-backend/status.sh"
echo "  Update: /opt/shopacc-backend/update.sh"
echo ""
echo "🌐 Application will be available at: http://163.223.8.130:5002"
echo ""
echo "📋 Next steps:"
echo "1. Setup GitHub Secrets for CI/CD"
echo "2. Push your code to trigger first deployment"