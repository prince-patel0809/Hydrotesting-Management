# Stage 1: Build the React + Vite TypeScript Application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
RUN npm ci

# Copy source code and config files
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
