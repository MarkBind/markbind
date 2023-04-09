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
    '.*\\.js$': 'babel-jest',
    '.*\\.(vue)$': '@vue/vue3-jest',
  },
  'snapshotSerializers': ['jest-serializer-vue'],
};
