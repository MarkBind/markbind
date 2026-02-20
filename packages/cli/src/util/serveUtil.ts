import fs from 'fs-extra';
import path from 'path';

import * as fsUtil from '@markbind/core/src/utils/fsUtil';
import {
  LAZY_LOADING_SITE_FILE_NAME,
} from '@markbind/core/src/Site/constants';

import { LiveServer as liveServer } from '../lib/live-server/index.js';
import * as logger from './logger.js';

/**
 * Synchronizes opened pages list before reload
 * @param site The site instance
 */
const syncOpenedPages = (site: any): void => {
  logger.info('Synchronizing opened pages list before reload');
  const normalizedActiveUrls = liveServer.getActiveUrls().map((url: string) => {
    const completeUrl = path.extname(url) === '' ? path.join(url, 'index') : url;
    return fsUtil.removeExtension(completeUrl);
  });
  site.changeCurrentOpenedPages(normalizedActiveUrls);
};

/**
 * Handler for file addition events
 * @param site The site instance
 * @param onePagePath Flag indicating if one page mode is enabled
 * @returns Function that handles the file addition
 */
const addHandler = (site: any, onePagePath?: boolean) => (filePath: string): void => {
  logger.info(`[${new Date().toLocaleTimeString()}] Reload for file add: ${filePath}`);
  if (onePagePath) {
    syncOpenedPages(site);
  }
  Promise.resolve().then(async () => {
    if (site.isFilepathAPage(filePath) || site.isDependencyOfPage(filePath)) {
      return site.rebuildSourceFiles();
    }
    return site.buildAsset(filePath);
  }).catch((err: Error) => {
    logger.error(err.message);
  });
};

/**
 * Handler for file change events
 * @param site The site instance
 * @param onePagePath Flag indicating if one page mode is enabled
 * @returns Function that handles the file change
 */
const changeHandler = (site: any, onePagePath?: boolean) => (filePath: string): void => {
  logger.info(`[${new Date().toLocaleTimeString()}] Reload for file change: ${filePath}`);
  if (onePagePath) {
    syncOpenedPages(site);
  }
  Promise.resolve().then(async () => {
    if (path.basename(filePath) === path.basename(site.siteConfigPath)) {
      return site.reloadSiteConfig();
    }
    if (site.isDependencyOfPage(filePath)) {
      return site.rebuildAffectedSourceFiles(filePath);
    }
    return site.buildAsset(filePath);
  }).catch((err: Error) => {
    logger.error(err.message);
  });
};

/**
 * Handler for file removal events
 * @param site The site instance
 * @param onePagePath Flag indicating if one page mode is enabled
 * @returns Function that handles the file removal
 */
const removeHandler = (site: any, onePagePath?: boolean) => (filePath: string): void => {
  logger.info(`[${new Date().toLocaleTimeString()}] Reload for file deletion: ${filePath}`);
  if (onePagePath) {
    syncOpenedPages(site);
  }
  Promise.resolve().then(async () => {
    if (site.isFilepathAPage(filePath) || site.isDependencyOfPage(filePath)) {
      return site.rebuildSourceFiles();
    }
    return site.removeAsset(filePath);
  }).catch((err: Error) => {
    logger.error(err.message);
  });
};

/**
 * Middleware for lazy reloading
 * @param site The site instance
 * @param rootFolder The root folder of the site
 * @param config The site configuration
 * @returns Middleware function
 */
const lazyReloadMiddleware
    = (site: any, rootFolder: string, config: any) => (req: any, res: any, next: any) => {
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

export {
  addHandler,
  changeHandler,
  lazyReloadMiddleware,
  removeHandler,
};
