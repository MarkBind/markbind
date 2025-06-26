const fs = require('fs-extra');
const path = require('path');

/**
 * Convert a filename like `my-file_name.md` to `My File Name`
 */
function generateTitleFromFilename(filename) {
  const name = path.basename(filename, '.md');
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Add a # title header to markdown files that don’t already have one
 */
async function autoGenerateTitles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await autoGenerateTitles(fullPath); // Recursive call
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = await fs.readFile(fullPath, 'utf-8');

      // Skip if the first non-empty line starts with '#'
      const lines = content.split('\n').filter(Boolean);
      if (lines.length > 0 && lines[0].startsWith('#')) continue;

      const title = generateTitleFromFilename(entry.name);
      const updatedContent = `# ${title}\n\n${content}`;
      await fs.writeFile(fullPath, updatedContent);
    }
  }
}

module.exports = {
  autoGenerateTitles,
};
