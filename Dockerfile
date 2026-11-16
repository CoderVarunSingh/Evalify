# Multi-stage Dockerfile for Evalify Fullstack Production Build

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend assets into the location expected by server.js
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
