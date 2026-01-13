# --- Stage 1: Build React App ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm install

# Copy source code & Build
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Hapus default nginx static file
RUN rm -rf ./*

# Copy hasil build dari Stage 1 ke folder Nginx
COPY --from=builder /app/dist .

# Copy custom nginx config (jika ada, opsional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
