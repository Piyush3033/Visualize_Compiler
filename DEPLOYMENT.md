# Deployment Guide

This guide covers deploying the Advanced AST Visualizer to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Manual Server Deployment](#manual-server-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Database migrations (if applicable) completed
- [ ] Build successful: `pnpm build`
- [ ] Production build tested locally: `pnpm start`
- [ ] Performance validated (build size, load time)
- [ ] Security audit completed
- [ ] Backup of current production ready

### Verification Script

```bash
#!/bin/bash
echo "Running pre-deployment checks..."

# Check build
pnpm build || { echo "Build failed"; exit 1; }

# Check linting
pnpm lint || { echo "Lint failed"; exit 1; }

# Check node version
node --version

echo "All checks passed!"
```

## Vercel Deployment

### Option 1: GitHub Integration (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js configuration

2. **Configure Environment**
   - In Vercel dashboard: Settings → Environment Variables
   - Add all required variables from `.env.example`
   - No need to add `NEXT_PUBLIC_*` vars to Vercel if they're in `.env.local`

3. **Deploy**
   - Push to main branch
   - Vercel automatically builds and deploys
   - Preview deployments for pull requests

### Option 2: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel deploy

# Deploy to production
vercel deploy --prod

# View logs
vercel logs <project-url>
```

### Option 3: Git-based Auto-Deploy

The repository includes `vercel.json` for configuration:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1",
      "methods": ["GET", "POST", "PUT", "DELETE"]
    }
  ]
}
```

### Vercel Specific Optimizations

```javascript
// next.config.js for production
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  experimental: {
    optimizePackageImports: ["@radix-ui/"],
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff"
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN"
        }
      ]
    }
  ]
};
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t ast-visualizer:latest .
docker tag ast-visualizer:latest your-registry/ast-visualizer:latest
docker push your-registry/ast-visualizer:latest
```

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Runtime stage
FROM node:18-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run
EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "start"]
```

### Docker Compose

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
```

### Docker Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ast-visualizer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ast-visualizer
  template:
    metadata:
      labels:
        app: ast-visualizer
    spec:
      containers:
      - name: app
        image: your-registry/ast-visualizer:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

## Manual Server Deployment

### Prerequisites
- Node.js 18+ installed
- pnpm installed: `npm install -g pnpm`
- Nginx/Apache for reverse proxy
- PM2 for process management

### Deployment Steps

1. **Clone Repository**
```bash
cd /var/www
git clone https://github.com/your-org/Visualize_Compiler.git
cd Visualize_Compiler
git checkout main
```

2. **Install Dependencies**
```bash
pnpm install --frozen-lockfile
```

3. **Build Application**
```bash
pnpm build
```

4. **Configure Environment**
```bash
cp .env.example .env.production
nano .env.production  # Edit as needed
```

5. **Setup PM2**
```bash
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "ast-visualizer",
    script: ".next/standalone/server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

6. **Setup Nginx Reverse Proxy**
```nginx
upstream ast_visualizer {
  server 127.0.0.1:3000;
  keepalive 64;
}

server {
  listen 80;
  server_name your-domain.com www.your-domain.com;
  
  # Redirect to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name your-domain.com www.your-domain.com;
  
  # SSL Configuration
  ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
  
  # Security Headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-XSS-Protection "1; mode=block" always;
  
  # Compression
  gzip on;
  gzip_vary on;
  gzip_min_length 1000;
  gzip_types text/plain text/css text/xml text/javascript 
             application/x-javascript application/xml+rss 
             application/javascript application/json;
  
  # Proxy to Node.js
  location / {
    proxy_pass http://ast_visualizer;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
  
  # Cache static files
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

## Environment Configuration

### Required Environment Variables

Create `.env.production` based on `.env.example`:

```env
# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-ga-id

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_EXPORT=true
NEXT_PUBLIC_MAX_TREE_SIZE=5000
```

### Secrets Management

Use a secrets manager:

```bash
# Using 1Password CLI
op inject -i .env.example -o .env.production

# Using AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id ast-visualizer-prod

# Using HashiCorp Vault
vault kv get secret/ast-visualizer/prod
```

## Performance Optimization

### Build Optimization

```javascript
// next.config.js
const withOptimizedImages = require('next-optimized-images');

module.exports = withOptimizedImages({
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  // Optimize bundles
  webpack: (config, { isServer }) => {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            filename: 'chunks/vendor.js',
            test: /node_modules/,
            priority: 10
          },
          // Common chunk
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            filename: 'chunks/common.js',
          },
        },
      },
    };
    return config;
  }
});
```

### Runtime Optimization

```bash
# Preload critical resources
npm install next-preload-resources

# Enable image optimization
npm install @next/image

# Setup CDN for static assets
# Configure Cloudflare, CloudFront, or similar
```

## Monitoring & Logging

### Application Monitoring

```bash
# PM2 Monitoring
pm2 monit

# Real-time logs
pm2 logs ast-visualizer

# Aggregated logs
tail -f ./logs/err.log
tail -f ./logs/out.log
```

### Performance Monitoring

```javascript
// lib/metrics.ts
import { performance } from 'perf_hooks';

export function recordMetric(name: string, duration: number) {
  console.log(`[METRIC] ${name}: ${duration}ms`);
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify({ name, duration })
    });
  }
}
```

### Error Tracking

```javascript
// Setup Sentry for error tracking
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next
pnpm install --frozen-lockfile
pnpm build

# Check Node version
node --version  # Should be 18+
```

### Application Won't Start

```bash
# Check port conflicts
lsof -i :3000

# Check logs
pm2 logs ast-visualizer --err

# Restart application
pm2 restart ast-visualizer
```

### High Memory Usage

```bash
# Monitor memory
pm2 monit

# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm start

# Check for memory leaks
node --inspect=localhost:9229 server.js
```

### Slow Performance

```bash
# Profile application
npm install clinic
clinic doctor -- pnpm start

# Check build size
pnpm exec next-bundle-analyzer

# Optimize images
find public -name "*.png" -o -name "*.jpg" | xargs imagemin --in-place
```

---

For more help, see [README.md](./README.md) or open an issue on GitHub.
