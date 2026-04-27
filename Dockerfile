# Build stage for React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci --only=production=false

# Copy client source
COPY client/ ./

# Build the React app
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1000 nodeapp && \
    adduser -u 1000 -G nodeapp -s /bin/sh -D nodeapp

# Copy server package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy server source
COPY server/ ./server/

# Copy built React app from frontend builder
COPY --from=frontend-builder /app/client/build ./client/build

# Set ownership
RUN chown -R nodeapp:nodeapp /app

# Switch to non-root user
USER nodeapp

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "server/index.js"]
