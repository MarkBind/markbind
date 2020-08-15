const simpleGit = require('simple-git');
const logger = require('./logger');

const git = simpleGit();

/**
 * Wrapper around simple-git providing helper functions to retrieve repo remote URLs.
 */
module.exports = {
  getRepoRemoteUrl() {

  },
  getOriginUrl() {

  },
  // Returns the cname found in /CNAME of the gh-pages branch of the current repo.
  getCname() {
    git.catFile(['blob', 'origin/gh-pages:CNAME'], (err, result) => {
      if (err) {
        logger.error(err);
        return undefined;
      }
      logger.info(result);
      return result;
    });
  },
};
