module.exports = {
  'verbose': true,
  'collectCoverage': true,
  'collectCoverageFrom': [
    '**/*.vue',
    '**/*.ts',
    '!**/node_modules/**',
  ],
  'moduleFileExtensions': [
    'js',
    'ts',
    'json',
    'vue',
  ],
  'testEnvironment': 'jsdom',
  'testEnvironmentOptions': {
    'customExportConditions': ['node', 'node-addons'],
  },
  'transform': {
    '.*\\.vue$': ['@vue/vue3-jest', { babelConfig: true }],
    '^.+\\.js$': ['babel-jest', { rootMode: 'upward' }],
    '^.+\\.ts$': [
      'ts-jest', {
        tsconfig: {
          target: 'es2020',
          module: 'esnext',
          moduleResolution: 'node',
          esModuleInterop: true,
          strict: false,
          noImplicitAny: false,
        },
      },
    ],
  },
  'globals': {
    'vue-jest': {
      compilerOptions: {
        comments: false,
      },
    },
  },
};
