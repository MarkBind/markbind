import { readFileSync } from 'fs';
import * as path from 'path';
import * as logger from '../../../src/utils/logger';
import { checkForVueHydrationWithRules } from '../../../src/utils/htmlValidationUtil';

const table_without_tbody = readFileSync(path.resolve(__dirname, 'html_str/table_without_tbody.txt'), 'utf8');
const correct_html_string = readFileSync(path.resolve(__dirname, 'html_str/correct_html.txt'), 'utf8');

describe('checkForVueHydrationWithRules', () => {
  it('should not log an error when the content is correct', () => {
    const mockError = jest.spyOn(logger, 'error').mockImplementation(() => {});
    checkForVueHydrationWithRules(correct_html_string, '/fake/path');
    expect(mockError).not.toHaveBeenCalled();
  });
  it(' should log an error when a table does not have a tbody tag', () => {
    const mockError = jest.spyOn(logger, 'error').mockImplementation(() => {});
    checkForVueHydrationWithRules(table_without_tbody, '/fake/path');
    expect(mockError).toHaveBeenCalled();
  });
});
