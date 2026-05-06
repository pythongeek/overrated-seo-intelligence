/**
 * Quality Gates Unit Tests
 */

const QualityGates = require('../../agents/utils/quality-gates');

describe('QualityGates', () => {
  let gates;

  beforeEach(() => {
    gates = new QualityGates();
  });

  test('excellent content passes all gates', () => {
    const brief = {
      topic: 'Test',
      style_profile: { word_count: { min: 400, max: 700, target: 550 }, tone_markers: ['witty'], required_elements: ['human element'] },
      word_count: 550,
      detected_tones: ['witty'],
      elements: ['human element'],
      seo: { title: 'Test Title Under Sixty Characters', meta_description: 'A proper meta description that is long enough to pass the gate.', schema_type: 'NewsArticle', internal_links: [{ url: '/', anchor: 'Home' }], headings: [{ level: 1, text: 'Test' }] },
      readability: { flesch_kincaid: 60, grade_level: 8, sentence_length_avg: 14 },
      hooks: [{ type: 'pattern_interrupt', strength: 'strong' }],
      sentiment_map: { intensity: 0.7 },
      forward_looking_statements: ['Next chapter coming soon.'],
      pattern_interrupts: [{ type: 'short_sentence' }],
      predicted_engagement: 90,
      ai_ism_score: 95,
      factual_grounding: 'strong',
      sources: [{ type: 'verified', url: 'https://example.com' }],
      quotes: [{ text: 'Quote', verified: true }]
    };

    const result = gates.assess(brief);
    expect(result.status).toBe('EXCELLENT');
    expect(result.final_score).toBeGreaterThanOrEqual(90);
  });

  test('thin content gets rejected', () => {
    const brief = {
      topic: 'Test',
      style_profile: { word_count: { min: 400, max: 700, target: 550 } },
      word_count: 200,
      seo: {},
      readability: {},
      hooks: [],
      ai_ism_score: 50
    };

    const result = gates.assess(brief);
    expect(result.status).toBe('REJECT');
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  test('publish ready threshold', () => {
    const brief = {
      topic: 'Test',
      style_profile: { word_count: { min: 400, max: 700, target: 550 }, tone_markers: ['urgent'], required_elements: [] },
      word_count: 500,
      detected_tones: ['urgent'],
      elements: [],
      seo: { title: 'Good Title', meta_description: 'Good description here.', schema_type: 'NewsArticle', internal_links: [{ url: '/', anchor: 'Home' }], headings: [{ level: 1, text: 'Test' }] },
      readability: { flesch_kincaid: 55, grade_level: 9, sentence_length_avg: 12 },
      hooks: [{ type: 'banner_hook', strength: 'strong' }],
      sentiment_map: { intensity: 0.5 },
      forward_looking_statements: ['Updates soon.'],
      pattern_interrupts: [{ type: 'statistic_drop' }],
      predicted_engagement: 80,
      ai_ism_score: 88,
      factual_grounding: 'medium',
      sources: [{ type: 'unverified' }],
      quotes: []
    };

    const result = gates.assess(brief);
    expect(result.status).toBe('PUBLISH_READY');
    expect(gates.isPublishReady(brief)).toBe(true);
  });

  test('competitor comparison', () => {
    const brief = {
      topic: 'Test',
      style_profile: { word_count: { target: 500 } },
      word_count: 500,
      seo: { title: 'Title', meta_description: 'Desc', schema_type: 'NewsArticle', internal_links: [{ url: '/' }], headings: [{ level: 1, text: 'H1' }] },
      readability: { flesch_kincaid: 60, grade_level: 8 },
      hooks: [{ strength: 'strong' }],
      sentiment_map: { intensity: 0.6 },
      forward_looking_statements: ['Next.'],
      pattern_interrupts: [{}],
      predicted_engagement: 85,
      ai_ism_score: 92,
      factual_grounding: 'strong',
      sources: [{ type: 'verified' }],
      quotes: [{ verified: true }]
    };

    const competitorAnalysis = {
      competitors: [
        { quality_score: 70 },
        { quality_score: 75 },
        { quality_score: 72 }
      ]
    };

    const result = gates.assess(brief, competitorAnalysis);
    expect(result.competitor_comparison.advantage).toBe('significant');
    expect(result.competitor_comparison.margin).toBeGreaterThan(0);
  });
});
