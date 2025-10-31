# Use an official PHP 8.2 image with Apache
FROM php:8.2-apache

# 1. Install system dependencies & PHP extensions
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
    && docker-php-ext-enable opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs

# 3. Install Composer (latest version)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Set Apache configurations
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN a2enmod rewrite

# 5. Set working directory and copy app files
WORKDIR /var/www/html
COPY . .

# 6. Set correct permissions for the entire directory
RUN chown -R www-data:www-data .

# 7. Switch to the web server user
USER www-data

# 8. Install dependencies as the www-data user
# Environment variables are now passed directly to the commands
RUN export APP_ENV=prod && \
    export APP_SECRET=buildsecret_dummy && \
    export DATABASE_URL=dummy://db && \
    COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --optimize-autoloader --ignore-platform-reqs --no-scripts

# 9. Build assets as the www-data user
RUN npm install
RUN npm run build

# 10. Warm up the cache as the www-data user
RUN export APP_ENV=prod && \
    export APP_SECRET=buildsecret_dummy && \
    export DATABASE_URL=dummy://db \
    && php bin/console cache:clear