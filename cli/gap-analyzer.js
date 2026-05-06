#!/usr/bin/env node
/**
 * Gap Analyzer CLI
 * Standalone tool for competitive gap analysis.
 */

'use strict';

const { Command } = require('commander');
const CompetitorResearchAgent = require('../agents/core/competitor-research-agent');
const fs = require('fs').promises;
require('dotenv').config();

const program = new Command();

program
  .name('gap-analyzer')
  .description('Analyze ranking gaps and generate beat strategies')
  .version('2.0.0');

program
  .command('analyze <topic>')
  .description('Run full gap analysis on a topic')
  .option('-o, --output <file>', 'Output JSON file')
  .option('-n, --top <number>', 'Competitors to analyze', '3')
  .action(async (topic, options) => {
    const agent = new CompetitorResearchAgent();
    const result = await agent.research(topic, { topN: parseInt(options.top) });

    console.log('\n📊 GAP ANALYSIS REPORT');
    console.log('======================');
    console.log(`Topic: ${result.topic}`);
    console.log(`Competitors analyzed: ${result.competitors_analyzed}`);
    console.log(`\n🎯 BEAT STRATEGY:`);
    console.log(`  Content target: ${result.beat_strategy.content_strategy.target_word_count} words`);
    console.log(`  Schema required: ${result.beat_strategy.content_strategy.schema_required ? 'YES' : 'NO'}`);
    console.log(`  Video embed: ${result.beat_strategy.content_strategy.video_embed ? 'YES' : 'NO'}`);
    console.log(`  Social embed: ${result.beat_strategy.content_strategy.social_embed ? 'YES' : 'NO'}`);

    console.log(`\n⚠️  COMPETITOR WEAKNESSES:`);
    result.gap_analysis.common_weaknesses.forEach(([weakness, count]) => {
      console.log(`  • ${weakness} (${count} competitors)`);
    });

    console.log(`\n💡 OPPORTUNITIES:`);
    result.gap_analysis.common_opportunities.forEach(([opp, count]) => {
      console.log(`  • ${opp} (${count} competitors)`);
    });

    if (options.output) {
      await fs.writeFile(options.output, JSON.stringify(result, null, 2));
      console.log(`\n💾 Saved to: ${options.output}`);
    }
  });

program.parse();
