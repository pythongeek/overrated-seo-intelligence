/**
 * Social Media Optimizer v2.0
 * Platform-native content adaptation for maximum engagement velocity.
 * Converts content briefs into platform-specific formats.
 */

'use strict';

class SocialOptimizer {
  constructor(options = {}) {
    this.platforms = {
      twitter: new TwitterAdapter(options.twitter),
      instagram: new InstagramAdapter(options.instagram),
      tiktok: new TikTokAdapter(options.tiktok),
      facebook: new FacebookAdapter(options.facebook)
    };
  }

  async optimize(brief, targetPlatforms = ['twitter', 'instagram', 'tiktok']) {
    const optimized = {};

    for (const platform of targetPlatforms) {
      if (this.platforms[platform]) {
        optimized[platform] = await this.platforms[platform].adapt(brief);
      }
    }

    return {
      original_brief: brief.topic,
      platform_outputs: optimized,
      cross_posting_schedule: this.generateSchedule(optimized),
      engagement_prediction: this.predictEngagement(optimized),
      timestamp: new Date().toISOString()
    };
  }

  generateSchedule(optimized) {
    const now = new Date();
    return Object.keys(optimized).map((platform, idx) => ({
      platform,
      optimal_time: new Date(now.getTime() + idx * 30 * 60000).toISOString(),
      rationale: this.getPostRationale(platform)
    }));
  }

  getPostRationale(platform) {
    return {
      twitter: 'Peak engagement: News breaks fastest here',
      instagram: 'Visual storytelling drives saves/shares',
      tiktok: 'Algorithm favors fresh content within 30min',
      facebook: 'Older demographic active during work hours'
    }[platform] || 'Standard posting time';
  }

  predictEngagement(optimized) {
    const scores = Object.values(optimized).map(p => p.engagement_score || 70);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      average_score: Math.round(avg),
      viral_probability: avg > 85 ? 'high' : avg > 75 ? 'medium' : 'low',
      estimated_reach: Math.round(avg * 1000),
      peak_platform: Object.keys(optimized).reduce((a, b) => (optimized[a]?.engagement_score > optimized[b]?.engagement_score ? a : b))
    };
  }
}

class TwitterAdapter {
  adapt(brief) {
    const thread = this.generateThread(brief);
    return {
      format: 'thread',
      character_limit: 280,
      posts: thread,
      hashtags: brief.social?.twitter?.hashtags || ['#BREAKING', '#Exclusive'],
      engagement_score: this.scoreThread(thread),
      media_recommendation: 'Image or short video clip',
      cta: 'Retweet with your take'
    };
  }

  generateThread(brief) {
    return [
      { type: 'hook', text: `🚨 ${brief.topic}: What we know so far — thread` },
      { type: 'context', text: brief.outline?.find(o => o.type === 'context')?.content || 'The story broke earlier today.' },
      { type: 'detail', text: brief.outline?.find(o => o.type === 'development')?.content || 'Sources confirm key details.' },
      { type: 'reaction', text: brief.outline?.find(o => o.type === 'reaction')?.content || 'Social media is reacting.' },
      { type: 'forward', text: brief.forward_looking_statements?.[0] || 'Updates to follow.' },
      { type: 'cta', text: 'Follow for real-time updates 🔁' }
    ];
  }

  scoreThread(thread) {
    const hasHook = thread[0]?.text.includes('🚨') || thread[0]?.text.includes('BREAKING');
    const hasCTA = thread.some(t => t.type === 'cta');
    const length = thread.length;
    return Math.min(100, 60 + (hasHook ? 15 : 0) + (hasCTA ? 10 : 0) + (length >= 4 ? 15 : 0));
  }
}

class InstagramAdapter {
  adapt(brief) {
    return {
      format: 'carousel',
      slides: this.generateCarousel(brief),
      caption: this.generateCaption(brief),
      hashtags: brief.social?.instagram?.hashtags || ['#CelebrityNews', '#PopCulture'],
      story_prompts: this.generateStoryPrompts(brief),
      reel_script: this.generateReelScript(brief),
      engagement_score: 82,
      media_recommendation: 'High-res images or 15-30s video'
    };
  }

  generateCarousel(brief) {
    return [
      { type: 'cover', text: brief.topic, visual: 'Bold text over image' },
      { type: 'context', text: 'What happened', visual: 'Timeline graphic' },
      { type: 'detail', text: 'Key details', visual: 'Bullet points' },
      { type: 'reaction', text: 'Reactions', visual: 'Quote cards' },
      { type: 'cta', text: 'Link in bio for full story', visual: 'Swipe-up prompt' }
    ];
  }

  generateCaption(brief) {
    return `${brief.topic} 👀\n\nThe full story is on our site (link in bio). What do you think? 👇\n\n${(brief.social?.instagram?.hashtags || []).join(' ')}`;
  }

  generateStoryPrompts(brief) {
    return [
      { type: 'poll', question: `Surprised by ${brief.topic}?`, options: ['Yes', 'No'] },
      { type: 'question', prompt: 'Drop your reaction 🔥' },
      { type: 'countdown', label: 'Updates coming', hours: 1 }
    ];
  }

  generateReelScript(brief) {
    return {
      hook: `POV: You just heard about ${brief.topic}`,
      duration: '15-30s',
      audio: 'Trending sound or voiceover',
      text_overlays: [brief.topic, 'Full story link in bio']
    };
  }
}

class TikTokAdapter {
  adapt(brief) {
    return {
      format: 'short_form_video',
      duration: '15-60s',
      hook: this.generateTikTokHook(brief),
      script: this.generateTikTokScript(brief),
      hashtags: brief.social?.tiktok?.hashtags || ['#FYP', '#Viral'],
      sound_recommendation: 'Trending audio or original sound',
      effects: ['Green Screen', 'Text-to-Speech'],
      engagement_score: 88,
      duet_friendly: true,
      stitch_friendly: true
    };
  }

  generateTikTokHook(brief) {
    return `Wait... ${brief.topic} just happened and nobody is talking about this detail 👀`;
  }

  generateTikTokScript(brief) {
    return [
      { time: '0-3s', text: 'Hook: Pattern interrupt', visual: 'Shocked expression or bold text' },
      { time: '3-15s', text: 'Context: What happened', visual: 'Green screen with article' },
      { time: '15-30s', text: 'Detail: The part everyone missed', visual: 'Zoom-in or emphasis effect' },
      { time: '30-45s', text: 'Reaction: Your take', visual: 'Direct to camera' },
      { time: '45-60s', text: 'CTA: Duet this with your reaction', visual: 'Point to duet button' }
    ];
  }
}

class FacebookAdapter {
  adapt(brief) {
    return {
      format: 'link_post',
      headline: brief.seo?.title || brief.topic,
      description: brief.seo?.meta_description || '',
      image: brief.seo?.og_image || '',
      engagement_prompt: this.generateFBPrompt(brief),
      hashtags: brief.social?.facebook?.hashtags || [],
      engagement_score: 70,
      target_audience: '25-45 demographic'
    };
  }

  generateFBPrompt(brief) {
    return `What is your take on ${brief.topic}? Share your thoughts below.`;
  }
}

module.exports = SocialOptimizer;
