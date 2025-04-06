module.exports = {
  'verbose': true,
  'collectCoverage': true,
  'collectCoverageFrom': [
    '**/*.vue',
    '!**/node_modules/**',
  ],
  'moduleFileExtensions': [
    'js',
    'json',
    'vue',
  ],
  'testEnvironment': 'jsdom',
  'testEnvironmentOptions': {
    'customExportConditions': ['node', 'node-addons'],
  },
  'transform': {
    '.*\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': ['babel-jest', { rootMode: 'upward' }],
  },
  'globals': {
    'vue-jest': {
      compilerOptions: {
        comments: false,
      },
    },
  },
};
