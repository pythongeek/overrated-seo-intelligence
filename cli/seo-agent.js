#!/usr/bin/env node
/**
 * SEO Agent CLI v2.0
 * Unified command-line interface for the SEO Intelligence Suite.
 * Usage: node cli/seo-agent.js [command] [options]
 */

'use strict';

const { Command } = require('commander');
const ContentIntelligenceAgent = require('../agents/core/content-intelligence-agent');
const CompetitorResearchAgent = require('../agents/core/competitor-research-agent');
const SocialOptimizer = require('../agents/core/social-optimizer');
const WordPressPublisher = require('../agents/integrations/wordpress-publisher');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const program = new Command();

program
  .name('seo-agent')
  .description('SEO Intelligence Suite — Outrank TMZ-tier competitors')
  .version('2.0.0');

// Command: generate content brief
program
  .command('generate <topic>')
  .description('Generate a content intelligence brief')
  .option('-c, --category <category>', 'Content category', 'auto')
  .option('-s, --style <style>', 'Style module override')
  .option('-k, --keywords <keywords>', 'Comma-separated keywords')
  .option('-o, --output <dir>', 'Output directory', './seo-output')
  .option('--no-correction', 'Disable self-correction loop')
  .action(async (topic, options) => {
    try {
      const agent = new ContentIntelligenceAgent({
        outputDir: options.output,
        enableSelfCorrection: options.correction,
        geminiApiKey: process.env.GEMINI_API_KEY
      });

      const result = await agent.generate(topic, {
        category: options.category === 'auto' ? undefined : options.category,
        style: options.style,
        keywords: options.keywords?.split(',').map(k => k.trim())
      });

      console.log('\n✅ Content Brief Generated');
      console.log(`📄 Topic: ${result.brief.topic}`);
      console.log(`🏷️  Category: ${result.brief.category}`);
      console.log(`⭐ Quality Score: ${result.quality_report.final_score}/100`);
      console.log(`📊 Status: ${result.quality_report.status}`);
      console.log(`💾 Saved to: ${result.output_path}`);
      console.log(`⏱️  Execution time: ${result.execution_time_ms}ms`);

      if (result.quality_report.status === 'REJECT') {
        console.log('\n⚠️  REJECTED — Review recommendations:');
        result.quality_report.recommendations.forEach(r => console.log(`   - ${r}`));
        process.exit(1);
      }
    } catch (err) {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }
  });

// Command: research competitors
program
  .command('research <topic>')
  .description('Deep competitor research and deconstruction')
  .option('-n, --top <number>', 'Number of competitors to analyze', '3')
  .option('-o, --output <file>', 'Output JSON file')
  .action(async (topic, options) => {
    try {
      const agent = new CompetitorResearchAgent({
        serpApiKey: process.env.SERP_API_KEY
      });
      const result = await agent.research(topic, { topN: parseInt(options.top) });

      if (options.output) {
        await fs.writeFile(options.output, JSON.stringify(result, null, 2));
        console.log(`💾 Research saved to: ${options.output}`);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (err) {
      console.error('❌ Research Error:', err.message);
      process.exit(1);
    }
  });

// Command: optimize for social
program
  .command('social <briefFile>')
  .description('Optimize a content brief for social media platforms')
  .option('-p, --platforms <list>', 'Platforms (twitter,instagram,tiktok,facebook)', 'all')
  .action(async (briefFile, options) => {
    try {
      const brief = JSON.parse(await fs.readFile(briefFile, 'utf8'));
      const optimizer = new SocialOptimizer();
      const platforms = options.platforms === 'all' 
        ? ['twitter', 'instagram', 'tiktok', 'facebook'] 
        : options.platforms.split(',');

      const optimized = await optimizer.optimize(brief, platforms);
      console.log(JSON.stringify(optimized, null, 2));
    } catch (err) {
      console.error('❌ Social Optimization Error:', err.message);
      process.exit(1);
    }
  });

// Command: publish to WordPress
program
  .command('publish <briefFile>')
  .description('Publish content brief to WordPress')
  .option('--draft', 'Save as draft instead of publishing')
  .option('--schedule <datetime>', 'Schedule publication (ISO format)')
  .action(async (briefFile, options) => {
    try {
      const brief = JSON.parse(await fs.readFile(briefFile, 'utf8'));
      const publisher = new WordPressPublisher({
        url: process.env.WP_URL,
        username: process.env.WP_USERNAME,
        password: process.env.WP_PASSWORD
      });

      const result = await publisher.publish(brief, {
        status: options.draft ? 'draft' : 'publish',
        schedule: options.schedule
      });

      console.log('✅ Published to WordPress');
      console.log(`🔗 URL: ${result.url}`);
      console.log(`🆔 Post ID: ${result.id}`);
    } catch (err) {
      console.error('❌ Publishing Error:', err.message);
      process.exit(1);
    }
  });

// Command: batch processing
program
  .command('batch <file>')
  .description('Process multiple topics from JSON file')
  .option('-o, --output <dir>', 'Output directory', './seo-output')
  .action(async (file, options) => {
    try {
      const topics = JSON.parse(await fs.readFile(file, 'utf8'));
      const agent = new ContentIntelligenceAgent({ outputDir: options.output });
      const results = [];

      for (const topic of topics) {
        console.log(`\n🔄 Processing: ${topic.title || topic}`);
        const result = await agent.generate(topic.title || topic, topic.options || {});
        results.push(result);
      }

      const summaryPath = path.join(options.output, `batch-summary-${Date.now()}.json`);
      await fs.writeFile(summaryPath, JSON.stringify(results, null, 2));
      console.log(`\n✅ Batch complete. Summary: ${summaryPath}`);
    } catch (err) {
      console.error('❌ Batch Error:', err.message);
      process.exit(1);
    }
  });

// Command: server mode (for n8n/webhook integration)
program
  .command('server')
  .description('Start HTTP server for webhook integration')
  .option('-p, --port <number>', 'Port', '3000')
  .action(async (options) => {
    const http = require('http');
    const port = parseInt(options.port);

    const server = http.createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'healthy', version: '2.0.0' }));
        return;
      }

      if (req.url === '/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { topic, options = {} } = JSON.parse(body);
            const agent = new ContentIntelligenceAgent();
            const result = await agent.generate(topic, options);
            res.writeHead(result.quality_report.status === 'REJECT' ? 422 : 200);
            res.end(JSON.stringify(result));
          } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    server.listen(port, () => {
      console.log(`🚀 SEO Agent server running on port ${port}`);
      console.log(`📡 Health check: http://localhost:${port}/health`);
      console.log(`📝 Generate endpoint: POST http://localhost:${port}/generate`);
    });
  });

// Command: cron mode (for scheduled jobs on Render)
program
  .command('cron')
  .description('Run scheduled cron jobs (competitor monitoring, content updates)')
  .option('-i, --interval <minutes>', 'Run interval in minutes', '60')
  .action(async (options) => {
    const cron = require('node-cron');
    const interval = parseInt(options.interval);

    console.log(`⏰ SEO Cron worker started — interval: ${interval} minutes`);

    const runJob = async () => {
      console.log(`[${new Date().toISOString()}] Running scheduled competitor check...`);
      try {
        const agent = new CompetitorResearchAgent({
          serpApiKey: process.env.SERP_API_KEY
        });
        // In production: load topics from DB, check for ranking changes
        console.log('✅ Cron job complete');
      } catch (err) {
        console.error('❌ Cron job failed:', err.message);
      }
    };

    // Run immediately on start
    await runJob();

    // Schedule recurring execution
    const cronExpr = `*/${interval} * * * *`;
    cron.schedule(cronExpr, runJob);
  });

program.parse();
