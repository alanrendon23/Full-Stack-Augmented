FROM node:18-alpine AS builder

WORKDIR /app

# Copy lock and package files first for efficient caching
COPY package.json pnpm-lock.yaml ./

# Ensure pnpm is available and install dependencies
RUN npm install -g pnpm && \
	pnpm install --frozen-lockfile --reporter=silent

# Copy app sources (node_modules is ignored via .dockerignore)
COPY . .

# Build the Angular app (uses outputPath from angular.json -> dist/front)
RUN pnpm exec ng build --configuration production

FROM nginx:alpine

# Replace default nginx config with one suited for an SPA (serves index.html for unknown routes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from builder
COPY --from=builder /app/dist/front/browser/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
