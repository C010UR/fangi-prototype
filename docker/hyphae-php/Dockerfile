FROM php:8.4-fpm-alpine

WORKDIR /app

ARG USER_ID=1000
ARG GROUP_ID=1000
ARG USERNAME=phpuser

COPY --from=mlocati/php-extension-installer:latest /usr/bin/install-php-extensions /usr/local/bin/
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN apk add --no-cache \
    $PHPIZE_DEPS \
    # System packages
    git \
    unzip \
    # Dependencies for PHP extensions
    libzip-dev \
    icu-dev \
    sqlite-dev \
    # Dev-only packages
    fish

RUN docker-php-source extract \
    && install-php-extensions \
    pdo_sqlite \
    intl \
    opcache \
    zip \
    gd \
    xdebug \
    && docker-php-source delete

RUN apk del $PHPIZE_DEPS autoconf gcc g++

RUN if [ ${USER_ID:-0} -ne 0 ] && [ ${GROUP_ID:-0} -ne 0 ]; then \
    if ! getent group ${GROUP_ID} >/dev/null; then \
        addgroup -g ${GROUP_ID} ${USERNAME}; \
    fi \
    && if ! getent passwd ${USER_ID} >/dev/null; then \
        adduser -D -u ${USER_ID} -G $(getent group ${GROUP_ID} | cut -d: -f1) ${USERNAME}; \
    fi \
;fi

RUN mkdir -p /init/ /app/php-sock /.cache \
    && ln -sf /usr/local/bin/php /usr/bin/php

# Copy configuration files
COPY config/php-fpm.conf    /usr/local/etc/php-fpm.d/php-fpm.conf
COPY config/www.conf        /usr/local/etc/php-fpm.d/www.conf
COPY config/zz-docker.conf  /usr/local/etc/php-fpm.d/zz-docker.conf
COPY config/php.ini         $PHP_INI_DIR/php.ini
COPY config/xdebug.ini      $PHP_INI_DIR/conf.d/docker-php-ext-xdebug.ini
COPY entrypoint.sh          /usr/local/bin/entrypoint.sh

RUN sed -i "s/USER_ID/${USER_ID}/" /usr/local/etc/php-fpm.d/www.conf \
    && sed -i "s/GROUP_ID/${GROUP_ID}/" /usr/local/etc/php-fpm.d/www.conf \
    && sed -i "s/USER_ID/${USER_ID}/" /usr/local/etc/php-fpm.d/zz-docker.conf \
    && sed -i "s/GROUP_ID/${GROUP_ID}/" /usr/local/etc/php-fpm.d/zz-docker.conf

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p /tmp && mkdir -p /app && mkdir -p /.cache && mkdir -p /etc/php/sock \
    && chown -R ${USER_ID}:${GROUP_ID} /tmp /app /.cache /etc/php/sock \
    && chmod -R 755 /tmp /app /.cache /etc/php/sock

USER ${USER_ID}:${GROUP_ID}

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
