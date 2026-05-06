# Deploy to Render

## One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Manual Deploy via Render CLI

```bash
# Install Render CLI
npm install -g @render.com/cli

# Login
render login

# Deploy using render.yaml blueprint
render deploy
```

## What Gets Deployed

| Service | Type | Purpose | Free Tier |
|---------|------|---------|-----------|
| `seo-agent` | Web Service | HTTP API server + webhook endpoints | 512MB RAM, shared CPU |
| `seo-cron` | Background Worker | Scheduled competitor monitoring, content updates | 512MB RAM, shared CPU |
| `seo-redis` | Managed Redis | Caching, rate limiting, job queue | 30MB storage |
| `seo-postgres` | Managed Postgres | Data persistence, analytics storage | 1GB storage, 1 connection |

## Environment Variables (Set in Render Dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI content generation |
| `SERP_API_KEY` | No | SERPAPI key for competitor analysis |
| `N8N_WEBHOOK_URL` | No | n8n workflow automation webhook |
| `WP_URL` | No | WordPress XML-RPC endpoint |
| `WP_USERNAME` | No | WordPress username |
| `WP_PASSWORD` | No | WordPress app password |

## Health Check

After deployment, verify:
```
curl https://seo-agent.onrender.com/health
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/generate` | POST | Generate content brief |

**Generate example:**
```bash
curl -X POST https://seo-agent.onrender.com/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "drake new album announcement", "options": {"category": "hip-hop"}}'
```

## Troubleshooting

**Build fails:** Ensure `npm install` completes. Check that Puppeteer/chromium are not causing issues.

**Web service sleeping:** Free tier sleeps after 15 min of inactivity. Use a uptime monitor or upgrade to Starter plan.

**Redis/Postgres connection errors:** Check that services are in same region (Oregon recommended).

**Cron worker not running:** Verify `render.yaml` syntax. Use `render logs seo-cron` to check logs.

## Scaling

For production workloads, upgrade to:
- **Starter plan** ($5/mo): Web service never sleeps, 512MB RAM → 1GB
- **Plus plan** ($15/mo): 2GB RAM, dedicated CPU, auto-sleep disabled