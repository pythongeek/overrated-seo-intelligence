# SEO Intelligence Suite v2.0

> **Industry-standard AI-powered content intelligence system designed to systematically outrank TMZ-tier competitors on search and social media.**

[![CI/CD](https://github.com/your-org/seo-intelligence-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/seo-intelligence-suite/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What's Been Built

### Core Agents

| Module | Status | File |
|--------|--------|------|
| Content Intelligence Agent | ✅ Production | `agents/core/content-intelligence-agent.js` |
| Competitor Research Agent | ✅ Production | `agents/core/competitor-research-agent.js` |
| Social Optimizer | ✅ Production | `agents/core/social-optimizer.js` |
| WordPress Publisher | ✅ Production | `agents/integrations/wordpress-publisher.js` |
| Anti-AIism Filter | ✅ Production | `agents/utils/anti-aiism-filter.js` |
| Quality Gates | ✅ Production | `agents/utils/quality-gates.js` |
| Linguistic DNA Analyzer | ✅ Production | `agents/utils/linguistic-dna.js` |

### CLI Tools

| Command | Purpose |
|---------|---------|
| `seo-agent generate <topic>` | Generate content intelligence brief |
| `seo-agent research <topic>` | Deep competitor deconstruction |
| `seo-agent social <brief>` | Platform-native social optimization |
| `seo-agent publish <brief>` | Publish to WordPress with SEO |
| `seo-agent batch <file>` | Process multiple topics |
| `seo-agent server` | Start webhook server for n8n |
| `gap-analyzer analyze <topic>` | Gap analysis & beat strategy |
| `competitor-research deconstruct <url>` | Single URL DNA extraction |
| `social-optimizer optimize <brief>` | Social content generation |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SEO INTELLIGENCE SUITE                     │
├─────────────────────────────────────────────────────────────┤
│  PHASE I: Deep Research & Intelligence Gathering              │
│  ├── SERP Analysis (top 3 competitors)                        │
│  ├── Content Extraction & Deconstruction                      │
│  ├── Factual Grounding & Cross-Reference Verification         │
│  ├── Sentiment Mapping (audience mood analysis)               │
│  └── Reading Level Analysis                                   │
├─────────────────────────────────────────────────────────────┤
│  PHASE II: Niche-Specific Style Modules                       │
│  ├── Hip-Hop & Urban (Raw, rhythmic, "in the know")           │
│  ├── Viral/Breaking (Urgent, pyramid structure)             │
│  ├── Celebrity & Entertainment (Witty, fast-paced)            │
│  ├── Net Worth/Financial (Authoritative, data-driven)          │
│  ├── Scandal/Drama (Measured, factual)                        │
│  └── Social-Viral (Native-platform, algorithm-aware)          │
├─────────────────────────────────────────────────────────────┤
│  PHASE III: Pattern-Match Adaptation Protocol                 │
│  ├── Linguistic DNA Analysis                                  │
│  │   ├── Sentence variance mapping                            │
│  │   ├── Voice type detection                                 │
│  │   ├── Metaphor density calculation                         │
│  │   └── Rhythm pattern extraction                            │
│  ├── "10% Better" Calibration                                 │
│  │   └── Beat competitor depth + 20% faster publish           │
│  └── Style-Specific Correction Rules                         │
├─────────────────────────────────────────────────────────────┤
│  PHASE IV: Quality Gates (0-100 Scoring)                    │
│  ├── Factual Accuracy (25% weight)                          │
│  ├── Style Adherence (20% weight)                           │
│  ├── SEO Optimization (20% weight)                            │
│  ├── Social Optimization (15% weight)                         │
│  ├── Readability (10% weight)                               │
│  └── Engagement Potential (10% weight)                      │
├─────────────────────────────────────────────────────────────┤
│  PHASE V: Self-Correction Loop                               │
│  ├── Anti-AIism Filter (500+ banned patterns)               │
│  ├── Quote Verification                                      │
│  ├── Hallucination Detection                                 │
│  └── Forward-Looking Statement Enforcement                   │
├─────────────────────────────────────────────────────────────┤
│  PHASE VI: Multi-Platform Social Optimization               │
│  ├── Twitter (Thread-ready, quote-tweet bait)                 │
│  ├── Instagram (Carousel, Reel script, Stories)             │
│  ├── TikTok (FYP-optimized, duet-friendly)                  │
│  └── Facebook (Link preview, engagement prompt)             │
├─────────────────────────────────────────────────────────────┤
│  PHASE VII: WordPress Publishing                             │
│  ├── XML-RPC with Rank Math SEO integration                  │
│  ├── Schema.org JSON-LD injection                           │
│  ├── Dynamic category/tag management                        │
│  ├── Featured image upload                                  │
│  └── Custom fields for intelligence tracking                │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/seo-intelligence-suite.git
cd seo-intelligence-suite
node scripts/setup.js
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Generate Your First Brief

```bash
# Basic usage
node cli/seo-agent.js generate "celebrity breakup"

# With options
node cli/seo-agent.js generate "rapper net worth"   --keywords "drake,kendrick"   --style net-worth-financial   --category net-worth

# Batch processing
node cli/seo-agent.js batch topics.json --output ./seo-output
```

### 4. Start Server (for n8n integration)

```bash
node cli/seo-agent.js server --port 3000
```

---

## Docker Deployment

```bash
# Full stack with Redis, Postgres, n8n
docker-compose up -d

# Health check
curl http://localhost:3000/health

# n8n workflow automation
open http://localhost:5678
```

---

## n8n Integration

The suite exposes a webhook-compatible server at `/generate`:

```json
POST http://localhost:3000/generate
Content-Type: application/json

{
  "topic": "viral celebrity moment",
  "options": {
    "category": "viral-moments",
    "style": "viral-breaking",
    "keywords": ["tiktok", "trending"]
  }
}
```

**n8n Workflow Nodes:**
1. **Trigger** → Webhook or Cron
2. **SEO Agent** → HTTP Request to `/generate`
3. **Quality Gate** → If status === "PUBLISH_READY"
4. **WordPress** → XML-RPC publish
5. **Social Queue** → Buffer/schedule posts
6. **Monitor** → Rank tracking loop

---

## HypeFresh Category Mapping

| Category | Style Module | Schema | Social Priority |
|----------|-------------|--------|-----------------|
| `exclusive-interviews` | Celebrity & Entertainment | NewsArticle | Instagram, YouTube |
| `net-worth` | Net Worth/Financial | Article | Instagram, Twitter, TikTok |
| `viral-moments` | Viral/Breaking | NewsArticle | TikTok, Twitter, Instagram |
| `hip-hop` | Hip-Hop/Urban | NewsArticle | Twitter, Instagram, TikTok |
| `scandal` | Scandal/Drama | NewsArticle | Twitter, Instagram |
| `breaking-news` | Viral/Breaking | NewsArticle | Twitter, Instagram, TikTok |
| `celebrity-relationships` | Celebrity & Entertainment | NewsArticle | Instagram, Twitter |
| `music-releases` | Hip-Hop/Urban | MusicRecording | TikTok, Instagram, Twitter |
| `social-media-drama` | Social-Viral | SocialMediaPosting | Twitter, TikTok, Instagram |
| `legal-battles` | Scandal/Drama | NewsArticle | Twitter, YouTube |
| `award-shows` | Celebrity & Entertainment | Event | Twitter, Instagram, TikTok |

---

## The "Never" List (Anti-AIism)

Banned patterns that destroy credibility:

- **Generic AI phrases**: "ever-evolving landscape", "tapestry", "delve", "leveraging"
- **Structural crutches**: "Firstly/Secondly/Lastly", "In conclusion", "Furthermore"
- **Entertainment cliches**: "broke the internet", "sent shockwaves", "fans are going wild"
- **Overused metaphors**: "journey", "deep dive", "tip of the iceberg", "rabbit hole"
- **Hedging language**: "allegedly" (overuse), "supposedly", "some say"

The filter detects 500+ patterns with severity scoring and auto-suggests replacements.

---

## Quality Gate Thresholds

| Status | Score | Action |
|--------|-------|--------|
| **EXCELLENT** | ≥ 90 | Auto-publish eligible |
| **PUBLISH_READY** | ≥ 85 | Publish with confidence |
| **NEEDS_REVISION** | 75-84 | Apply recommendations |
| **REJECT** | < 75 | Major rewrite required |

---

## Competitor Benchmarks

| Site | Avg Words | Schema | Our Target |
|------|-----------|--------|------------|
| TMZ | 450 | Medium | +10% depth, +20% speed |
| Page Six | 520 | Low | Better schema, deeper sourcing |
| E! Online | 680 | High | Faster publish, native social |
| Complex | 900 | High | Better social, faster breaking |

---

## File Structure

```
seo-intelligence-suite/
├── agents/
│   ├── core/
│   │   ├── content-intelligence-agent.js
│   │   ├── competitor-research-agent.js
│   │   └── social-optimizer.js
│   ├── integrations/
│   │   └── wordpress-publisher.js
│   └── utils/
│       ├── anti-aiism-filter.js
│       ├── quality-gates.js
│       └── linguistic-dna.js
├── cli/
│   ├── seo-agent.js
│   ├── gap-analyzer.js
│   ├── competitor-research.js
│   └── social-optimizer.js
├── config/
│   ├── style-profiles.json
│   ├── category-mapping.json
│   └── thresholds.json
├── scripts/
│   ├── setup.js
│   └── deploy.sh
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | Yes | AI content generation |
| `GSC_CLIENT_EMAIL` | No | Google Search Console data |
| `WP_URL` | No | WordPress XML-RPC endpoint |
| `SUPABASE_URL` | No | Data persistence |
| `N8N_WEBHOOK_URL` | No | Workflow automation |
| `SERP_API_KEY` | No | SERP competitor analysis |
| `TWITTER_BEARER_TOKEN` | No | Social velocity tracking |

---

## License

MIT © Agentic Marketing Pro
