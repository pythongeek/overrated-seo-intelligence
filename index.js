/**
 * SEO Intelligence Suite v2.0
 * Main entry point for programmatic usage.
 */

'use strict';

module.exports = {
  agents: require('./agents/core'),
  integrations: require('./agents/integrations'),
  utils: require('./agents/utils'),
  config: {
    styleProfiles: require('./config/style-profiles.json'),
    categoryMapping: require('./config/category-mapping.json'),
    thresholds: require('./config/thresholds.json')
  }
};
