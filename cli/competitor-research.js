#!/usr/bin/env node
/**
 * Competitor Research CLI
 * Quick competitor deconstruction tool.
 */

'use strict';

const { Command } = require('commander');
const CompetitorResearchAgent = require('../agents/core/competitor-research-agent');
const fs = require('fs').promises;
require('dotenv').config();

const program = new Command();

program
  .name('competitor-research')
  .description('Deconstruct competitor content DNA')
  .version('2.0.0');

program
  .command('deconstruct <url>')
  .description('Analyze a single competitor URL')
  .option('-o, --output <file>', 'Output file')
  .action(async (url, options) => {
    const agent = new CompetitorResearchAgent();
    const content = await agent.extractContent(url);
    const dna = agent.dnaAnalyzer.analyze(content);

    console.log('🔬 LINGUISTIC DNA REPORT');
    console.log('========================');
    console.log(`URL: ${url}`);
    console.log(`Word count: ${dna.overview?.word_count}`);
    console.log(`Sentence variance: ${dna.sentence_variance?.pattern}`);
    console.log(`Voice type: ${dna.voice_type?.dominant}`);
    console.log(`Metaphor density: ${dna.metaphor_density?.density?.toFixed(3)}`);
    console.log(`Readability: Grade ${dna.readability?.grade_level}`);
    console.log(`Forward-looking: ${dna.forward_looking?.statements} statements`);

    if (options.output) {
      await fs.writeFile(options.output, JSON.stringify(dna, null, 2));
    }
  });

program.parse();
