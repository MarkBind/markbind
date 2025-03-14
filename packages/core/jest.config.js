/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  verbose: true,
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: 'node',
  collectCoverage: true,
  testMatch: ['**/*.test.ts'],
};
