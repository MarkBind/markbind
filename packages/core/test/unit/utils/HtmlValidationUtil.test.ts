import { readFileSync } from 'fs';
import * as path from 'path';
import * as logger from '../../../src/utils/logger';
import { checkForVueHydrationViolation } from '../../../src/utils/htmlValidationUtil';

const tableWithoutTbody = readFileSync(path.resolve(__dirname, 'htmlStr/tableWithoutTbody.txt'), 'utf8');
const tableWithTbody = readFileSync(path.resolve(__dirname, 'htmlStr/tableWithTbody.txt'), 'utf8');
const correctHtmlString = readFileSync(path.resolve(__dirname, 'htmlStr/correctHtml.txt'), 'utf8');

describe('checkForVueHydrationViolation', () => {
  it(' should not log an error when the content is correct', () => {
    const mockError = jest.spyOn(logger, 'error').mockImplementation(() => {});
    checkForVueHydrationViolation(correctHtmlString, '/fake/path');
    expect(mockError).not.toHaveBeenCalled();
  });

  it(' should not log an error when all tables have a tbody tag', () => {
    const mockError = jest.spyOn(logger, 'error').mockImplementation(() => {});
    checkForVueHydrationViolation(tableWithTbody, '/fake/path');
    expect(mockError).not.toHaveBeenCalled();
  });

  it(' should log an error when a table does not have a tbody tag', () => {
    const mockError = jest.spyOn(logger, 'error').mockImplementation(() => {});
    checkForVueHydrationViolation(tableWithoutTbody, '/fake/path');
    expect(mockError).toHaveBeenCalled();
    const expectedMessange = 'Invalid HTML in /fake/path.\n'
    + 'Table must have a tbody tag. Please correct this to avoid Vue hydration issues.\n';
    expect(mockError).toHaveBeenCalledWith(expectedMessange);
  });
});
