const config = {
  verbose: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^pagefind$': '<rootDir>/test/__mocks__/pagefind.js',
  },
  testEnvironment: 'node',
  collectCoverage: true,
  testMatch: ['**/*.test.ts'],
};

module.exports = config;
