const logger = require('./logger');

/**
 * Wrapper around simple-git providing helper functions to retrieve repo remote URLs.
 */
module.exports = {
  /**
   * Returns the contents of a remote file, undefined otherwise.
   * See: https://git-scm.com/docs/git-cat-file for accepted values for each input.
   */
  async getRemoteBranchFile(simpleGit, type, remote, branch, fileName) {
    const catFileTarget = `${remote}/${branch}:${fileName}`;
    return simpleGit.catFile([type, catFileTarget])
      .catch((err) => {
        logger.warn(err);
        return undefined;
      });
  },
  async getRemoteUrl(simpleGit, remote) {
    return simpleGit.remote(['get-url', remote])
      .catch((err) => {
        logger.warn(err);
        return undefined;
      });
  },
};
