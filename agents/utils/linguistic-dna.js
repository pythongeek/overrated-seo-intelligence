/**
 * Linguistic DNA Analyzer
 * Deconstructs competitor content into measurable patterns for adaptation.
 * @module agents/utils/linguistic-dna
 */

'use strict';

class LinguisticDNA {
  analyze(content) {
    if (!content || content.length < 100) return { error: 'Content too short' };
    const sentences = this.splitSentences(content);
    const tokens = content.split(/\s+/).filter(w => w.length > 0);
    return {
      overview: {
        word_count: tokens.length,
        sentence_count: sentences.length,
        avg_words_per_sentence: Math.round((tokens.length / sentences.length) * 10) / 10
      },
      sentence_variance: this.analyzeSentenceVariance(sentences),
      voice_type: this.detectVoiceType(content, sentences),
      metaphor_density: this.calculateMetaphorDensity(content),
      readability: this.calculateReadability(content, tokens, sentences),
      hook_analysis: this.analyzeHooks(content, sentences),
      forward_looking: this.detectForwardLooking(content),
      timestamp: new Date().toISOString()
    };
  }

  splitSentences(text) {
    return text.replace(/([.?!])\s+(?=[A-Z])/g, "$1|").split("|").map(s => s.trim()).filter(s => s.length > 5);
  }

  analyzeSentenceVariance(sentences) {
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    return {
      average_length: Math.round(avg * 10) / 10,
      standard_deviation: Math.round(stdDev * 10) / 10,
      variance_coefficient: Math.round((stdDev / avg) * 100) / 100,
      pattern: stdDev / avg > 0.5 ? 'high_variance' : stdDev / avg > 0.3 ? 'medium_variance' : 'low_variance'
    };
  }

  detectVoiceType(content, sentences) {
    const lower = content.toLowerCase();
    const firstPerson = (lower.match(/\b(i|me|my|we|us|our)\b/g) || []).length;
    const secondPerson = (lower.match(/\b(you|your)\b/g) || []).length;
    const passive = (lower.match(/\b(was|were|been|being)\s+\w+ed\b/g) || []).length;
    const intensity = (lower.match(/\b(very|extremely|absolutely|completely|really|definitely)\b/gi) || []).length / sentences.length;
    const confidence = Math.min(1, (lower.match(/\b(definitely|certainly|undoubtedly)\b/gi) || []).length / ((lower.match(/\b(maybe|perhaps|possibly)\b/gi) || []).length + 0.01));
    let dominant = 'neutral';
    if (intensity > 0.15 && confidence > 0.7) dominant = 'authoritative';
    else if (intensity > 0.12) dominant = 'conversational';
    else if (passive / sentences.length > 0.3) dominant = 'passive';
    else if (confidence > 0.8) dominant = 'assertive';
    return { dominant, intensity, confidence, passivity: passive / sentences.length };
  }

  calculateMetaphorDensity(content) {
    const metaphors = (content.match(/\b(journey|path|bridge|light|fire|storm|wave|battle|tapestry|landscape)\b/gi) || []).length;
    return { count: metaphors, density: metaphors / content.split(/\s+/).length };
  }

  calculateReadability(content, tokens, sentences) {
    const syllables = tokens.reduce((sum, word) => sum + Math.max(1, word.match(/[aeiouy]/gi)?.length || 1), 0);
    const flesch = 206.835 - 1.015 * (tokens.length / sentences.length) - 84.6 * (syllables / tokens.length);
    return { flesch_kincaid: Math.round(flesch), grade_level: Math.round(0.39 * (tokens.length / sentences.length) + 11.8 * (syllables / tokens.length) - 15.59) };
  }

  analyzeHooks(content, sentences) {
    const hooks = [];
    if (sentences[0]?.length < 15) hooks.push({ type: 'short_punch', text: sentences[0] });
    if (content.match(/^(BREAKING|EXCLUSIVE|JUST IN|UPDATE)/i)) hooks.push({ type: 'banner_hook' });
    if (content.match(/\?/)) hooks.push({ type: 'question_hook' });
    return { hooks, hook_count: hooks.length, hook_strength: hooks.length > 2 ? 'strong' : hooks.length > 0 ? 'medium' : 'weak' };
  }

  detectForwardLooking(content) {
    const patterns = content.match(/\b(will|going to|next|upcoming|future|soon|anticipated|expected|predicted)\b/gi) || [];
    return { statements: patterns.length, density: patterns.length / content.split(/\s+/).length };
  }

  generateAdaptationProtocol(dna, targetStyle) {
    const protocol = {
      target_style: targetStyle,
      adjustments: [],
      target_metrics: {}
    };
    if (dna.sentence_variance?.pattern === 'low_variance') {
      protocol.adjustments.push('Increase sentence length variance by 15%');
      protocol.target_metrics.sentence_variance = 'high';
    }
    if (dna.voice_type?.dominant === 'passive') {
      protocol.adjustments.push('Convert passive constructions to active voice');
    }
    if (dna.forward_looking?.statements < 3) {
      protocol.adjustments.push('Add 2-3 forward-looking statements');
    }
    protocol.adjustments.push('Beat competitor depth by 10%');
    protocol.adjustments.push('Publish 20% faster than competitor average');
    return protocol;
  }
}

module.exports = LinguisticDNA;
