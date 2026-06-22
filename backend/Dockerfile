# Multi-stage Dockerfile for backend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package files and install dev deps for build
COPY package*.json ./
RUN npm ci --include=dev

# Copy entire repo (we only need backend sources for build)
COPY . .

# Build backend (TypeScript)
RUN npm run build:backend

FROM node:20-alpine AS runtime
WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend and data folder from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/data ./backend/data

EXPOSE 4000
CMD ["node", "backend/dist/index.js"]
