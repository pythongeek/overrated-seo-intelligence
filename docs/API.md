# API Documentation

## REST Endpoints (Server Mode)

### Health Check
```
GET /health
Response: { "status": "healthy", "version": "2.0.0" }
```

### Generate Content Brief
```
POST /generate
Content-Type: application/json

Body:
{
  "topic": "celebrity breakup",
  "options": {
    "category": "celebrity-relationships",
    "style": "celebrity-entertainment",
    "keywords": ["breakup", "divorce", "split"]
  }
}

Response:
{
  "brief": { ... },
  "quality_report": {
    "final_score": 87,
    "status": "PUBLISH_READY",
    "scores": { ... },
    "recommendations": []
  },
  "output_path": "./seo-output/content-brief-...json",
  "execution_time_ms": 2450
}
```

## Programmatic API

```javascript
const { ContentIntelligenceAgent } = require('./agents/core');
const agent = new ContentIntelligenceAgent({ outputDir: './output' });
const result = await agent.generate("topic", { category: "viral-moments" });
if (result.quality_report.status === 'PUBLISH_READY') { /* publish */ }
```

## n8n Webhook Integration

Configure n8n HTTP Request node:
- Method: POST
- URL: http://seo-agent:3000/generate
- Body: JSON with topic and options
- Headers: Content-Type: application/json

Follow with If node checking `quality_report.status === "PUBLISH_READY"`.
