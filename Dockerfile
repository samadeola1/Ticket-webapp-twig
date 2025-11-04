# Use an official PHP 8.3 image with Apache
FROM php:8.3-apache

# Install system dependencies & PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    libicu-dev \
    libxml2-dev \
    libonig-dev \
    && docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    intl \
    zip \
    mbstring \
    xml \
    && docker-php-ext-enable opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure Git (required for some Composer packages)
RUN git config --global user.email "build@render.com" && \
    git config --global user.name "Render Build"

# Configure Apache
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf && \
    sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf && \
    a2enmod rewrite headers

# Set working directory
WORKDIR /var/www/html

# Copy all application code
COPY . .

# Set dummy environment variables for Composer scripts
ENV APP_ENV=prod
ENV APP_SECRET=dummy_secret_for_build_only
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?serverVersion=15&charset=utf8"

# Verify composer.lock exists and validate it
RUN composer validate --no-check-publish

# Install PHP dependencies - use --no-scripts first to avoid Symfony command errors
RUN COMPOSER_MEMORY_LIMIT=-1 composer install \
    --no-dev \
    --no-scripts \
    --ignore-platform-reqs \
    --no-interaction \
    --prefer-dist

# Then run the scripts manually with proper environment (they might still fail, that's ok)
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

# Install Node dependencies
RUN npm ci --prefer-offline --no-audit || npm install --prefer-offline --no-audit

# Build assets
RUN npm run build

# Create necessary directories and set permissions
RUN mkdir -p var/cache var/log public/build && \
    chown -R www-data:www-data var public/build && \
    chmod -R 775 var

# Warm up Symfony cache with dummy vars (will be re-warmed on startup with real vars)
RUN php bin/console cache:clear --no-warmup || true
RUN php bin/console cache:warmup || true
RUN php bin/console assets:install public --symlink --relative || true

# Configure Apache to listen on PORT from environment
RUN echo "Listen \${PORT}" > /etc/apache2/ports.conf && \
    sed -i 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/' /etc/apache2/sites-available/000-default.conf

# Create startup script
RUN echo '#!/bin/bash\n\
    set -e\n\
    \n\
    # Run any necessary migrations\n\
    php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || true\n\
    \n\
    # Clear cache with actual environment\n\
    php bin/console cache:clear --no-warmup || true\n\
    php bin/console cache:warmup || true\n\
    \n\
    # Start Apache in foreground\n\
    exec apache2-foreground' > /usr/local/bin/start.sh && \
    chmod +x /usr/local/bin/start.sh

# Expose port (Render will inject the PORT env var)
EXPOSE ${PORT:-8080}

# Use the startup script
CMD ["/usr/local/bin/start.sh"]