FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

ENV PORT=5000
ENV NODE_ENV=production
ENV CLIENT_URL=https://starpolice-panel.netlify.app

RUN chmod +x start.sh

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["./start.sh"]
