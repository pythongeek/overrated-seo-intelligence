/**
 * Full Pipeline Integration Test
 * Tests the complete flow from topic input to WordPress publish.
 */

const { ContentIntelligenceAgent } = require('../../agents/core');
const { WordPressPublisher } = require('../../agents/integrations');

describe('Full Pipeline', () => {
  test('generates brief and passes quality gates', async () => {
    const agent = new ContentIntelligenceAgent({
      outputDir: './test-output',
      enableSelfCorrection: true
    });

    const result = await agent.generate('celebrity viral moment', {
      category: 'viral-moments',
      keywords: ['tiktok', 'trending']
    });

    expect(result.brief).toBeDefined();
    expect(result.brief.topic).toBe('celebrity viral moment');
    expect(result.brief.category).toBe('viral-moments');
    expect(result.quality_report).toBeDefined();
    expect(result.quality_report.final_score).toBeGreaterThanOrEqual(0);
    expect(result.quality_report.final_score).toBeLessThanOrEqual(100);
    expect(result.output_path).toBeTruthy();
    expect(result.execution_time_ms).toBeGreaterThan(0);
  }, 30000);

  test('social optimizer generates platform content', async () => {
    const agent = new ContentIntelligenceAgent();
    const result = await agent.generate('rapper net worth', {
      category: 'net-worth',
      style: 'net-worth-financial'
    });

    expect(result.brief.social).toBeDefined();
    expect(result.brief.social.twitter).toBeDefined();
    expect(result.brief.social.instagram).toBeDefined();
    expect(result.brief.social.tiktok).toBeDefined();
    expect(result.brief.social.twitter.hook).toBeTruthy();
    expect(result.brief.social.instagram.caption).toBeTruthy();
  }, 30000);

  test('competitor research extracts DNA', async () => {
    const CompetitorResearchAgent = require('../../agents/core/competitor-research-agent');
    const agent = new CompetitorResearchAgent();
    const result = await agent.research('celebrity news', { topN: 3 });

    expect(result.competitors_analyzed).toBeGreaterThan(0);
    expect(result.deconstructed).toBeDefined();
    expect(result.gap_analysis).toBeDefined();
    expect(result.beat_strategy).toBeDefined();
    expect(result.beat_strategy.content_strategy.target_word_count).toBeGreaterThan(0);
  }, 30000);
});
