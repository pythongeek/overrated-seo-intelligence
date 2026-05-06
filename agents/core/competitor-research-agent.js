/**
 * Competitor Research Agent v2.0
 * Deconstructs top-ranking competitors for any given topic.
 * Extracts: content structure, SEO patterns, social velocity, ranking signals.
 */

'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const LinguisticDNA = require('../utils/linguistic-dna');

class CompetitorResearchAgent {
  constructor(options = {}) {
    this.options = {
      serpApiKey: options.serpApiKey || process.env.SERP_API_KEY,
      scrapingBeeKey: options.scrapingBeeKey || process.env.SCRAPING_BEE_KEY,
      topN: options.topN || 3,
      timeout: options.timeout || 30000,
      ...options
    };
    this.dnaAnalyzer = new LinguisticDNA();
  }

  async research(topic, options = {}) {
    const topN = options.topN || this.options.topN;
    console.log(`[Research] Analyzing top ${topN} competitors for: "${topic}"`);

    // Step 1: SERP Analysis
    const serpResults = await this.fetchSERP(topic);
    const competitors = serpResults.slice(0, topN);

    // Step 2: Content Extraction & Deconstruction
    const deconstructed = [];
    for (const competitor of competitors) {
      try {
        const content = await this.extractContent(competitor.url);
        const dna = this.dnaAnalyzer.analyze(content);
        const seoSignals = this.extractSEOSignals(content, competitor.url);
        const socialSignals = await this.checkSocialSignals(competitor.url, topic);

        deconstructed.push({
          url: competitor.url,
          title: competitor.title,
          position: competitor.position,
          content_length: content.length,
          dna,
          seo_signals: seoSignals,
          social_signals: socialSignals,
          weaknesses: this.identifyWeaknesses(dna, seoSignals),
          opportunities: this.identifyOpportunities(dna, seoSignals, socialSignals),
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.warn(`[Research] Failed to analyze ${competitor.url}: ${err.message}`);
        deconstructed.push({
          url: competitor.url,
          title: competitor.title,
          position: competitor.position,
          error: err.message
        });
      }
    }

    // Step 3: Gap Analysis
    const gapAnalysis = this.analyzeGaps(deconstructed);

    // Step 4: Beat Strategy
    const beatStrategy = this.generateBeatStrategy(deconstructed, gapAnalysis);

    return {
      topic,
      query_time: new Date().toISOString(),
      competitors_analyzed: deconstructed.length,
      serp_results: serpResults,
      deconstructed,
      gap_analysis: gapAnalysis,
      beat_strategy: beatStrategy,
      aggregate_stats: this.calculateAggregateStats(deconstructed)
    };
  }

  async fetchSERP(topic) {
    if (!this.options.serpApiKey) {
      // Simulated SERP for demo/development
      return this.simulateSERP(topic);
    }

    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: topic,
          api_key: this.options.serpApiKey,
          engine: 'google',
          num: 10
        },
        timeout: this.options.timeout
      });

      return (response.data.organic_results || []).map((r, idx) => ({
        position: idx + 1,
        title: r.title,
        url: r.link,
        snippet: r.snippet
      }));
    } catch (err) {
      console.warn('[Research] SERP API failed, using simulated data');
      return this.simulateSERP(topic);
    }
  }

  simulateSERP(topic) {
    return [
      { position: 1, title: `TMZ: ${topic} - Breaking News`, url: `https://tmz.com/${this.slugify(topic)}`, snippet: 'Breaking news update...' },
      { position: 2, title: `Page Six: ${topic} Details`, url: `https://pagesix.com/${this.slugify(topic)}`, snippet: 'Exclusive details...' },
      { position: 3, title: `E! News: ${topic}`, url: `https://eonline.com/${this.slugify(topic)}`, snippet: 'Entertainment news...' }
    ];
  }

  async extractContent(url) {
    // In production: Use Puppeteer or ScrapingBee for JS-rendered sites
    // For now, return simulated content based on URL patterns
    if (url.includes('tmz')) {
      return this.simulateTMZContent();
    } else if (url.includes('pagesix')) {
      return this.simulatePageSixContent();
    } else if (url.includes('eonline')) {
      return this.simulateEOnlineContent();
    }
    return 'Generic competitor content for analysis.';
  }

  simulateTMZContent() {
    return `BREAKING: This just happened and sources close to the situation tell TMZ it is developing fast. The star was spotted at an exclusive location earlier today. Fans are absolutely losing it on social media right now. We have reached out for comment but have not heard back yet. Stay tuned for updates as this story develops.`;
  }

  simulatePageSixContent() {
    return `Exclusive details have emerged. An insider familiar with the matter tells Page Six that this is bigger than anyone expected. The celebrity world is buzzing. Social media reactions have been pouring in since the news broke. Representatives did not immediately respond to our request for comment.`;
  }

  simulateEOnlineContent() {
    return `Here is everything you need to know about what just happened. E! News has learned exclusive details about the situation. The internet is reacting and here is what fans are saying. This story is still developing and we will continue to update as more information becomes available.`;
  }

  extractSEOSignals(content, url) {
    const $ = cheerio.load(`<html><body>${content}</body></html>`);

    return {
      word_count: content.split(/\s+/).length,
      heading_count: $('h1, h2, h3').length,
      has_schema: content.includes('schema.org') || content.includes('application/ld+json'),
      internal_links: (content.match(/https?:\/\//g) || []).length,
      image_count: (content.match(/<img/g) || []).length,
      video_embed: content.includes('youtube') || content.includes('vimeo'),
      social_embeds: content.includes('twitter.com') || content.includes('instagram.com'),
      freshness_signals: content.includes('UPDATE') || content.includes('BREAKING'),
      keyword_density: this.calculateKeywordDensity(content, url),
      readability_score: this.estimateReadability(content)
    };
  }

  calculateKeywordDensity(content, url) {
    const words = content.toLowerCase().split(/\s+/);
    const keyword = url.split('/').pop().replace(/-/g, ' ');
    const matches = words.filter(w => w.includes(keyword)).length;
    return ((matches / words.length) * 100).toFixed(2);
  }

  estimateReadability(content) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/);
    const avgSentenceLength = words.length / sentences.length;
    return avgSentenceLength < 12 ? 'easy' : avgSentenceLength < 18 ? 'medium' : 'hard';
  }

  async checkSocialSignals(url, topic) {
    // In production: Use Twitter API, Facebook Graph API, etc.
    return {
      twitter_mentions: Math.floor(Math.random() * 5000) + 100,
      twitter_sentiment: 'mixed',
      instagram_posts: Math.floor(Math.random() * 2000) + 50,
      tiktok_views: Math.floor(Math.random() * 100000) + 1000,
      trending_hashtags: [`#${topic.replace(/\s+/g, '')}`, '#BREAKING', '#Exclusive'],
      velocity: 'high'
    };
  }

  identifyWeaknesses(dna, seo) {
    const weaknesses = [];
    if (dna.overview?.word_count < 400) weaknesses.push('Thin content (< 400 words)');
    if (seo.heading_count < 3) weaknesses.push('Weak heading structure');
    if (!seo.has_schema) weaknesses.push('No schema markup');
    if (seo.readability_score === 'hard') weaknesses.push('Overly complex readability');
    if (seo.freshness_signals === false) weaknesses.push('No freshness signals');
    if (dna.hook_analysis?.hook_strength === 'weak') weaknesses.push('Weak hooks');
    if (dna.forward_looking?.statements < 2) weaknesses.push('No forward-looking content');
    return weaknesses;
  }

  identifyOpportunities(dna, seo, social) {
    const opportunities = [];
    if (social.velocity === 'high') opportunities.push('Ride the social wave with faster publish');
    if (!seo.video_embed) opportunities.push('Add video embed for richer content');
    if (!seo.social_embeds) opportunities.push('Embed social reactions natively');
    if (seo.word_count < 600) opportunities.push('Go deeper with 800+ words');
    opportunities.push('Beat freshness with real-time updates');
    opportunities.push('Add exclusive angle not covered by competitors');
    return opportunities;
  }

  analyzeGaps(deconstructed) {
    const allWeaknesses = deconstructed.flatMap(c => c.weaknesses || []);
    const weaknessFrequency = {};
    allWeaknesses.forEach(w => { weaknessFrequency[w] = (weaknessFrequency[w] || 0) + 1; });

    const allOpportunities = deconstructed.flatMap(c => c.opportunities || []);
    const opportunityFrequency = {};
    allOpportunities.forEach(o => { opportunityFrequency[o] = (opportunityFrequency[o] || 0) + 1; });

    return {
      common_weaknesses: Object.entries(weaknessFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      common_opportunities: Object.entries(opportunityFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      content_gaps: this.identifyContentGaps(deconstructed),
      ranking_gaps: this.identifyRankingGaps(deconstructed)
    };
  }

  identifyContentGaps(deconstructed) {
    const gaps = [];
    const hasVideo = deconstructed.some(c => c.seo_signals?.video_embed);
    const hasSocialEmbed = deconstructed.some(c => c.seo_signals?.social_embeds);
    const hasSchema = deconstructed.some(c => c.seo_signals?.has_schema);

    if (!hasVideo) gaps.push('No competitor using video embeds — opportunity');
    if (!hasSocialEmbed) gaps.push('No native social embeds — first-mover advantage');
    if (!hasSchema) gaps.push('Schema markup gap across all competitors');

    return gaps;
  }

  identifyRankingGaps(deconstructed) {
    return {
      avg_word_count: Math.round(deconstructed.reduce((sum, c) => sum + (c.seo_signals?.word_count || 0), 0) / deconstructed.length),
      fastest_publish: 'Unknown — monitor via RSS',
      schema_adoption: deconstructed.filter(c => c.seo_signals?.has_schema).length / deconstructed.length,
      freshness_adoption: deconstructed.filter(c => c.seo_signals?.freshness_signals).length / deconstructed.length
    };
  }

  generateBeatStrategy(deconstructed, gaps) {
    const avgWordCount = gaps.ranking_gaps?.avg_word_count || 500;

    return {
      content_strategy: {
        target_word_count: Math.round(avgWordCount * 1.1),
        target_depth: '10% more detailed than position #1',
        schema_required: true,
        video_embed: true,
        social_embed: true,
        freshness_signals: ['UPDATE', 'BREAKING', 'JUST IN']
      },
      speed_strategy: {
        target_publish_time: 'Within 20% of first competitor',
        update_frequency: 'Real-time updates every 15 minutes for breaking news'
      },
      social_strategy: {
        platform_priority: ['twitter', 'tiktok', 'instagram'],
        native_content: true,
        engagement_hooks: ['Quote-tweet bait', 'Thread format', 'Duet-ready']
      },
      seo_strategy: {
        internal_linking_depth: 3,
        ls_keywords: 5,
        meta_optimization: 'Dynamic based on social sentiment'
      }
    };
  }

  calculateAggregateStats(deconstructed) {
    const valid = deconstructed.filter(c => !c.error);
    if (valid.length === 0) return {};

    return {
      avg_word_count: Math.round(valid.reduce((sum, c) => sum + (c.seo_signals?.word_count || 0), 0) / valid.length),
      avg_heading_count: Math.round(valid.reduce((sum, c) => sum + (c.seo_signals?.heading_count || 0), 0) / valid.length),
      schema_adoption_rate: (valid.filter(c => c.seo_signals?.has_schema).length / valid.length * 100).toFixed(1) + '%',
      freshness_adoption_rate: (valid.filter(c => c.seo_signals?.freshness_signals).length / valid.length * 100).toFixed(1) + '%',
      total_social_mentions: valid.reduce((sum, c) => sum + (c.social_signals?.twitter_mentions || 0), 0)
    };
  }

  slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
}

module.exports = CompetitorResearchAgent;
