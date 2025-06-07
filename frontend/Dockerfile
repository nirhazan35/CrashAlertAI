# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY public ./public
COPY src ./src
COPY .env.production ./
COPY tsconfig.json ./
COPY vite.config.* ./

ARG REACT_APP_URL_BACKEND
ENV REACT_APP_URL_BACKEND=$REACT_APP_URL_BACKEND
RUN npm run build

# Stage 3: Production (final image)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/build .
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/favicon.ico .
COPY public/logo192.png .
COPY public/logo512.png .
RUN cp logo192.png apple-touch-icon.png && \
    cp logo192.png apple-touch-icon-precomposed.png

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]