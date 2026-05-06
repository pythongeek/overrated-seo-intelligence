/**
 * Anti-AIism Filter Unit Tests
 */

const AntiAIismFilter = require('../../agents/utils/anti-aiism-filter');

describe('AntiAIismFilter', () => {
  let filter;

  beforeEach(() => {
    filter = new AntiAIismFilter();
  });

  test('detects banned phrases', () => {
    const content = 'In today\'s ever-evolving landscape, we must delve into the tapestry of this journey.';
    const result = filter.scan(content);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  test('clean content passes', () => {
    const content = 'The rapper dropped a new track last night. Fans are reacting on social media.';
    const result = filter.scan(content);
    expect(result.clean).toBe(true);
    expect(result.score).toBe(100);
  });

  test('auto-clean removes AI-isms', () => {
    const content = 'We need to leverage our holistic approach to navigate this landscape.';
    const cleaned = filter.clean(content);
    const result = filter.scan(cleaned);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test('structural patterns detected', () => {
    const content = 'Firstly, this happened. Secondly, that happened. Lastly, we conclude.';
    const result = filter.scan(content);
    const structural = result.violations.filter(v => v.type === 'structural_pattern');
    expect(structural.length).toBeGreaterThan(0);
  });

  test('cliche detection', () => {
    const content = 'This broke the internet and sent shockwaves through social media.';
    const result = filter.scan(content);
    const cliches = result.violations.filter(v => v.type === 'cliche');
    expect(cliches.length).toBeGreaterThan(0);
  });

  test('report generation', () => {
    const content = 'In conclusion, this is a groundbreaking paradigm shift.';
    const report = filter.getReport(content);
    expect(report.risk_level).toBe('high');
    expect(report.recommendation).toContain('MAJOR REWRITE');
  });
});
