# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
# Inject environment variables during build
ARG REACT_APP_URL_BACKEND
ENV REACT_APP_URL_BACKEND=$REACT_APP_URL_BACKEND
RUN npm run build

# Stage 3: Production
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
# Copy static assets from builder stage
COPY --from=builder /usr/src/app/build .
# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Add favicon and apple touch icons
COPY public/favicon.ico .
COPY public/logo192.png .
COPY public/logo512.png .
RUN cp logo192.png apple-touch-icon.png && \
    cp logo192.png apple-touch-icon-precomposed.png

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]