/**
 * WordPress Publisher v2.0
 * XML-RPC based publishing with SEO metadata, schema injection,
 * category management, and featured image handling.
 */

'use strict';

const xmlrpc = require('xmlrpc');
const fs = require('fs').promises;

class WordPressPublisher {
  constructor(options = {}) {
    this.client = xmlrpc.createClient({
      url: options.url || process.env.WP_URL,
      headers: {
        'User-Agent': 'SEO-Intelligence-Suite/2.0'
      }
    });
    this.credentials = [
      options.username || process.env.WP_USERNAME,
      options.password || process.env.WP_PASSWORD
    ];
    this.blogId = options.blogId || process.env.WP_BLOG_ID || 1;
  }

  async publish(brief, options = {}) {
    const status = options.status || 'publish';
    const schedule = options.schedule;

    console.log(`[WP] Publishing: "${brief.topic}"`);

    // Step 1: Prepare content
    const content = this.buildContent(brief);
    const title = brief.seo?.title || brief.topic;
    const excerpt = brief.seo?.meta_description || '';

    // Step 2: Resolve categories and tags
    const categories = await this.resolveCategories(brief.category);
    const tags = await this.resolveTags(brief.secondary_keywords || []);

    // Step 3: Upload featured image if provided
    let thumbnailId = null;
    if (brief.seo?.og_image) {
      thumbnailId = await this.uploadFeaturedImage(brief.seo.og_image, title);
    }

    // Step 4: Build post structure
    const post = {
      post_type: 'post',
      post_status: status,
      post_title: title,
      post_content: content,
      post_excerpt: excerpt,
      post_date: schedule ? new Date(schedule).toISOString() : new Date().toISOString(),
      terms_names: {
        category: categories,
        post_tag: tags
      },
      post_thumbnail: thumbnailId ? [thumbnailId] : [],
      custom_fields: this.buildCustomFields(brief),
      post_format: this.determinePostFormat(brief.category)
    };

    // Step 5: Publish via XML-RPC
    const result = await this.call('wp.newPost', [this.blogId, ...this.credentials, post]);

    // Step 6: Post-publish SEO optimization
    if (result) {
      await this.injectSchemaMarkup(result, brief);
      await this.setRankMathMeta(result, brief);
    }

    return {
      id: result,
      url: `${this.getBaseUrl()}/${brief.seo?.canonical_url?.split('/').pop() || result}`,
      status,
      published_at: post.post_date,
      categories,
      tags,
      thumbnail_id: thumbnailId
    };
  }

  buildContent(brief) {
    const sections = [];

    // Schema JSON-LD injection
    sections.push(this.generateSchemaBlock(brief));

    // Lead / Hook
    sections.push(`<p class="lead">${brief.hooks?.[0]?.example || brief.topic}</p>`);

    // Main content from outline
    if (brief.outline) {
      brief.outline.forEach(section => {
        if (section.type === 'hook') {
          sections.push(`<p><strong>${section.content}</strong></p>`);
        } else {
          sections.push(`<h2>${section.content}</h2>`);
          sections.push(`<p>[Content for: ${section.content}]</p>`);
        }
      });
    }

    // Forward-looking
    if (brief.forward_looking_statements) {
      sections.push('<h2>What Comes Next</h2>');
      brief.forward_looking_statements.forEach(stmt => {
        sections.push(`<p>${stmt}</p>`);
      });
    }

    // Internal links block
    if (brief.seo?.internal_links) {
      sections.push('<div class="related-links">');
      sections.push('<h3>Related Stories</h3>');
      brief.seo.internal_links.forEach(link => {
        sections.push(`<p><a href="${link.url}">${link.anchor}</a></p>`);
      });
      sections.push('</div>');
    }

    // Social embed placeholders
    sections.push('<div class="social-reactions">');
    sections.push('<h3>Social Reactions</h3>');
    sections.push('<p>[Twitter/Instagram embeds will appear here]</p>');
    sections.push('</div>');

    return sections.join('\n');
  }

  generateSchemaBlock(brief) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': brief.seo?.schema_type || 'NewsArticle',
      headline: brief.seo?.title || brief.topic,
      description: brief.seo?.meta_description || '',
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'HypeFresh'
      },
      publisher: {
        '@type': 'Organization',
        name: 'HypeFresh',
        logo: {
          '@type': 'ImageObject',
          url: 'https://yoursite.com/logo.png'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': brief.seo?.canonical_url || ''
      }
    };

    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }

  buildCustomFields(brief) {
    const fields = [];

    // Rank Math / Yoast fields
    if (brief.seo?.title) {
      fields.push({ key: 'rank_math_title', value: brief.seo.title });
    }
    if (brief.seo?.meta_description) {
      fields.push({ key: 'rank_math_description', value: brief.seo.meta_description });
    }
    if (brief.seo?.canonical_url) {
      fields.push({ key: 'rank_math_canonical_url', value: brief.seo.canonical_url });
    }

    // Focus keyword
    fields.push({ key: 'rank_math_focus_keyword', value: brief.primary_keyword || brief.topic });

    // Additional keywords (LSI)
    if (brief.seo?.ls_keywords) {
      fields.push({ key: 'rank_math_focus_keywords', value: brief.seo.ls_keywords.join(',') });
    }

    // OG Image
    if (brief.seo?.og_image) {
      fields.push({ key: 'rank_math_facebook_image', value: brief.seo.og_image });
      fields.push({ key: 'rank_math_twitter_image', value: brief.seo.og_image });
    }

    // Article type
    fields.push({ key: 'rank_math_schema_article_type', value: brief.seo?.schema_type || 'NewsArticle' });

    // Social optimization flags
    fields.push({ key: 'hf_social_optimized', value: '1' });
    fields.push({ key: 'hf_content_intelligence_version', value: '2.0.0' });
    fields.push({ key: 'hf_quality_score', value: String(brief.quality_score || 85) });

    return fields;
  }

  async resolveCategories(categorySlug) {
    try {
      const categories = await this.call('wp.getTerms', [this.blogId, ...this.credentials, 'category']);
      const match = categories.find(c => c.slug === categorySlug || c.name.toLowerCase() === categorySlug.toLowerCase());
      if (match) return [match.name];

      // Create category if not exists
      const newCat = await this.call('wp.newTerm', [this.blogId, ...this.credentials, 'category', {
        name: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        slug: categorySlug
      }]);
      return [newCat];
    } catch (err) {
      console.warn(`[WP] Category resolution failed: ${err.message}`);
      return ['News'];
    }
  }

  async resolveTags(keywords) {
    const tags = [];
    for (const keyword of keywords.slice(0, 5)) {
      try {
        const existing = await this.call('wp.getTerms', [this.blogId, ...this.credentials, 'post_tag', { search: keyword }]);
        if (existing && existing.length > 0) {
          tags.push(existing[0].name);
        } else {
          const newTag = await this.call('wp.newTerm', [this.blogId, ...this.credentials, 'post_tag', { name: keyword }]);
          tags.push(newTag);
        }
      } catch (err) {
        tags.push(keyword);
      }
    }
    return tags;
  }

  async uploadFeaturedImage(imageUrl, title) {
    try {
      // Download image
      const axios = require('axios');
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      const base64 = buffer.toString('base64');

      const file = {
        name: `${this.slugify(title)}-featured.jpg`,
        type: 'image/jpeg',
        bits: base64,
        overwrite: true
      };

      const result = await this.call('wp.uploadFile', [this.blogId, ...this.credentials, file]);
      return result.id;
    } catch (err) {
      console.warn(`[WP] Featured image upload failed: ${err.message}`);
      return null;
    }
  }

  async injectSchemaMarkup(postId, brief) {
    // Schema is already in content, but can also be injected via custom field
    try {
      await this.call('wp.editPost', [this.blogId, ...this.credentials, postId, {
        custom_fields: [
          { key: '_schema_markup', value: this.generateSchemaBlock(brief) }
        ]
      }]);
    } catch (err) {
      console.warn(`[WP] Schema injection failed: ${err.message}`);
    }
  }

  async setRankMathMeta(postId, brief) {
    // Additional Rank Math meta can be set via custom fields (already handled in buildCustomFields)
    console.log(`[WP] Rank Math meta configured for post ${postId}`);
  }

  determinePostFormat(category) {
    const formatMap = {
      'viral-moments': 'video',
      'music-releases': 'audio',
      'exclusive-interviews': 'quote',
      'social-media-drama': 'image'
    };
    return formatMap[category] || 'standard';
  }

  getBaseUrl() {
    const url = this.client.options.url || '';
    return url.replace('/xmlrpc.php', '');
  }

  slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  call(method, params) {
    return new Promise((resolve, reject) => {
      this.client.methodCall(method, params, (err, value) => {
        if (err) reject(err);
        else resolve(value);
      });
    });
  }
}

module.exports = WordPressPublisher;
