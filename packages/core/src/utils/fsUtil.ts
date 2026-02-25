import path from 'path';
import fs from 'fs-extra';
import { globSync } from 'node:fs';
import ignore from 'ignore';
import ensurePosix from 'ensure-posix-path';

export interface CopyOptions {
  overwrite: boolean
}

/**
 * Recursively gets all file paths in a directory
 * Does not include the directory itself
 */
export function getFilePaths(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return globSync('**/*', { cwd: dir }).sort();
}

/**
 * Gets file paths matching glob patterns, excluding specified paths.
 * Uses native fs.globSync (Node 22+) for glob matching.
 *
 * @param rootPath root directory to search from
 * @param globs glob patterns to match
 * @param ignorePaths paths to exclude from results
 * @returns array of matching relative file paths
 */
export function getPageGlobPaths(
  rootPath: string,
  globs: string[],
  ignorePaths: string[],
): string[] {
  const ignorer = ignore().add(ignorePaths);
  return globSync(globs, { cwd: rootPath })
    .map(ensurePosix)
    .filter(file => !ignorer.ignores(file));
}

const markdownFileExts = '.md';

export { ensurePosix };

export function fileExists(filePath: string) {
  try {
    // use decodeURIComponent to deal with space (%20) in file path, e.g
    // from docs\images\dev%20diagrams\architecture.png
    // to docs\images\dev diagrams\architecture.png
    return fs.statSync(decodeURIComponent(filePath)).isFile();
  } catch (err) {
    return false;
  }
}

export function isMarkdownFileExt(ext: string) {
  return markdownFileExts === ext;
}

export const removeExtension = (filePathWithExt: string) => path.join(
  path.dirname(filePathWithExt),
  path.basename(filePathWithExt, path.extname(filePathWithExt)),
);

export const removeExtensionPosix = (filePathWithExt: string) => ensurePosix(path.join(
  path.dirname(filePathWithExt),
  path.basename(filePathWithExt, path.extname(filePathWithExt)),
));

export const setExtension = (normalizedFilename: string, ext: string) => (
  removeExtension(normalizedFilename) + ext
);

export function copySyncWithOptions(src: string, dest: string, options: CopyOptions) {
  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const curSource = path.join(src, file);
    let curDest = path.join(dest, file);
    if (file === 'gitignore') {
      curDest = path.join(dest, '.gitignore');
    }

    if (fs.lstatSync(curSource).isDirectory()) {
      if (!fs.existsSync(curDest)) {
        fs.mkdirSync(curDest);
      }
      copySyncWithOptions(curSource, curDest, options);
    } else {
      if (options.overwrite === false && fs.existsSync(curDest)) {
        return;
      }
      fs.copySync(curSource, curDest);
    }
  });
}
