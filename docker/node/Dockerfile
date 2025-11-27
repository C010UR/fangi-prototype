FROM node:22-slim

# Build arguments
ARG USER_ID=1000
ARG GROUP_ID=1000
ARG USERNAME=nodeuser

WORKDIR /app

RUN apt-get update && apt-get install -y \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/* \
    && npm i -g npm@latest

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN if [ ${USER_ID:-0} -ne 0 ] && [ ${GROUP_ID:-0} -ne 0 ]; then \
    if ! getent group ${GROUP_ID} >/dev/null; then \
        groupadd -g ${GROUP_ID} ${USERNAME}; \
    fi \
    && if ! getent passwd ${USER_ID} >/dev/null; then \
        useradd -u ${USER_ID} -g $(getent group ${GROUP_ID} | cut -d: -f1) -m -s /bin/bash ${USERNAME}; \
    fi \
;fi

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p /tmp && mkdir -p /app && mkdir -p /.cache \
    && chown -R ${USER_ID}:${GROUP_ID} /tmp /app /.cache \
    && chmod -R 755 /tmp /app /.cache

USER ${USER_ID}:${GROUP_ID}

ENTRYPOINT ["entrypoint.sh"]
