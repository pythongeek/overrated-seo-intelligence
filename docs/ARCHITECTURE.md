# Architecture Documentation

## System Overview

The SEO Intelligence Suite is a multi-agent system designed to systematically outrank entertainment media competitors through data-driven content intelligence.

## Agent Hierarchy

```
CLI / Webhook Interface (seo-agent.js server)
       |
ContentIntelligenceAgent (Orchestrator)
       |
   +---+---+
   |       |
Competitor    SocialOptimizer
Research      (Twitter, IG, TikTok, FB)
Agent         
   |
QualityGates (0-100 scoring)
   |
WordPressPublisher (XML-RPC + Rank Math + Schema)
```

## Data Flow

1. **Input** → Topic + category/style/keywords
2. **Research** → SERP fetch → Content extraction → DNA analysis
3. **Calibration** → Style profile + competitor DNA → Target metrics
4. **Generation** → Brief with headlines, outline, hooks, SEO
5. **Validation** → Anti-AIism filter → Quality gates → Self-correction
6. **Optimization** → Platform-native social content
7. **Publication** → WordPress XML-RPC with schema + Rank Math
8. **Monitoring** → Rank tracking + social velocity (future)

## Extension Points

- **New Style Modules**: Add to `config/style-profiles.json`
- **New Categories**: Add to `config/category-mapping.json`
- **New Platforms**: Extend `SocialOptimizer` with adapter class
- **New Integrations**: Add publisher to `agents/integrations/`
- **Custom Filters**: Pass patterns to `AntiAIismFilter`
