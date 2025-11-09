# 🚀 **SIRAMA - Deployment Guide**

Panduan lengkap untuk deployment sistem SIRAMA di berbagai environment (development, staging, production).

## 📋 **Prerequisites**

### **System Requirements**
- **OS:** Ubuntu 20.04 LTS / CentOS 7+ / Windows Server 2019+
- **CPU:** 2 cores minimum (4 cores recommended)
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 50GB SSD minimum
- **Network:** 100Mbps minimum

### **Software Dependencies**
```bash
# Web Server
nginx 1.20+
apache 2.4+ (alternative)

# Database
mysql 8.0+
mariadb 10.6+ (alternative)

# PHP Runtime
php 8.2+
composer 2.x+

# Node.js Runtime
node.js 18.x+
npm 9.x+
yarn 1.x+ (optional)

# Process Manager
pm2 5.x+ (for production)
supervisor (alternative)
```

## 🐳 **Docker Deployment (Recommended)**

### **Development Setup**
```bash
# Clone repository
git clone https://github.com/karipikbakso-hub/sirama.git
cd sirama

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend php artisan migrate --seed

# Build frontend
docker-compose exec frontend npm run build
```

### **Production Docker Compose**
```yaml
version: '3.8'
services:
  # Database
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: sirama
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/my.cnf
    networks:
      - sirama

  # Redis Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - sirama

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - APP_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    volumes:
      - ./backend/storage:/var/www/storage
    depends_on:
      - mysql
      - redis
    networks:
      - sirama

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NEXT_PUBLIC_API_URL=https://api.sirama.hospital
    depends_on:
      - backend
    networks:
      - sirama

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - sirama

volumes:
  mysql_data:
  redis_data:

networks:
  sirama:
    driver: bridge
```

## 🖥️ **Manual Server Setup**

### **Step 1: Server Preparation**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install PHP 8.2
sudo add-apt-repository ppa:ondrej/php -y
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd php8.2-intl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8.0
sudo apt install -y mysql-server-8.0

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### **Step 2: Database Setup**
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
-- Create database
CREATE DATABASE sirama CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'sirama'@'localhost' IDENTIFIED BY 'strong_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON sirama.* TO 'sirama'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### **Step 3: Backend Deployment**
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/karipikbakso-hub/sirama.git
sudo chown -R www-data:www-data sirama
cd sirama/backend

# Install dependencies
sudo -u www-data composer install --optimize-autoloader --no-dev

# Copy environment file
sudo -u www-data cp .env.example .env

# Generate application key
sudo -u www-data php artisan key:generate

# Configure database in .env
sudo -u www-data nano .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=sirama
# DB_USERNAME=sirama
# DB_PASSWORD=your_password

# Run migrations
sudo -u www-data php artisan migrate --seed

# Optimize Laravel
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache
```

### **Step 4: Frontend Deployment**
```bash
cd /var/www/sirama/frontend

# Install dependencies
sudo -u www-data npm ci --only=production

# Build application
sudo -u www-data npm run build

# Configure environment
sudo -u www-data cp .env.example .env.local
sudo -u www-data nano .env.local
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### **Step 5: Web Server Configuration**

#### **Nginx Configuration**
```nginx
# /etc/nginx/sites-available/sirama
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# SSL Configuration (Let's Encrypt)
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Same configuration as above
    location / {
        proxy_pass http://127.0.0.1:3000;
        # ... proxy settings
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        # ... proxy settings
    }
}
```

#### **PHP-FPM Configuration**
```ini
# /etc/php/8.2/fpm/pool.d/sirama.conf
[sirama]

user = www-data
group = www-data

listen = /var/run/php/php8.2-fpm-sirama.sock
listen.owner = www-data
listen.group = www-data

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35

php_admin_value[upload_max_filesize] = 100M
php_admin_value[post_max_size] = 100M
php_admin_value[memory_limit] = 256M
php_admin_value[max_execution_time] = 300
```

### **Step 6: Process Management**
```bash
# Start PHP-FPM
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm

# Start Backend (Laravel Octane - Recommended)
cd /var/www/sirama/backend
sudo -u www-data php artisan octane:start --host=127.0.0.1 --port=8000

# Start Frontend
cd /var/www/sirama/frontend
sudo -u www-data pm2 start npm --name "sirama-frontend" -- run start
sudo -u www-data pm2 save
sudo -u www-data pm2 startup

# Enable Nginx
sudo ln -s /etc/nginx/sites-available/sirama /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 🔒 **SSL Certificate Setup**

### **Let's Encrypt (Recommended)**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Manual SSL Certificate**
```bash
# Place certificates in /etc/nginx/ssl/
sudo mkdir -p /etc/nginx/ssl
sudo cp yourdomain.crt /etc/nginx/ssl/
sudo cp yourdomain.key /etc/nginx/ssl/

# Update nginx configuration with SSL paths
```

## 💾 **Backup & Recovery**

### **Automated Backup Script**
```bash
#!/bin/bash
# /usr/local/bin/sirama-backup.sh

BACKUP_DIR="/var/backups/sirama"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u sirama -p'password' sirama > $BACKUP_DIR/db_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/sirama/backend/storage

# Compress all backups
tar -czf $BACKUP_DIR/full_backup_$DATE.tar.gz $BACKUP_DIR/db_$DATE.sql $BACKUP_DIR/files_$DATE.tar.gz

# Remove old backups (keep last 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "db_*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +30 -delete

# Optional: Upload to cloud storage
# aws s3 cp $BACKUP_DIR/full_backup_$DATE.tar.gz s3://your-backup-bucket/
```

### **Setup Cron Job**
```bash
# Daily backup at 2 AM
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/sirama-backup.sh
```

## 📊 **Monitoring & Logging**

### **Application Monitoring**
```bash
# Install monitoring tools
sudo apt install -y htop iotop sysstat

# Laravel Telescope (for development)
composer require laravel/telescope
php artisan telescope:install
php artisan migrate

# Setup log rotation
sudo nano /etc/logrotate.d/sirama
```

```
/var/www/sirama/backend/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        /usr/lib/php/php8.2-fpm-reload restart
    endscript
}
```

### **Server Monitoring**
```bash
# Install Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvf node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/

# Create service
sudo nano /etc/systemd/system/node_exporter.service
```

```ini
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
```

## 🔄 **Update & Maintenance**

### **Zero-Downtime Deployment**
```bash
# Backend update
cd /var/www/sirama/backend
git pull origin main
composer install --optimize-autoloader --no-dev
php artisan migrate
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend update
cd /var/www/sirama/frontend
git pull origin main
npm ci --only=production
npm run build
pm2 restart sirama-frontend
```

### **Rollback Procedure**
```bash
# Backend rollback
cd /var/www/sirama/backend
git reset --hard HEAD~1
php artisan migrate:rollback
php artisan cache:clear

# Frontend rollback
cd /var/www/sirama/frontend
git reset --hard HEAD~1
npm run build
pm2 restart sirama-frontend
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Permission Issues**
```bash
# Fix storage permissions
sudo chown -R www-data:www-data /var/www/sirama/backend/storage
sudo chmod -R 755 /var/www/sirama/backend/storage

# Fix bootstrap cache
sudo chown -R www-data:www-data /var/www/sirama/backend/bootstrap/cache
```

#### **2. Database Connection Issues**
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u sirama -p -e "SELECT 1;"

# Check Laravel database config
php artisan config:show database
```

#### **3. Frontend Build Issues**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check Node.js version
node --version
npm --version
```

#### **4. SSL Certificate Issues**
```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout

# Renew certificate
sudo certbot renew
```

### **Performance Optimization**

#### **Database Optimization**
```sql
-- Analyze slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Optimize tables
OPTIMIZE TABLE users, patients, emr_records;

-- Check index usage
SHOW INDEX FROM emr_records;
```

#### **PHP Optimization**
```ini
# php.ini optimizations
memory_limit = 256M
max_execution_time = 300
upload_max_filesize = 100M
post_max_size = 100M

# OPcache settings
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=7963
opcache.revalidate_freq=0
```

#### **Nginx Optimization**
```nginx
# nginx.conf optimizations
worker_processes auto;
worker_connections 1024;

# Enable gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Cache static files
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks**
- [ ] Weekly: Check disk space usage
- [ ] Weekly: Review application logs
- [ ] Monthly: Update system packages
- [ ] Monthly: Database optimization
- [ ] Quarterly: Security updates
- [ ] Quarterly: Performance review

### **Emergency Contacts**
- **System Administrator:** admin@hospital.com
- **Technical Support:** support@sirama.dev
- **Emergency Hotline:** +62-XXX-XXXX-XXXX

---

**🎯 Deployment guide ini memastikan SIRAMA dapat di-deploy dengan aman, scalable, dan maintainable di production environment.**
