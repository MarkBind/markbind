import fs from 'fs';
import fsp from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const directoryPath = path.join(process.cwd(), '_site', 'lockFiles');

function createDirectoryIfNotExists() {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

export function createLockFile(): string {
  createDirectoryIfNotExists();
  const fileName = `${uuidv4()}.txt`;
  const filePath = path.join(directoryPath, fileName);
  fs.writeFileSync(filePath, '');
  return fileName;
}

export function deleteLockFile(fileName: string): void {
  const filePath = path.join(directoryPath, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function deleteAllLockFiles(): void {
  if (fs.existsSync(directoryPath)) {
    fs.rmdirSync(directoryPath, { recursive: true });
  }
}

export function waitForLockRelease(): Promise<void> {
  return new Promise<void>((resolve) => {
    const checkDirectory = async () => {
      try {
        await fsp.access(directoryPath);
        const files = await fsp.readdir(directoryPath);
        if (files.length === 0) {
          deleteAllLockFiles();
          resolve();
        } else {
          setTimeout(checkDirectory, 100);
        }
      } catch (err) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === 'ENOENT') {
          // ENOENT error is thrown if directory does not exist
          resolve();
        } else {
          throw error;
        }
      }
    };
    checkDirectory();
  });
}
