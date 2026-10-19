# Practical 11: Backend Dockerfile
# Uses Node.js 18 Alpine for a minimal production image

FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first (Docker layer caching optimization)
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy the rest of the application source code
COPY . .

# Expose the backend port (matches PORT in .env)
EXPOSE 5000

# Healthcheck: hit the root endpoint every 30 seconds
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

# Start the server
CMD ["node", "server.js"]
