const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');

const fsUtil = require('@markbind/core/src/utils/fsUtil');
const {
  LAZY_LOADING_SITE_FILE_NAME,
} = require('@markbind/core/src/Site/constants');

const liveServer = require('../lib/live-server');
const logger = require('./logger');

const syncOpenedPages = (site) => {
  logger.info('Synchronizing opened pages list before reload');
  const normalizedActiveUrls = liveServer.getActiveUrls().map((url) => {
    const completeUrl = path.extname(url) === '' ? path.join(url, 'index') : url;
    return fsUtil.removeExtension(completeUrl);
  });
  site.changeCurrentOpenedPages(normalizedActiveUrls);
};

const addHandler = (site, onePagePath) => (filePath) => {
  logger.info(`[${new Date().toLocaleTimeString()}] Reload for file add: ${filePath}`);
  if (onePagePath) {
    syncOpenedPages(site);
  }
  Promise.resolve('').then(async () => {
    if (site.isFilepathAPage(filePath) || site.isDependencyOfPage(filePath)) {
      return site.rebuildSourceFiles();
    }
    return site.buildAsset(filePath);
  }).catch((err) => {
    logger.error(err.message);
  });
};

const changeHandler = (site, onePagePath) => (filePath) => {
  logger.info(`[${new Date().toLocaleTimeString()}] Reload for file change: ${filePath}`);
  if (onePagePath) {
    syncOpenedPages(site);
  }
  Promise.resolve('').then(async () => {
    if (path.basename(filePath) === path.basename(site.siteConfigPath)) {
      return site.reloadSiteConfig();
    }
    if (site.isDependencyOfPage(filePath)) {
      return site.rebuildAffectedSourceFiles(filePath);
    }
    return site.buildAsset(filePath);
  }).catch((err) => {
    logger.error(err.message);
  });
};

const removeHandler = (site, onePagePath) => (filePath) => {
  logger.info(`[${new Date().toLocaleTimeString()}] Reload for file deletion: ${filePath}`);
  if (onePagePath) {
    syncOpenedPages(site);
  }
  Promise.resolve('').then(async () => {
    if (site.isFilepathAPage(filePath) || site.isDependencyOfPage(filePath)) {
      return site.rebuildSourceFiles();
    }
    return site.removeAsset(filePath);
  }).catch((err) => {
    logger.error(err.message);
  });
};

const lazyReloadMiddleware = (site, rootFolder, config) => (req, res, next) => {
  const urlExtension = path.posix.extname(req.url);

  const hasEndingSlash = req.url.endsWith('/');
  const hasNoExtension = urlExtension === '';
  const isHtmlFileRequest = urlExtension === '.html' || hasEndingSlash || hasNoExtension;

  if (!isHtmlFileRequest || req.url.endsWith('._include_.html')) {
    next();
    return;
  }

  if (hasNoExtension && !hasEndingSlash) {
    // Urls of type 'host/userGuide' - check if 'userGuide' is a raw file or does not exist
    const diskFilePath = path.resolve(rootFolder, req.url);
    if (!fs.existsSync(diskFilePath) || !(fs.statSync(diskFilePath).isDirectory())) {
      // Request for a raw file
      next();
      return;
    }
  }

  const urlWithoutBaseUrl = req.url.replace(config.baseUrl, '');
  // Map 'hostname/userGuide/' and 'hostname/userGuide' to hostname/userGuide/index.
  const urlWithIndex = (hasNoExtension || hasEndingSlash)
    ? path.posix.join(urlWithoutBaseUrl, 'index')
    : urlWithoutBaseUrl;
  const urlWithoutExtension = fsUtil.removeExtension(urlWithIndex);

  const didInitiateRebuild = site.changeCurrentPage(urlWithoutExtension);
  if (didInitiateRebuild) {
    req.url = fsUtil.ensurePosix(path.join(config.baseUrl || '/', LAZY_LOADING_SITE_FILE_NAME));
  }
  next();
};

module.exports = {
  addHandler,
  changeHandler,
  lazyReloadMiddleware,
  removeHandler,
};
