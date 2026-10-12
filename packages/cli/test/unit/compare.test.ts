import fs from 'fs';
import os from 'os';
import path from 'path';
import { compare } from '../functional/testUtil/compare.js';

test('compare ignores nested .DS_Store files and reports path differences', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'markbind-compare-'));
  const expectedDirectory = path.join(root, 'expected');
  const actualDirectory = path.join(root, '_site');
  try {
    fs.mkdirSync(expectedDirectory);
    fs.mkdirSync(path.join(actualDirectory, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(expectedDirectory, 'index.html'), 'same');
    fs.writeFileSync(path.join(actualDirectory, 'index.html'), 'same');
    fs.writeFileSync(path.join(actualDirectory, 'nested', '.DS_Store'), 'metadata');
    expect(() => compare(root)).not.toThrow();
    fs.writeFileSync(path.join(expectedDirectory, 'missing.html'), '');
    fs.writeFileSync(path.join(actualDirectory, 'unexpected.html'), '');
    expect(() => compare(root))
      .toThrow('Missing files: ["missing.html"]\nUnexpected files: ["unexpected.html"]');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
