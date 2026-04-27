# Build stage for React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies (including devDependencies for build)
RUN npm install

# Copy client source
COPY client/ ./

# Build the React app
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev && \
    npm cache clean --force

# Copy server source
COPY server/ ./server/

# Copy built React app from frontend builder
COPY --from=frontend-builder /app/client/build ./client/build

# Set ownership to built-in node user (uid 1000)
RUN chown -R node:node /app

# Switch to non-root user (node user already exists in base image)
USER node

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the server
CMD ["node", "server/index.js"]
