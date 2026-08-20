FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git curl ca-certificates gnupg sudo \
  && curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc \
    | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor \
  && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends mongodb-org \
  && rm -rf /var/lib/apt/lists/* \
  && curl -fsSL -o /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
  && dpkg -i /tmp/cloudflared.deb \
  && rm /tmp/cloudflared.deb \
  && (id ubuntu >/dev/null 2>&1 || useradd -m -s /bin/bash ubuntu) \
  && mkdir -p /data/db \
  && chown -R ubuntu:ubuntu /data/db

USER ubuntu
WORKDIR /home/ubuntu
