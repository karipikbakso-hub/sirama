# Use PHP 8.3 with Apache
FROM php:8.3-apache

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    nodejs \
    npm

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy existing application directory contents
COPY . /var/www/html

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www/html

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev --no-scripts

# Generate application key if .env exists
RUN if [ -f .env ]; then php artisan key:generate --force; fi

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Configure Apache
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
RUN a2enmod rewrite

# Expose port 80
EXPOSE 80

# Create startup script
RUN echo '#!/bin/bash\n\
if [ -f .env ]; then\n\
    php artisan config:cache\n\
    php artisan route:cache\n\
    php artisan view:cache\n\
fi\n\
apache2-foreground' > /usr/local/bin/start.sh

RUN chmod +x /usr/local/bin/start.sh

# Start Apache
CMD ["/usr/local/bin/start.sh"]