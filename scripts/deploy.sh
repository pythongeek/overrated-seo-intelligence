#!/bin/bash
# Deployment script for SEO Intelligence Suite
# Supports Docker, PM2, and bare-metal deployment

set -e

echo "🚀 Deploying SEO Intelligence Suite..."

MODE=${1:-docker}

if [ "$MODE" = "docker" ]; then
    echo "Building Docker image..."
    docker build -t seo-intelligence-suite .
    echo "Starting services..."
    docker-compose up -d
    echo "✅ Docker deployment complete"
    echo "📡 API available at: http://localhost:3000"
    echo "🖥️  n8n available at: http://localhost:5678"

elif [ "$MODE" = "pm2" ]; then
    echo "Installing PM2..."
    npm install -g pm2
    echo "Starting with PM2..."
    pm2 start cli/seo-agent.js --name seo-agent -- server
    pm2 save
    echo "✅ PM2 deployment complete"
    echo "📡 API available at: http://localhost:3000"

elif [ "$MODE" = "bare" ]; then
    echo "Starting bare-metal server..."
    node cli/seo-agent.js server &
    echo "✅ Server started"
    echo "📡 API available at: http://localhost:3000"

else
    echo "Usage: ./scripts/deploy.sh [docker|pm2|bare]"
    exit 1
fi
