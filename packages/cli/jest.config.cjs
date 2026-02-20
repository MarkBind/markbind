const config = {
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testPathIgnorePatterns: [
    'test/functional/',
    'dist/',
  ],
};

module.exports = config;
