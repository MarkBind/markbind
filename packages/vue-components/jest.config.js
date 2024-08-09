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
  'transform': {
    '.*\\.vue$': '@vue/vue2-jest',
    '^.+\\.js$': ['babel-jest', { rootMode: 'upward' }],
  },
  'snapshotSerializers': ['jest-serializer-vue'],
};
