# Gunakan Bun sebagai base image (kecil & cepat)
FROM oven/bun:1 AS base
WORKDIR /app

# Build argument untuk menentukan environment (default: development)
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Copy package.json & lockfile
COPY package.json bun.lock* ./

# Install dependencies
# Untuk production, hanya install production dependencies
RUN if [ "$NODE_ENV" = "production" ]; then \
      bun install --frozen-lockfile --production; \
    else \
      bun install --frozen-lockfile; \
    fi

# Copy seluruh source code
COPY . .

# Expose port (sesuaikan dengan port aplikasi, misal 3000)
EXPOSE 4000

# Conditional CMD based on environment
# Development: gunakan --watch untuk hot reload
# Production: gunakan start biasa (lebih stabil & hemat resource)
CMD if [ "$NODE_ENV" = "production" ]; then \
      bun run start; \
    else \
      bun run dev; \
    fi
