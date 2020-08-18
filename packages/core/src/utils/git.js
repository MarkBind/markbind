const simpleGit = require('simple-git');
const logger = require('./logger');

const git = simpleGit();

/**
 * Wrapper around simple-git providing helper functions to retrieve repo remote URLs.
 */
module.exports = {
  /**
   * Returns the contents of a remote file, undefined otherwise.
   * See: https://git-scm.com/docs/git-cat-file for accepted values for each input.
   */
  async getRemoteBranchFile(type, remote, branch, fileName) {
    const catFileTarget = `${remote}/${branch}:${fileName}`;
    return git.catFile([type, catFileTarget])
      .catch((err) => {
        logger.warn(err);
        return undefined;
      });
  },
  async getRemoteUrl(remote) {
    logger.info(remote);
    return git.remote(['get-url', remote])
      .catch((err) => {
        logger.warn(err);
        return undefined;
      });
  },
};
