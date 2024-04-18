import cheerio from 'cheerio';
import * as logger from './logger';

function logWarningForMissingTbody(rootNode: cheerio.Root, path: string) {
  const tables = rootNode('table');
  for (let i = 0; i < tables.length; i += 1) {
    const table = rootNode(tables[i]);
    if (table.find('tbody').length === 0) {
      logger.error(`Invalid HTML in ${path}.\n`
       + 'Table must have a tbody tag. Please correct this to avoid Vue hydration issues.\n');
    }
  }
}

export function checkForVueHydrationViolation(content: string, path: string) {
  const $ = cheerio.load(content);
  logWarningForMissingTbody($, path);
}
