import path from 'path';
import fs from 'fs-extra';
import ensurePosix from 'ensure-posix-path';

export interface CopyOptions {
  overwrite: boolean
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
    const curDest = path.join(dest, file);

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
