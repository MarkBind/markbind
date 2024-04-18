import { readFileSync } from 'fs';
import * as path from 'path';
import * as logger from '../../../src/utils/logger';
import { checkForVueHydrationViolation } from '../../../src/utils/htmlValidationUtil';

const table_without_tbody = readFileSync(path.resolve(__dirname, 'htmlStr/tableWithoutTbody.txt'), 'utf8');
const table_with_tbody = readFileSync(path.resolve(__dirname, 'htmlStr/tableWithTbody.txt'), 'utf8');
const correct_html_string = readFileSync(path.resolve(__dirname, 'htmlStr/correctHtml.txt'), 'utf8');

describe('checkForVueHydrationViolation', () => {
  it(' should not log an error when the content is correct', () => {
    const mockError = jest.spyOn(logger, 'error').mockImplementation(() => {});
    checkForVueHydrationViolation(correct_html_string, '/fake/path');
    expect(mockError).not.toHaveBeenCalled();
  });

  it(' should not log an error when a table does not have a tbody tag', () => {
    const mockError = jest.spyOn(logger, 'error').mockImplementation(() => {});
    checkForVueHydrationViolation(table_with_tbody, '/fake/path');
    expect(mockError).not.toHaveBeenCalled();
  });

  it(' should log an error when a table does not have a tbody tag', () => {
    const mockError = jest.spyOn(logger, 'error').mockImplementation(() => {});
    checkForVueHydrationViolation(table_without_tbody, '/fake/path');
    expect(mockError).toHaveBeenCalled();
    const expectedMessange = 'Invalid HTML in /fake/path.\n'
    + 'Table must have a tbody tag. Please correct this to avoid vue hydration issues.\n';
    expect(mockError).toHaveBeenCalledWith(expectedMessange);
  });
});
