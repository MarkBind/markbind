const config = {
  verbose: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  collectCoverage: true,
  testMatch: ['**/*.test.ts'],
};

module.exports = config;
