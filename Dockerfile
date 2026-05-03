# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests and install dependencies
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source and build frontend
COPY backend backend
COPY frontend frontend
RUN cd frontend && npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app/backend

# Copy backend source and production dependencies
COPY backend backend
COPY --from=builder /app/frontend/dist ../frontend/dist

WORKDIR /app/backend
RUN npm install --production

EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "server.js"]
