<frontmatter>
  title: "Contributing"
  layout: devGuide
  pageNav: default
</frontmatter>

# Contributing to MarkBind 

Thank you for your interest in contributing! We're glad you want to help. Read the sections below to learn about our code of conduct and how to get started contributing.

## Code of conduct

This project and everyone participating in it are governed by our [Code of Conduct]({{baseUrl}}/devGuide/contributing/code-of-conduct.html). By participating, you are expected to uphold this code. Please report unacceptable behavior to markbind@comp.nus.edu.sg.

## Things to do before getting started

Make sure you have the project set up and ready. We have guides detailing what we [expect our contributors to know]({{baseUrl}}/devGuide/devGuide.html#requirement), our required [environment]({{baseUrl}}/devGuide/devGuide.html#environment) and our [development process]({{baseUrl}}/devGuide/devGuide.html#development-process).

## How to contribute

All contributions are welcome. You can contribute to MarkBind by:
- Reporting bugs
- Requesting features
- Making changes (with a corresponding Pull Request), by:
   - Updating documentation
   - Fixing bugs
   - Implementing features 

### How to report a bug

Report bugs in our [issue tracker](https://github.com/MarkBind/markbind/issues), following the guideslines below. This helps us in undestanding your report.

- Before reporting a bug, please search if someone else has has already reported it in the [existing issues](https://github.com/MarkBind/markbind/issues).
- Is your bug from the current version or an older version of MarkBind? What OS are you on? Tell us about your environment, for example, the MarkBind version you are on.
- What did you do? What did you expect to happen? What actually happened? 
  - Include things such the actual MarkBind code causing the issue, the steps for reproduction, the raw output, and what you expect instead can help us in diagnosing the issue quicker
  - You are also encouraged to submit a PR that reproduces this in `test/functional/test_site/bugs/`.

Please do not submit personal support requests (eg: "How do I use X?") as bugs. Instead, feel free to [submit a blank issue](https://github.com/MarkBind/markbind/issues/new) to our issue tracker with a label of <a href="https://github.com/MarkBind/markbind/issues?q=is%3Aopen+is%3Aissue+label%3Aquestion" class="badge" style="color:white; background-color: #A41BD6;">question</a>.

### How to request a feature

We welcome suggestions to improve MarkBind as well. To do so, you can request for new features or enhancements to existing features in our [issue tracker](https://github.com/MarkBind/markbind/issues), following the guidelines below. This helps us in undestanding your request.

- Before requesting a new feature, please search if someone else has has already requested for it in the [existing issues](https://github.com/MarkBind/markbind/issues).
- Is your request related to a problem? Provide a clear and concise description of what the problem is. 
  Eg: I have an issue when [...]
- Describe the solution you'd like. Provide a clear and concise description of what you want to happen.
- Describe alternatives you've considered. Let us know about other solutions you've tried or researched.
- You can also share some additional context, anything else that you can add about the proposal.

### First issues for contributors

Unsure where to begin contributing to MarkBind? 

We recommend that you start off by visiting the [Getting Started](https://markbind.org/userGuide/gettingStarted.html) section in the User Guide and try out MarkBind as a user. Exploring and understanding the various features it provides.

If you have not done so yet, we also recommend visiting the [Developer Guide]({{baseUrl}}/devGuide/index.html) to learn about the [structure of the project]({{baseUrl}}/devGuide/index.html#project-structure), how to set up the [developer environment]({{baseUrl}}/devGuide/index.html#development-process), and how to run [tests]({{baseUrl}}/devGuide/devGuide.html#testing).

When you're ready, you can start by looking through these issues marked <a href="https://github.com/MarkBind/markbind/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+sort%3Acomments-desc" class="badge" style="color:white; background-color: #7057FF;">good first issue</a>.

If you have any questions, be it regarding MarkBind or our workflow, feel free to [submit a blank issue](https://github.com/MarkBind/markbind/issues/new) to our issue tracker with a label of <a href="https://github.com/MarkBind/markbind/issues?q=is%3Aopen+is%3Aissue+label%3Aquestion" class="badge" style="color:white; background-color: #A41BD6;">question</a>.

### How to make Pull Requests to submit changes?

Please follow the steps to have your contribution considered by the maintainers:

1. Follow all the instructions in the pull request [template](https://github.com/MarkBind/markbind/blob/master/.github/PULL_REQUEST_TEMPLATE), the same template is also given to you when you submit a new Pull Request.
2. After you submit your pull request, verify that all [status checks](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks) are passing
3. You can then [request for a review](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/requesting-a-pull-request-review)
   - Not sure who to ask a review from? A good rule of thumb is to check recently [merged](https://github.com/MarkBind/markbind/pulls?q=is%3Apr+is%3Aclosed) or [approved](https://github.com/MarkBind/markbind/pulls?q=is%3Aopen+is%3Apr+review%3Aapproved) pull requests, and see who the reviewers are. It's likely that they are currently active and willing to review your pull request as well!

Reviewer(s) may request additional changes from you in terms of implementation, design, tests, style, or other changes before your pull request is finally approved.