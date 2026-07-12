# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests first to leverage Docker build caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source code
COPY . .

# Set default environment variables
ENV PORT=5000
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "app.js"]
