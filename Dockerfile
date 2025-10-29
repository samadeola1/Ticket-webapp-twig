# Use an official PHP 8.2 image with Apache
FROM php:8.2-apache

# 1. Install system dependencies & PHP extensions
# UPDATED: Added libxml2-dev (for 'xml' extension), and opcache (for performance)
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    libicu-dev \
    libxml2-dev \
    && docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    intl \
    zip \
    xml \
    ctype \
    iconv \
    opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs

# 3. Install Composer (latest version)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Set the Apache DocumentRoot to Symfony's public/ directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 5. Enable Apache's mod_rewrite
RUN a2enmod rewrite

# 6. Copy your application code into the container
WORKDIR /var/www/html
COPY . .

# 7. Install PHP & Node dependencies
# UPDATED: We set dummy env vars for the build, so composer's auto-scripts (like cache:clear) don't fail.
# The real secrets will be injected at runtime by Render.
RUN export APP_ENV=prod && \
    export APP_SECRET=buildsecret_dummy && \
    export DATABASE_URL=dummy://db \
    && composer install --no-dev --optimize-autoloader

# 8. Build your assets for production
RUN npm install
RUN npm run build

# 9. Set correct permissions for the web server
RUN chown -R www-data:www-data var public/build

# 10. Warm up the cache again AFTER assets are built
# This ensures the manifest.json from Webpack is found.
RUN export APP_ENV=prod && \
    export APP_SECRET=buildsecret_dummy && \
    export DATABASE_URL=dummy://db \
    && php bin/console cache:clear