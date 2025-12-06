#!/bin/sh

set -e

if [ -f "/app/php-sock/php-fpm.sock" ]; then
  rm "/app/php-sock/php-fpm.sock"
fi

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
  set -- php-fpm "$@"
fi

exec docker-php-entrypoint "$@"

