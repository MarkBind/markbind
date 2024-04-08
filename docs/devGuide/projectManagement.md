{% set title = "Project management" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

This page contains information about project management tasks. The target audience is senior developers (and above).
</div>

## Managing PRs

For general best practices, refer to the guide [_Working with PRs_ @SE-EDU](https://se-education.org/guides/guidelines/PRs.html).

### Approval

* **If the PR is very simple** (e.g. correcting a simple typo), one approval is sufficient for merging. Other PRs need two approvals.

* **Once the first approval is given** from a developer, assign a version milestone to the PR (this is usually the next version, unless there is a justification for delaying the merging to future versions).

  <box type="info" seamless>

  **Note:** Should there be a subsequent rejection by other reviewers (or an error is spotted), the version milestone is removed immediately. The version milestone should only be restored once the new approvals come in.
  </box>

* **Once the second approval is given** from a ==senior developer== (or there are >= 3 approvals given from anyone), the PR can be merged immediately.<br>
  If there is no second approval yet, wait for a day before merging the PR without the second approval.

  <box type="info" seamless>

  This is to allow other developers the chance to review the PR, and delay the merge if there's any significant problems. Not everyone is available all of the time, so please be patient.
  </box>

### Merging

1. **Re-sync the PR branch with master to trigger the CI pipeline.**

   <box type="info" seamless>

   **Rationale:** This is because we do not ask PR authors to rebase their PRs, but the master branch may have since been updated. It is possible for tests to pass on their branch, only to fail when integrating the changes with the master

   This is possible even if GitHub _doesn't_ complain about any merge conflict!
   </box>
1. **Merge the PR**.

   * Refer to the guide [_Working with PRs_ @SE-EDU](https://se-education.org/guides/guidelines/PRs.html) on which merge strategy to use.
     * The **default** strategy is to do a **squash-merge**.
     * Use a **merge commit** if
       * the commits are well-organized, and the branch tackles only one task. This would typically be a PR tackling a substantial issue requiring multiple dependent and successive changes.
     * Use a **rebase-merge** if
       * the commits are well-organized, and each commit is an independent task. This should be extremely rare as we typically advise that PRs should not have unrelated changes. An example can be found [here](https://github.com/MarkBind/markbind/pull/1238).

   * Format for the merge/squashed commit title: `PR_TITLE (#PR_NUMBER)`<br>
    `Add built-in support for light themes from bootswatch (#745)`

   * For non-trivial PRs, ensure that there is a sensible commit message accompanied by it. Both the title and the body should follow the [_Git conventions_ @SE-EDU](https://se-education.org/guides/conventions/git.html).

   * Before confirming the merge, do ensure that no other PRs have been merged to master _since the time you started drafting the merging commit's title and message_. Otherwise, you may face a glitch where GitHub merges your PR without squashing. (Reference: [MarkBind#1160](https://github.com/MarkBind/markbind/pull/1160))

1. **Use the r.Major/Minor/Patch label** to tag the PR.

   <box type="info" seamless>

   **Reason:** The release manager may not review all PRs, so please add the label to highlight the version impact of the PR. This helps to clarify which milestone the PR should be assigned to.
   </box>

1. **Draft the release note for breaking changes**.

   <box type="info" seamless>

   **Reason:** The release manager may not have the full details of the PR, so please work with the PR author to prepare a release note (if applicable) in the PR description.
   </box>

1. **Set a milestone** to the PR.

   <box type="info" seamless>

   **Reason:** We may have missed it during the "Approval" stage, so please add the version milestone if it is missing, so that the drafting of the release notes during the release process will be easier.
   </box>

1. Tip: how to **undo an accidental merge commit.**

   * In the event of a wrong commit strategy chosen, you can undo the merge to master by:
     1. Switch to the master branch locally.
     1. Run `git reset --hard HEAD~1`.
     1. Run `git push --force`.
     1. Create a new PR from the previous PR branch and merge the PR with the correct merge strategy.

   <box type="info" seamless>

   **Note:** The above should be performed with caution as force pushing rewrites the Git history, which might cause conflicts with any on-going work. You would also need write/push access to master.
   </box>

## Doing a Release
1. **Make sure you have the correct permissions** for [MarkBind's GitHub repository](https://github.com/MarkBind/markbind) and [npm organization](https://www.npmjs.com/org/markbind).
    * For GitHub, you need rights to **push to master branch** and **make new releases**.
        * To check if you can make a new release and push to master branch, go to the [release page](https://github.com/MarkBind/markbind/releases) and check for the "Draft a new release" button. 
          If missing, you may not have permissions for a release.

    * For npm, you need to be in the [MarkBind organization](https://www.npmjs.com/org/markbind).
   
      * To check if you are in the MarkBind organization, go to your npm profile and check if MarkBind is listed under organizations.
        <pic src="/images/npm-profile.jpg" width="100%" alt="npm profile">
        Example of profile that has been added to Markbind organisation
        </pic>
      * There should be 4 packages listed under the organization, `markbind-cli`, `@markbind/core`, `@markbind/core-web` and `@markbind/vue_components`. 
      * Notably, the first three are packages that we publish every release while the last one has since become a private package consumed internally.

1. **Login to your npm account in your terminal** by running `npm login`.

1. **Make sure to start with a "clean slate"** by running `npx lerna clean` and then `npm run setup` in the root MarkBind directory.

1. **Increment the version number** by running `npx lerna version --no-push --exact`. Which to increment (`patch`, `minor` or `major`) depends on what PRs are merged for the new version, which means you must know beforehand about the changes.

   <box type="info" seamless>

   * Double check that the PRs are correctly set to the milestone for the new version. Review the definition of [SEMVER](https://semver.org/) and the impact of the PRs.
   * We will specify updated version numbers exactly to ensure that each version will consistently fetch the same versioned internal packages.
   * The end result of this command is version commit with an appropriate tag. We will make use of the generated tag and commit message later.
   * Do not push this commit to the remote repository yet.
   </box>

1. **Build the core-web package bundle** by executing `npm run build:web` in the root directory, after which you should see changes in the bundles located in `packages/core-web/dist`. <br><br>Take a peek at the diff for the bundles to see if there are any strange changes.

   <box type="tip" seamless>

   * If there were no changes to the files in `packages/core-web` or `packages/vue-components` since the last release of MarkBind, you may observe no changes. Simply proceed with the rest of the steps.
   * If there are font files in the diff, and you are sure that there were no changes to the font files, you may ignore & discard the changes.
   * Typically, the following files will be updated:
     * `markbind.min.js`
     * `markbind.min.css`
     * `vuecommonappfactory.min.js`
     * `vuecommonappfactory.min.css`
   </box>

1. **Rebuild the test files** using `npm run updatetest`

   When rebuilding the expected test files, ensure that **only** the version number is updated for the output `.html` files. For example, this is correct:

   ```diff
   diff --git a/test/functional/test_site/expected/bugs/index.html b/test/functional/test_site/expected/bugs/index.html
   index 779f279..bb3c602 100644
   --- a/test/functional/test_site/expected/bugs/index.html
   +++ b/test/functional/test_site/expected/bugs/index.html
   @@ -4,7 +4,7 @@
        <meta name="default-head-top">
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
   -    <meta name="generator" content="MarkBind 1.20.0">
   +    <meta name="generator" content="MarkBind 1.21.0">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Open Bugs</title>
        <link rel="stylesheet" href="../markbind/css/bootstrap.min.css">
   ```

   If any other lines changed, that likely means the functional tests weren't updated in a pull request. Do revert everything done so far, and make a pull request specifically to fix that first!

1. **If core-web package bundle was updated earlier**: also ensure that the **updated bundles** are copied to each of the expected test site's folders.

   <box type="info" seamless>

   * We do this for each MarkBind release (rather than require contributors to update the bundles for each affected PR), in order to reduce unnecessary merge conflicts. It also makes it easier for the maintainers to vet the changes.
   * Typically, the bundle will be updated automatically in the expected test site's folders after running `npm run updatetest` in the previous step.
   </box>

1. **Combine** the changes that you made in the last two steps with the [version commit](https://docs.npmjs.com/cli/version) generated by `lerna version`. To do so, amend the version commit and version tag by doing the following — take note to change `vA.B.C` to the new version.

   ```sh
   $ git commit -a --amend --reuse-message vA.B.C
   $ git tag --force vA.B.C     # to reassign the tag to the newly amended commit
   ```

1. **Push** the new commit and version tag generated by `npm` (change `vA.B.C` to the new version's string accordingly).

   ```sh
   $ git push upstream master
   $ git push upstream vA.B.C
   ```

1. **Publish** by running `npx lerna publish from-git`. You should receive a notification by `npm` that the publish is successful.

1. **Smoke test** the new version by installing the new version (run `npm i -g markbind-cli@A.B.C`) and playing around with it a bit to ensure that it works.

   <box type="info" seamless>

   * If you used `npm link` for your project, ensure that you ==try the new release on another platform== that doesn't use `npm link`, so that we can be sure the end-users can install and use the new version.
   * You can also try the new release on a project that uses MarkBind as a local dev-dependency.
   </box>

1. **Verify the website** at markbind.org has been updated. For example, you can look at the footer of the website to see if the version number is updated.

   <box type="info" seamless>

   Note that it may take a few minutes for the website to be updated and you may need to check it in an incognito window to avoid caching.
   </box>

   The deployment is automated. However, if it doesn't deploy properly for the release, do the following:

   ```sh
   $ npm run deploy:ug
   ```

1. **Update milestones**. Close the [milestone on GitHub](https://github.com/MarkBind/markbind/milestones) and all issues in that milestone.

   Also create a new milestone for the next iterations. Recommended to have at least two upcoming milestones opened. Use the format `vA.B.C` for the milestone title.

1. **Release on GitHub**.

   a. Go to the MarkBind release page at https://github.com/MarkBind/markbind/releases.

   b. Click "Draft a new release".

   c. For the tag version, enter `vA.B.C`. (The newly released version should be recognized by GitHub, with an "Existing Tag" indicator, otherwise, ensure that you have pushed the version commit and tag in step 4).

   d. For the release title, leave it blank.

   e. Press the "Generate release notes" button to automatically add the list of PRs merged for this release.

   f. For the main body, use the following template:

      ```markdown
      # markbind-cli

      <!-- List out each of the PR for this version in the following format: -->
      <!-- PR_TITLE by @username in #PR_NUMBER -->

      ## User Facing Changes

      ### Breaking Changes

      <!-- Any feature that is made obsolete -->

      > Also give a brief explanation note about:
      >   - what was the old feature that was made obsolete
      >   - any replacement feature (if any), and
      >   - how the author should modify his website to migrate from the old feature to the replacement feature (if possible).

      ### Features

      <!-- Features enable users (authors/readers) to do something new. -->

      ### Enhancements

      <!-- Enhances any existing features -->

      ### Fixes

      <!-- Fixes correct a programming error/assumption. -->

      ### Documentation

      <!-- Pure changes to the documentation, such as typo, restructuring, etc -->

      ## Developer Facing Changes

      ### Code Quality

      <!-- Refactoring, etc. -->

      ### DevOps Changes

      <!-- Tooling, etc. -->

      ### Dependencies

      <!-- Dependency version upgrades of the main or any subpackages -->

      ### Miscellaneous

      <!-- Any other changes -->

      ```

      Thoroughly review and categorize each PR to its appropriate section within the release notes. If needed, provide additional explanations for clarity. Any sections without a corresponding PR can be omitted.

      An example of a release note draft (taken from v1.18.0):

      ```
      # markbind-cli

      ### Breaking Changes

      #653 Disable decamelize for anchor ID generation (#667, MarkBind/vue-strap#95)

      > Headings with PascalCase wordings now generate a different anchor ID
      in order to be more compatible with anchor IDs generated by GitHub
      Flavored Markdown.
      >
      > For example, if we have the following heading:
      >
      > ```markdown
      > # MarkBind docs
      > ```
      >
      > Old anchor id:
      >
      > ```
      > mark-bind-docs
      > ```
      >
      > **New** anchor id:
      >
      > ```
      > markbind-docs
      > ```
      >

      ### Features

      #457 Add `deploy -t/--travis` to deploy via Travis (#649)
      #470 Support custom MarkBind plugins (#474)
      #642 Support specifying include variables inline (#681)

      ### Enhancements

      #369 Seamless panels: omit caret if not expandable (MarkBind/vue-strap#96)
      #657 Add temporary styles to prevent FOUC (#664)

      ### Fixes

      #651 Exit MarkBind with non-zero exit code on fatal error (#679)

      ### Documentation

      Restructure user docs on MarkBind syntax (#668)
      Add documentation for badges (#686)
      Fix filename capitalization for syntax documentation (#685)

      ### Code Quality

      test: Add diff printing for easier debugging (#632)

      ### Dependencies

      Bump acorn from 7.1.0 to 7.1.1 in /packages/core (#1120)
      ```

   f. Click "Publish release".

1. **Announce the new release** on our Slack channel (replace `A.B.C` with the new version). Congrats!

   >Published: `npm i -g markbind-cli@A.B.C`

## Acknowledging Contributors

This project follows the [all-contributors](https://allcontributors.org/) specification.

### View all contributors

Besides the contributors list provided by GitHub, the list of all MarkBind contributors is available in `README.md`.
The table shown in `README.md` is based on the entries from `.all-contributorsrc`.

### Add new contributors

To simplify the process, use the all-contributors bot that has been installed in the repository to trigger a PR that will add a new contributor.

Example workflow:

1. A new contributor 'tlylt'(GitHub username) has opened a PR to committed code changes to the repository.
1. A senior dev reviews and approves the PR.
1. The senior dev comments in that PR with the line "@all-contributors please add tlylt for code" to trigger an automatic PR that will apply relevant changes
to include 'tlylt' in `.all-contributorsrc` and `README.md`.
1. The senior dev approves and merge the automatic PR.
1. The senior dev deletes the automatic PR.

Note that:

* All contribution types specified [here](https://allcontributors.org/docs/en/emoji-key) can be used.
  * E.g. code, doc, mentoring, question, test, bug
* Multiple contribution types can be included at once or updated later on.
  * E.g. "@all-contributors please add tlylt for code, doc"
* Contribution types can be updated later on.
  * E.g "@all-contributors please add tlylt for code"
  * Some time later: "@all-contributors please add tlylt for doc"
  * Result: 'tlylt' will be updated to have both icons(code and doc)

{% from "njk/common.njk" import previous_next %}
{{ previous_next('githubActions/markbindReusableWorkflows', 'styleGuides') }}
