FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends gnupg curl ca-certificates \
  && curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc \
    | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor \
  && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends mongodb-org \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

ENV PORT=5000
ENV NODE_ENV=production
# MONGODB_URI: set Atlas URI on Render (starpolice_academy). Unset uses embedded MongoDB via start.sh.
ENV CLIENT_URL=https://starpolice-panel.netlify.app

RUN mkdir -p /data/db
RUN chmod +x start.sh

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["./start.sh"]
