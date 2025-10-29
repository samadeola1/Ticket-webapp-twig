# Use an official PHP 8.2 image with Apache
FROM php:8.2-apache

# 1. Install system dependencies & PHP extensions
# We need zip/unzip for composer, libpq-dev for PostgreSQL, and libicu-dev for the intl extension.
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    libicu-dev \
    && docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    intl \
    zip \
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

# 5. Enable Apache's mod_rewrite for Symfony's front controller (index.php)
RUN a2enmod rewrite

# 6. Copy your application code into the container
WORKDIR /var/www/html
COPY . .

# 7. Install PHP & Node dependencies
RUN composer install --no-dev --optimize-autoloader
RUN npm install

# 8. Build your assets for production
RUN npm run build

# 9. Set correct permissions for the web server
RUN chown -R www-data:www-data var public/build

# The base image (php:8.2-apache) already includes the final CMD
# to start Apache, so you don't need to add it.