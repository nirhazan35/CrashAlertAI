# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

# Set environment variables during build
ARG REACT_APP_URL_BACKEND
ENV REACT_APP_URL_BACKEND=$REACT_APP_URL_BACKEND

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

RUN apk add --no-cache gettext

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY entrypoint.sh /docker-entrypoint.d/

RUN chmod +x /docker-entrypoint.d/entrypoint.sh