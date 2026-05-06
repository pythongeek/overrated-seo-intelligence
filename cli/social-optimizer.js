#!/usr/bin/env node
/**
 * Social Optimizer CLI
 * Platform-native content generation.
 */

'use strict';

const { Command } = require('commander');
const SocialOptimizer = require('../agents/core/social-optimizer');
const fs = require('fs').promises;

const program = new Command();

program
  .name('social-optimizer')
  .description('Optimize content for social platforms')
  .version('2.0.0');

program
  .command('optimize <briefFile>')
  .description('Generate platform-specific content')
  .option('-p, --platforms <list>', 'Platforms', 'twitter,instagram,tiktok')
  .option('-o, --output <file>', 'Output file')
  .action(async (briefFile, options) => {
    const brief = JSON.parse(await fs.readFile(briefFile, 'utf8'));
    const optimizer = new SocialOptimizer();
    const platforms = options.platforms.split(',');
    const result = await optimizer.optimize(brief, platforms);

    console.log('📱 SOCIAL OPTIMIZATION COMPLETE');
    console.log('===============================');
    Object.entries(result.platform_outputs).forEach(([platform, content]) => {
      console.log(`\n${platform.toUpperCase()}:`);
      console.log(`  Format: ${content.format}`);
      console.log(`  Engagement score: ${content.engagement_score}/100`);
    });

    console.log(`\n📈 Predicted viral probability: ${result.engagement_prediction.viral_probability}`);
    console.log(`📊 Estimated reach: ${result.engagement_prediction.estimated_reach.toLocaleString()}`);

    if (options.output) {
      await fs.writeFile(options.output, JSON.stringify(result, null, 2));
    }
  });

program.parse();
