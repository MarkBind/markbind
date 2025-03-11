/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  verbose: true,
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: 'node',
  collectCoverage: true,
  // Disable type-checking for test files until we have fully adapted to TypeScript.
  // Temporarily remove the below lines if you need to type-check the test files
  // as you run the tests.
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
