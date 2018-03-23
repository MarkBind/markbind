// Mock specific functions of fs-extra-promise module
const path = require('path');
const { fs, vol } = require('memfs');

/**
 * Utils
 */

/**
 * Remove directory recursively
 * @param {string} dirPath
 * @see https://stackoverflow.com/a/42505874/3027390
 */
function rimraf(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((entry) => {
      const entryPath = path.join(dirPath, entry);
      if (fs.lstatSync(entryPath).isDirectory()) {
        rimraf(entryPath);
      } else {
        fs.unlinkSync(entryPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

/**
 * Iterativelts creates directories to the file or directory
 * @param pathArg
 */
function createDir(pathArg) {
  const { dir, ext } = path.parse(pathArg);
  const dirNames = (ext === '')
    ? pathArg.split(path.sep)
    : dir.split(pathArg.sep);

  dirNames.reduce((accumDir, currentdir) => {
    const jointDir = path.join(accumDir, currentdir);
    if (!fs.existsSync(jointDir)) {
      fs.mkdirSync(jointDir);
    }
    return jointDir;
  }, '');
}

/**
 * Mocking fs#copyFileSync (not implemented in memfs)
 */
function copyFileSync(src, dest) {
  if (!fs.lstatSync(src).isFile()) {
    throw new Error(`copyFileSync expected file but got: ${src}`);
  }
  fs.writeFileSync(dest, fs.readFileSync(src));
}

/**
 * Utility function to copy a directory to a destination recursively
 */
function copyDirSync(src, dest) {
  if (fs.lstatSync(src).isDirectory()) {
    const files = fs.readdirSync(src);
    files.forEach((file) => {
      const curSource = path.join(src, file);
      const curDest = path.join(dest, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        if (!fs.existsSync(curDest)) {
          createDir(curDest);
        }
        copyDirSync(curSource, curDest);
      } else {
        copyFileSync(curSource, curDest);
      }
    });
  }
}

/**
 * Mocks
 */

/**
 * Mocking fs-extra#outputFileSync
 */
fs.outputFileSync = (file, data) => {
  createDir(file);
  fs.writeFileSync(file, data);
};

/**
 * Mocking fs-extra#emptydirSync
 */
fs.emptydirSync = (dir) => {
  if (!fs.existsSync(dir)) {
    createDir(dir);
  } else {
    rimraf(dir);
  }
};

/**
 * Mocking fs-extra#copySync
 */
fs.copySync = (src, dest) => {
  if (fs.lstatSync(src).isDirectory()) {
    copyDirSync(src, dest);
  } else {
    copyFileSync(src, dest);
  }
};

/**
 * Mocking fs-extra#readJsonSync
 */
fs.readJsonSync = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'));


/**
 * Mocking fs-extra#outputJsonSync
 */
fs.outputJsonSync = (file, jsonData) => {
  fs.outputFileSync(file, JSON.stringify(jsonData));
};

/**
 * Mocking fs-extra-promise#removeAsync
 */
fs.removeAsync = pathArg => new Promise((resolve, reject) => {
  try {
    if (fs.lstatSync(pathArg).isDirectory()) {
      rimraf(pathArg);
    } else {
      fs.unlinkSync(pathArg);
    }
    resolve();
  } catch (err) {
    reject(err);
  }
});

/**
 * Mocking fs-extra-promise#copyAsync
 */
fs.copyAsync = (src, dest) => new Promise((resolve, reject) => {
  try {
    fs.copySync(src, dest);
    resolve();
  } catch (err) {
    reject(err);
  }
});

/**
 * Mocking fs-extra-promise#accessAsync
 */
fs.accessAsync = pathArg => new Promise((resolve, reject) => {
  try {
    fs.accessSync(pathArg);
    resolve();
  } catch (err) {
    reject(err);
  }
});

/**
 * Mocking fs-extra-promise#outputFileAsync
 */
fs.outputFileAsync = (file, data) => new Promise((resolve, reject) => {
  try {
    fs.outputFileSync(file, data);
    resolve();
  } catch (err) {
    reject(err);
  }
});

/**
 * Mocking fs-extra-promise#mkdirp
 */
fs.mkdirp = dir => new Promise((resolve) => {
  createDir(dir);
  resolve();
});

/**
 * Mocking fs-extra#copySync
 */
fs.copySync = (src, dest) => {
  if (fs.lstatSync(src).isDirectory()) {
    copyDirSync(src, dest);
  } else {
    copyFileSync(src, dest);
  }
};

/**
 * Mocking fs-extra-promise#outputJsonAsync
 */
fs.outputJsonAsync = (file, jsonData) => new Promise((resolve, reject) => {
  try {
    fs.outputJsonSync(file, jsonData);
    resolve();
  } catch (err) {
    reject(err);
  }
});

/**
  * Mocking fs-extra-promise#readJsonAsync
 */
fs.readJsonAsync = filePath => new Promise((resolve, reject) => {
  try {
    resolve(fs.readJsonSync(filePath));
  } catch (err) {
    reject(err);
  }
});

fs.vol = vol;
module.exports = fs;
