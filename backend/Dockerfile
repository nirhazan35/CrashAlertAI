# ---------- deps ----------
FROM node:18-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- runtime ----------
FROM node:18-alpine

RUN apk add --no-cache tzdata \
 && cp /usr/share/zoneinfo/Asia/Jerusalem /etc/localtime
ENV TZ=Asia/Jerusalem

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

USER appuser
CMD ["node", "index.js"]