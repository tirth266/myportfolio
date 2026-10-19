# Practical 11: Frontend Dockerfile (Multi-Stage Build)
# Stage 1: Build the React app with Vite
# Stage 2: Serve the static build with Nginx

# ── Stage 1: Build ──────────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for the build)
RUN npm install

# Copy the rest of the source code
COPY . .

# Set the API URL for the production build (points to backend container via host)
ENV VITE_API_URL=http://localhost:5000

# Build the production bundle
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────
FROM nginx:alpine

# Copy the built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx config for SPA routing (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
