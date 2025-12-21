const fs = require('fs-extra');
const path = require('path');

function cleanupConvert(siteName) {
  const directoriesToRemove = [
    path.join(siteName, 'non_markbind_site/_markbind'),
    path.join(siteName, 'non_markbind_site/_site'),
  ];
  directoriesToRemove.forEach((dir) => {
    fs.removeSync(dir);
  });

  const filesToRemove = [
    path.join(siteName, 'non_markbind_site/about.md'),
    path.join(siteName, 'non_markbind_site/index.md'),
    path.join(siteName, 'non_markbind_site/site.json'),
  ];
  filesToRemove.forEach((filePath) => {
    fs.removeSync(filePath);
  });
}

function cleanupConvertPwa(siteName) {
  cleanupConvert(siteName);

  const filesToRemove = [
    path.join(siteName, 'non_markbind_site/manifest.json'),
    path.join(siteName, 'non_markbind_site/sw.js'),
  ];
  filesToRemove.forEach((filePath) => {
    fs.removeSync(filePath);
  });
}

module.exports = {
  cleanupConvert,
  cleanupConvertPwa,
};
