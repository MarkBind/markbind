import { SimpleGit } from 'simple-git';

/**
 * Contains methods using simple-git to perform commands relating to git.
 */

/**
 * Returns the contents of a remote file, undefined if an error was encountered.
 * See: https://git-scm.com/docs/git-cat-file for accepted values for each input.
 */
export async function getRemoteBranchFile(
  simpleGit: SimpleGit, type: string, remote: string, branch: string, fileName: string,
) {
  try {
    const catFileTarget = `${remote}/${branch}:${fileName}`;
    return await simpleGit.catFile([type, catFileTarget]);
  } catch (e) {
    return undefined;
  }
}

/**
 * Returns the contents of a remote url (https or ssh), undefined if an error was encountered.
 */
export async function getRemoteUrl(simpleGit: SimpleGit, remote: string) {
  try {
    return await simpleGit.remote(['get-url', remote]);
  } catch (e) {
    return undefined;
  }
}
