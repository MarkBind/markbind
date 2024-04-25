{% set title = "GitHub Actions: Workflow Security" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

GitHub Actions are a powerful tool for automating workflows. However, it is important to ensure that your workflows are secure to prevent malicious actors from exploiting them.

**Here are some best practices to follow when working on GitHub Actions workflows.**

</div>

### Minimally scoped credentials
Every credential used in the workflow should have the minimum required permissions to execute the job. Without explicit specification of permissions, the default permissions are used, which are usually more permissive than necessary.

Use the ‘permissions’ key to make sure the `GITHUB_TOKEN` is configured with the least privileges for each job.
For example, to restrict the `GITHUB_TOKEN` to read-only:
```yaml
jobs:
  read-content-at-job-level:
    runs-on: ubuntu-latest
    permissions:
      contents: read
```

<box type="tip" seamless>

`permissions` can be restricted at the repo, workflow or job level. Pick the most restrictive level that still allows the workflow to function.

</box>

**Environment variables**, like {% raw %} `${{ secrets.GITHUB_TOKEN }}` {% endraw %}, should be limited by scope, and should be declared at the step level when possible.

### Security precautions when using `pull_request_target` event
Read access is the most permissive access to be given for pull requests from public forked repositories to maintain security.

<box type="info" seamless>

Since MarkBind uses the forking workflow, workflows run on pull requests won't have write access, preventing them from doing things like adding comments or labels to pull requests.

</box>

When a workflow is triggered by the `pull_request_target` event, the `GITHUB_TOKEN` is granted read/write repository permission, even when it is triggered from a public fork. This could lead to security vulnerabilities if not handled properly.

This event should not be used with `actions/checkout` as it can give write permission and secrets access to untrusted code from the forked code. Any building step, script execution, or even action call could be used to compromise the entire repository.

This can be fixed by adding code to ensure that the codebase being checked out, using `actions/checkout`, belongs to the base branch.
This can be done using:
{% raw %}
```yaml
- uses: actions/checkout@v4
  with:
    ref: ${{ github.base_ref }}
```
{% endraw %}

This method triggers workflows based on the latest commit of the pull request's base branch. Workflows on the base branch aren't affected by changes on feature branches, avoiding execution of malicious code in <tooltip content="Continuous Integration">CI</tooltip>.

<box type="warning" seamless>

This method could be limiting since the codebase checked out, using `actions/checkout`, is not up to date for the pull request. This means that the code checked out is not the code that is being tested. This could lead to false positives or false negatives in the testing process.

</box>

Another solution that allows `pull_request_target` to work securely with `actions/checkout` on the pull request branch, is to implement running workflow only on approval by trusted users. This means that the workflow is only run after a user has checked for malicious code on the feature branch manually and approves the run.

Information about reviewing workflows can be found [here](https://docs.github.com/en/actions/managing-workflow-runs/reviewing-deployments).

### Untrusted input
Directly referencing values you do not control, such as {% raw %} `echo “${{github.event.pull_request.title}}”` {% endraw %}, can lead to security vulnerabilities since it can contain malicious code and lead to an injection attack.

Instead use an action with arguments (recommended):
{% raw %}
```yaml
uses: fakeaction/printtitle@v3 
with: 
  title: ${{ github.event.pull_request.title }}
```
{% endraw %}

Or bind the value to an intermediate environment variable:
{% raw %}
```yaml
- name: Print title
  env: 
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: | 
  echo “$PR_TITLE”
```
{% endraw %}

{% from "njk/common.njk" import previous_next %}
{{ previous_next('markbindReusableWorkflows', '../projectManagement') }}