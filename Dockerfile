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

# 5. Set working directory
WORKDIR /var/www/html

# 6. Copy all application files
COPY . .

# 7. Create Symfony dirs (owned by root for now)
RUN mkdir -p var/cache var/log public/build

# 8. Create a writable home directory for www-data and give it ownership
RUN mkdir -p /home/www-data && chown -R www-data:www-data /home/www-data

# 9. Change ownership of ALL app files to www-data
RUN chown -R www-data:www-data .

# 10. Switch to the web server user
USER www-data

# 11. Set the HOME environment variable for this user
ENV HOME /home/www-data

# 12. Install dependencies as the www-data user
RUN export APP_ENV=prod && \
    export APP_SECRET=buildsecret_dummy && \
    export DATABASE_URL=dummy://db && \
    COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --optimize-autoloader --ignore-platform-reqs --no-scripts

# 13. Build assets as the www-data user
#     (This will now correctly write its cache to /home/www-data/.npm)
RUN npm install

# 14. Run the build script
RUN npm run build

# 15. Warm up the cache as the www-data user
RUN export APP_ENV=prod && \
    export APP_SECRET=buildsecret_dummy && \
    export DATABASE_URL=dummy://db \
    && php bin/console cache:clear