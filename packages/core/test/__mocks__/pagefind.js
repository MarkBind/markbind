/**
 * Manual mock for pagefind module
 *
 * This mock allows tests to spy on and mock the pagefind module functions.
 * Jest's moduleNameMapper redirects 'pagefind' imports to this file.
 */

const mockCreateIndex = jest.fn();
const mockClose = jest.fn();

module.exports = {
  createIndex: mockCreateIndex,
  close: mockClose,
  // Export mock functions directly for test access
  __mockCreateIndex: mockCreateIndex,
  __mockClose: mockClose,
};
