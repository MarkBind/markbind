/**
 * Contains methods using simple-git to perform commands relating to git.
 */
module.exports = {
  /**
   * Returns the contents of a remote file, undefined if an error was encountered.
   * See: https://git-scm.com/docs/git-cat-file for accepted values for each input.
   */
  async getRemoteBranchFile(simpleGit, type, remote, branch, fileName) {
    try {
      const catFileTarget = `${remote}/${branch}:${fileName}`;
      return await simpleGit.catFile([type, catFileTarget]);
    } catch (e) {
      return undefined;
    }
  },
  /**
   * Returns the contents of a remote url (https or ssh), undefined if an error was encountered.
   */
  async getRemoteUrl(simpleGit, remote) {
    try {
      return await simpleGit.remote(['get-url', remote]);
    } catch (e) {
      return undefined;
    }
  },
};
