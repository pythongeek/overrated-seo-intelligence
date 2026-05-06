# Multi-stage build for production optimization
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Install dependencies for Puppeteer & readability
RUN apk add --no-cache     chromium     nss     freetype     harfbuzz     ca-certificates     ttf-freefont     dumb-init

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true     PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser     NODE_ENV=production     PORT=3000

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create output directory
RUN mkdir -p seo-output && chown -R nodejs:nodejs seo-output

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3     CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "cli/seo-agent.js", "server"]
