/**
 * Quality Gates System
 * Multi-dimensional scoring with weighted dimensions for content validation.
 * Ensures only industry-standard content passes to publication.
 * 
 * @module agents/utils/quality-gates
 * @version 2.0.0
 */

'use strict';

const thresholds = require('../../config/thresholds.json');

class QualityGates {
  constructor(customThresholds = {}) {
    this.config = {
      ...thresholds.quality_gates,
      ...customThresholds
    };
    this.dimensions = this.config.dimensions;
  }

  /**
   * Run full quality assessment on content brief
   * @param {Object} contentBrief - The generated content brief
   * @param {Object} competitorAnalysis - Competitor data for benchmarking
   * @returns {Object} Full quality report with pass/fail status
   */
  assess(contentBrief, competitorAnalysis = {}) {
    const scores = {
      factual_accuracy: this.scoreFactualAccuracy(contentBrief),
      style_adherence: this.scoreStyleAdherence(contentBrief),
      seo_optimization: this.scoreSEO(contentBrief),
      social_optimization: this.scoreSocialOptimization(contentBrief),
      readability: this.scoreReadability(contentBrief),
      engagement_potential: this.scoreEngagement(contentBrief, competitorAnalysis)
    };

    // Calculate weighted total
    let totalScore = 0;
    let totalWeight = 0;

    for (const [dimension, config] of Object.entries(this.dimensions)) {
      const score = scores[dimension] || 0;
      totalScore += score * config.weight;
      totalWeight += config.weight;
    }

    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

    // Determine status
    const status = this.determineStatus(finalScore, scores);

    return {
      final_score: finalScore,
      status,
      scores,
      dimensions_passed: Object.entries(scores).filter(([k, v]) => v >= (this.dimensions[k]?.min || 0)).length,
      dimensions_total: Object.keys(this.dimensions).length,
      recommendations: this.generateRecommendations(scores),
      competitor_comparison: this.compareToCompetitors(finalScore, competitorAnalysis),
      timestamp: new Date().toISOString()
    };
  }

  scoreFactualAccuracy(brief) {
    let score = 100;

    // Check for hallucination markers
    if (brief.hallucination_flags?.length > 0) {
      score -= brief.hallucination_flags.length * 15;
    }

    // Check quote verification
    if (brief.quotes && brief.quotes.length > 0) {
      const unverifiedQuotes = brief.quotes.filter(q => !q.verified).length;
      score -= unverifiedQuotes * 10;
    }

    // Check source attribution
    if (!brief.sources || brief.sources.length === 0) {
      score -= 20;
    } else {
      const weakSources = brief.sources.filter(s => s.type === 'unverified').length;
      score -= weakSources * 5;
    }

    // Check factual grounding
    if (brief.factual_grounding === 'weak') score -= 15;
    if (brief.factual_grounding === 'medium') score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  scoreStyleAdherence(brief) {
    let score = 100;

    if (!brief.style_profile) return 50;

    const profile = brief.style_profile;

    // Word count adherence
    if (brief.word_count) {
      const { min, max, target } = profile.word_count || {};
      if (min && brief.word_count < min) score -= 10;
      if (max && brief.word_count > max) score -= 10;
      if (target && Math.abs(brief.word_count - target) > target * 0.2) score -= 5;
    }

    // Tone markers present
    if (profile.tone_markers) {
      const missingTones = profile.tone_markers.filter(
        tone => !brief.detected_tones?.includes(tone)
      ).length;
      score -= missingTones * 5;
    }

    // Required elements
    if (profile.required_elements) {
      const missingElements = profile.required_elements.filter(
        el => !brief.elements?.includes(el)
      ).length;
      score -= missingElements * 8;
    }

    // Banned phrases check
    if (brief.ai_ism_score !== undefined) {
      score -= (100 - brief.ai_ism_score) * 0.5;
    }

    return Math.max(0, Math.min(100, score));
  }

  scoreSEO(brief) {
    let score = 100;

    // Title optimization
    if (!brief.seo?.title) {
      score -= 20;
    } else {
      const title = brief.seo.title;
      if (title.length < 30) score -= 10;
      if (title.length > 60) score -= 5;
      if (!title.includes(brief.primary_keyword)) score -= 15;
    }

    // Meta description
    if (!brief.seo?.meta_description) {
      score -= 15;
    } else {
      const meta = brief.seo.meta_description;
      if (meta.length < 120) score -= 5;
      if (meta.length > 160) score -= 5;
    }

    // Schema markup
    if (!brief.seo?.schema_type) score -= 10;

    // Internal linking
    if (!brief.seo?.internal_links || brief.seo.internal_links.length === 0) {
      score -= 10;
    }

    // Keyword density
    if (brief.keyword_density !== undefined) {
      if (brief.keyword_density < 0.5) score -= 10;
      if (brief.keyword_density > 2.5) score -= 15; // Keyword stuffing
    }

    // Heading structure
    if (!brief.seo?.headings || brief.seo.headings.length === 0) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  scoreSocialOptimization(brief) {
    let score = 100;

    if (!brief.social) return 50;

    // Platform-specific hooks
    const platforms = ['twitter', 'instagram', 'tiktok', 'facebook'];
    platforms.forEach(platform => {
      if (!brief.social[platform]) {
        score -= 8;
      } else {
        if (!brief.social[platform].hook) score -= 5;
        if (!brief.social[platform].hashtags || brief.social[platform].hashtags.length === 0) {
          score -= 3;
        }
      }
    });

    // Shareability factors
    if (!brief.social.shareability_score) score -= 10;
    if (brief.social.engagement_triggers?.length === 0) score -= 10;

    // Visual cues for social
    if (!brief.social.visual_cues || brief.social.visual_cues.length === 0) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  scoreReadability(brief) {
    let score = 100;

    if (!brief.readability) return 70;

    const { flesch_kincaid, grade_level, sentence_length_avg } = brief.readability;

    // Flesch Reading Ease (higher is easier)
    if (flesch_kincaid !== undefined) {
      if (flesch_kincaid < 30) score -= 20; // Very difficult
      else if (flesch_kincaid < 50) score -= 10; // Difficult
      else if (flesch_kincaid > 90) score -= 5; // Too simple
    }

    // Grade level target based on style
    const targetGrade = brief.style_profile?.readability_target || 'Grade 8-10';
    const targetMin = parseInt(targetGrade.match(/\d+/)?.[0] || 8);

    if (grade_level) {
      if (grade_level < targetMin - 2) score -= 10;
      if (grade_level > targetMin + 3) score -= 15;
    }

    // Sentence length variance
    if (sentence_length_avg) {
      const targetLength = brief.style_profile?.sentence_structure?.avg_length || 14;
      if (Math.abs(sentence_length_avg - targetLength) > 5) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  scoreEngagement(brief, competitorAnalysis) {
    let score = 100;

    // Hook strength
    if (!brief.hooks || brief.hooks.length === 0) {
      score -= 20;
    } else {
      const weakHooks = brief.hooks.filter(h => h.strength === 'weak').length;
      score -= weakHooks * 10;
    }

    // Emotional resonance
    if (!brief.sentiment_map || brief.sentiment_map.intensity < 0.3) {
      score -= 15;
    }

    // Forward-looking statements (keeps readers engaged)
    if (!brief.forward_looking_statements || brief.forward_looking_statements.length === 0) {
      score -= 10;
    }

    // Comparison to competitor engagement
    if (competitorAnalysis.avg_engagement) {
      if (brief.predicted_engagement < competitorAnalysis.avg_engagement * 1.1) {
        score -= 10;
      }
    }

    // Pattern interrupt usage
    if (!brief.pattern_interrupts || brief.pattern_interrupts.length === 0) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  determineStatus(finalScore, dimensionScores) {
    const minDimensionScore = Math.min(...Object.values(dimensionScores));

    if (finalScore >= this.config.excellent_score && minDimensionScore >= 80) {
      return 'EXCELLENT';
    }
    if (finalScore >= this.config.publish_ready && minDimensionScore >= 70) {
      return 'PUBLISH_READY';
    }
    if (finalScore >= this.config.minimum_score) {
      return 'NEEDS_REVISION';
    }
    return 'REJECT';
  }

  generateRecommendations(scores) {
    const recommendations = [];

    if (scores.factual_accuracy < 80) {
      recommendations.push('Verify all quotes and add primary source attribution');
    }
    if (scores.style_adherence < 75) {
      recommendations.push('Adjust tone to match style profile and remove generic phrasing');
    }
    if (scores.seo_optimization < 80) {
      recommendations.push('Optimize title length, add schema markup, improve internal linking');
    }
    if (scores.social_optimization < 70) {
      recommendations.push('Add platform-specific hooks and engagement triggers');
    }
    if (scores.readability < 70) {
      recommendations.push('Adjust sentence length and vocabulary to target grade level');
    }
    if (scores.engagement_potential < 75) {
      recommendations.push('Strengthen hooks and add pattern interrupts');
    }

    return recommendations;
  }

  compareToCompetitors(score, competitorAnalysis) {
    if (!competitorAnalysis.competitors || competitorAnalysis.competitors.length === 0) {
      return { advantage: 'unknown', margin: 0 };
    }

    const avgCompetitorScore = competitorAnalysis.competitors.reduce(
      (sum, c) => sum + (c.quality_score || 70), 0
    ) / competitorAnalysis.competitors.length;

    const margin = score - avgCompetitorScore;

    return {
      advantage: margin > 10 ? 'significant' : margin > 0 ? 'marginal' : 'behind',
      margin: Math.round(margin),
      competitor_avg: Math.round(avgCompetitorScore),
      target_beat: '10% better on depth, 20% faster on publish'
    };
  }

  /**
   * Quick pass/fail check for pipeline use
   * @param {Object} brief 
   * @returns {boolean}
   */
  isPublishReady(brief) {
    const result = this.assess(brief);
    return result.status === 'PUBLISH_READY' || result.status === 'EXCELLENT';
  }
}

module.exports = QualityGates;
