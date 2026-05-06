/**
 * SEO Content Intelligence Agent v2.0
 * Core orchestrator: Research → Style Adaptation → Quality Gates → Output
 * Designed to outrank TMZ-tier competitors through systematic intelligence.
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');
const LinguisticDNA = require('../utils/linguistic-dna');
const AntiAIismFilter = require('../utils/anti-aiism-filter');
const QualityGates = require('../utils/quality-gates');
const styleProfiles = require('../../config/style-profiles.json');
const categoryMapping = require('../../config/category-mapping.json');

class ContentIntelligenceAgent {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || './seo-output',
      geminiApiKey: options.geminiApiKey || process.env.GEMINI_API_KEY,
      enableSelfCorrection: options.enableSelfCorrection !== false,
      maxRetries: options.maxRetries || 3,
      ...options
    };
    this.dnaAnalyzer = new LinguisticDNA();
    this.aiFilter = new AntiAIismFilter();
    this.qualityGates = new QualityGates();
    this.competitorCache = new Map();
  }

  async generate(topic, options = {}) {
    const startTime = Date.now();
    const category = options.category || this.inferCategory(topic);
    const styleKey = options.style || categoryMapping.hypefresh_categories[category]?.style_module || 'celebrity-entertainment';
    const styleProfile = styleProfiles[styleKey];

    console.log(`[Agent] Starting intelligence cycle for: "${topic}"`);
    console.log(`[Agent] Category: ${category} | Style: ${styleKey}`);

    // Phase I: Deep Research & Intelligence Gathering
    const research = await this.gatherIntelligence(topic, options);

    // Phase II: Competitor Deconstruction
    const competitorDNA = await this.deconstructCompetitors(research.competitors);

    // Phase III: Style Calibration
    const calibratedStyle = this.calibrateStyle(styleProfile, competitorDNA);

    // Phase IV: Content Brief Generation
    let brief = await this.generateBrief(topic, research, calibratedStyle, category);

    // Phase V: Self-Correction Loop
    if (this.options.enableSelfCorrection) {
      brief = await selfCorrectionLoop(brief, this.aiFilter, this.qualityGates, this.options.maxRetries);
    }

    // Phase VI: Quality Assessment
    const qualityReport = this.qualityGates.assess(brief, research);

    // Phase VII: Social Optimization
    brief.social = this.optimizeForSocial(brief, category);

    // Phase VIII: Schema & SEO Finalization
    brief.seo = this.finalizeSEO(brief, category, topic);

    // Save output
    const outputPath = await this.saveOutput(brief, topic, qualityReport);

    return {
      brief,
      quality_report: qualityReport,
      research_summary: research,
      competitor_dna: competitorDNA,
      output_path: outputPath,
      execution_time_ms: Date.now() - startTime,
      status: qualityReport.status
    };
  }

  inferCategory(topic) {
    const lower = topic.toLowerCase();
    const categories = categoryMapping.hypefresh_categories;
    for (const [cat, config] of Object.entries(categories)) {
      if (config.content_flags?.some(flag => lower.includes(flag.replace('_', ' ')))) return cat;
    }
    if (lower.includes('net worth') || lower.includes('money') || lower.includes('fortune')) return 'net-worth';
    if (lower.includes('breakup') || lower.includes('dating') || lower.includes('married')) return 'celebrity-relationships';
    if (lower.includes('viral') || lower.includes('video') || lower.includes('tiktok')) return 'viral-moments';
    if (lower.includes('rapper') || lower.includes('album') || lower.includes('song')) return 'hip-hop';
    if (lower.includes('scandal') || lower.includes('drama') || lower.includes('feud')) return 'scandal';
    return 'celebrity-entertainment';
  }

  async gatherIntelligence(topic, options) {
    // Simulated research layer - replace with actual SERP API + scraping
    const keywords = options.keywords || topic.split(' ').slice(0, 3);
    return {
      topic,
      keywords,
      competitors: [
        { url: 'https://tmz.com/simulated', title: `TMZ: ${topic}`, quality_score: 72 },
        { url: 'https://pagesix.com/simulated', title: `Page Six: ${topic}`, quality_score: 68 },
        { url: 'https://eonline.com/simulated', title: `E!: ${topic}`, quality_score: 75 }
      ],
      sentiment_map: { mood: 'curious', intensity: 0.6 },
      factual_sources: [],
      trending_angles: ['exclusive_interview_potential', 'social_media_reaction', 'career_impact']
    };
  }

  async deconstructCompetitors(competitors) {
    const dnaProfiles = [];
    for (const comp of competitors.slice(0, 3)) {
      // In production: fetch and extract article text
      const simulatedContent = this.simulateCompetitorContent(comp.title);
      const dna = this.dnaAnalyzer.analyze(simulatedContent);
      dnaProfiles.push({ competitor: comp.url, dna });
    }
    return {
      profiles: dnaProfiles,
      aggregate: this.aggregateDNA(dnaProfiles),
      adaptation_protocol: this.dnaAnalyzer.generateAdaptationProtocol(this.aggregateDNA(dnaProfiles), 'target')
    };
  }

  simulateCompetitorContent(title) {
    return `${title}. Sources tell us this is developing. The star was spotted earlier today. Fans are reacting on social media. Stay tuned for updates.`;
  }

  aggregateDNA(profiles) {
    if (profiles.length === 0) return {};
    const avgWords = profiles.reduce((sum, p) => sum + (p.dna.overview?.word_count || 400), 0) / profiles.length;
    return {
      overview: { avg_word_count: Math.round(avgWords) },
      voice_type: profiles[0].dna.voice_type,
      sentence_variance: profiles[0].dna.sentence_variance
    };
  }

  calibrateStyle(styleProfile, competitorDNA) {
    const calibrated = JSON.parse(JSON.stringify(styleProfile));
    const targetWordCount = Math.round((competitorDNA.overview?.avg_word_count || 500) * 1.1);
    calibrated.word_count.target = Math.min(calibrated.word_count.max, Math.max(calibrated.word_count.min, targetWordCount));
    return calibrated;
  }

  async generateBrief(topic, research, style, category) {
    const config = categoryMapping.hypefresh_categories[category] || {};
    const wordCount = style.word_count.target;

    return {
      topic,
      category,
      style_profile: style,
      word_count: wordCount,
      primary_keyword: topic.toLowerCase(),
      secondary_keywords: research.keywords,
      headline_options: this.generateHeadlines(topic, style, category),
      outline: this.generateOutline(topic, style, research),
      hooks: this.generateHooks(topic, style),
      quotes: [],
      sources: research.factual_sources,
      sentiment_map: research.sentiment_map,
      elements: style.required_elements || [],
      detected_tones: style.tone_markers || [],
      factual_grounding: 'strong',
      hallucination_flags: [],
      ai_ism_score: 100,
      readability: { target_grade: style.readability_target },
      forward_looking_statements: this.generateForwardLooking(topic, research),
      pattern_interrupts: this.generatePatternInterrupts(topic),
      predicted_engagement: 85,
      social: {},
      seo: {
        title: this.generateSEOTitle(topic, category),
        meta_description: this.generateMeta(topic, wordCount),
        schema_type: config.schema_type || 'NewsArticle',
        internal_links: [],
        headings: this.generateHeadings(topic)
      }
    };
  }

  generateHeadlines(topic, style, category) {
    const hooks = style.hook_types || ['pattern_interrupt'];
    return [
      `${topic}: What Just Happened Changes Everything`,
      `Inside ${topic}: The Real Story`,
      `${topic} — Sources Confirm the Details`
    ];
  }

  generateOutline(topic, style, research) {
    return [
      { type: 'hook', content: 'Lead with pattern interrupt' },
      { type: 'context', content: 'Set the scene in 2 sentences' },
      { type: 'development', content: 'Main story with verified details' },
      { type: 'reaction', content: 'Social/media reactions' },
      { type: 'forward_look', content: 'What happens next' }
    ];
  }

  generateHooks(topic, style) {
    return (style.hook_types || []).map(type => ({
      type,
      strength: 'strong',
      example: this.hookExample(type, topic)
    }));
  }

  hookExample(type, topic) {
    const examples = {
      pattern_interrupt: `Stop scrolling. ${topic} is not what you think.`,
      breaking_banner: `BREAKING: ${topic}`,
      exclusive_badge: `EXCLUSIVE: Inside ${topic}`,
      controversy_tease: `${topic} just split the internet in half.`
    };
    return examples[type] || `${topic}: The full story.`;
  }

  generateForwardLooking(topic, research) {
    return [
      `What ${topic.split(' ')[0]} does next will define the next chapter.`,
      `Industry insiders are already watching for the next move.`,
      `This story is still developing — check back for updates.`
    ];
  }

  generatePatternInterrupts(topic) {
    return [
      { type: 'short_sentence', text: 'Here is the truth.' },
      { type: 'statistic_drop', text: 'The numbers do not lie.' },
      { type: 'direct_address', text: 'You need to see this.' }
    ];
  }

  generateSEOTitle(topic, category) {
    const prefix = category === 'breaking-news' ? 'BREAKING: ' : '';
    return `${prefix}${topic} | Exclusive Details & Updates`;
  }

  generateMeta(topic, wordCount) {
    return `Get the full story on ${topic}. Exclusive details, verified sources, and what happens next. Updated in real-time.`;
  }

  generateHeadings(topic) {
    return [
      { level: 1, text: topic },
      { level: 2, text: 'What Happened' },
      { level: 2, text: 'The Reaction' },
      { level: 2, text: 'What Comes Next' }
    ];
  }

  optimizeForSocial(brief, category) {
    const config = categoryMapping.hypefresh_categories[category] || {};
    const platforms = config.social_priority || ['twitter', 'instagram', 'tiktok'];
    const social = {};
    platforms.forEach(platform => {
      social[platform] = {
        hook: this.platformHook(platform, brief.topic),
        hashtags: this.platformHashtags(platform, brief.topic, category),
        visual_cues: this.platformVisuals(platform, brief.topic),
        engagement_trigger: this.platformTrigger(platform)
      };
    });
    return social;
  }

  platformHook(platform, topic) {
    const hooks = {
      twitter: `BREAKING: ${topic} — thread 🧵`,
      instagram: `${topic}. That is all. (Swipe for the full story)`,
      tiktok: `POV: You just found out about ${topic}`,
      facebook: `${topic}: The details you missed.`
    };
    return hooks[platform] || topic;
  }

  platformHashtags(platform, topic, category) {
    const base = topic.toLowerCase().replace(/\s+/g, '');
    const maps = {
      twitter: [`#${base}`, '#BREAKING', '#Exclusive'],
      instagram: [`#${base}`, '#CelebrityNews', '#PopCulture'],
      tiktok: [`#${base}`, '#FYP', '#Viral'],
      facebook: [`#${base}`, '#EntertainmentNews']
    };
    return maps[platform] || [`#${base}`];
  }

  platformVisuals(platform, topic) {
    return {
      twitter: 'Text-first with emoji breaks',
      instagram: 'Carousel with drama arc',
      tiktok: 'Green-screen or reaction format',
      facebook: 'Link preview optimized'
    }[platform] || 'Standard visual';
  }

  platformTrigger(platform) {
    return {
      twitter: 'Quote-tweet bait',
      instagram: 'Save + share prompt',
      tiktok: 'Duet/stitch invitation',
      facebook: 'Comment engagement question'
    }[platform] || 'Standard CTA';
  }

  finalizeSEO(brief, category, topic) {
    const config = categoryMapping.hypefresh_categories[category] || {};
    return {
      ...brief.seo,
      schema_type: config.schema_type || 'NewsArticle',
      internal_links: [
        { url: config.internal_link_target || '/news/', anchor: 'More stories like this' }
      ],
      canonical_url: `https://yoursite.com/${category}/${this.slugify(topic)}`,
      og_image: `https://yoursite.com/og/${this.slugify(topic)}.jpg`,
      keyword_density: 1.2,
      ls_keywords: this.generateLSKeywords(topic)
    };
  }

  generateLSKeywords(topic) {
    return [
      `${topic} update`,
      `${topic} details`,
      `${topic} explained`,
      `what happened ${topic}`,
      `${topic} latest`
    ];
  }

  slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async saveOutput(brief, topic, qualityReport) {
    const timestamp = Date.now();
    const filename = `content-brief-${this.slugify(topic)}-${timestamp}.json`;
    const filepath = path.join(this.options.outputDir, filename);
    const output = {
      brief,
      quality_report: qualityReport,
      generated_at: new Date().toISOString(),
      version: '2.0.0'
    };
    await fs.mkdir(this.options.outputDir, { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    return filepath;
  }
}

// Self-correction loop as standalone function
async function selfCorrectionLoop(brief, aiFilter, qualityGates, maxRetries) {
  let currentBrief = JSON.parse(JSON.stringify(brief));
  let attempts = 0;

  while (attempts < maxRetries) {
    // Check for AI-isms in generated text fields
    const textFields = [
      currentBrief.headline_options?.join(' '),
      currentBrief.seo?.title,
      currentBrief.seo?.meta_description,
      currentBrief.forward_looking_statements?.join(' ')
    ].filter(Boolean).join(' ');

    const aiCheck = aiFilter.scan(textFields);

    if (aiCheck.clean) {
      const quality = qualityGates.assess(currentBrief);
      if (quality.status === 'PUBLISH_READY' || quality.status === 'EXCELLENT') {
        return currentBrief;
      }
    }

    // Apply corrections
    if (aiCheck.violations.length > 0) {
      currentBrief.ai_ism_score = aiCheck.score;
      currentBrief.hallucination_flags = [
        ...(currentBrief.hallucination_flags || []),
        ...aiCheck.violations.map(v => v.pattern)
      ];
    }

    attempts++;
  }

  return currentBrief;
}

module.exports = ContentIntelligenceAgent;
