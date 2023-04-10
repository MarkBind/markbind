{% set title = "Implement a New Feature" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: 3
</frontmatter>

# {{ title }}

<div class="lead">

Creating a new feature makes MarkBind more useful and powerful. This section will guide you through the process of implementing a new feature.

</div>

## TLDR

- [ ] Feature proposal
- [ ] Design & iterate
- [ ] Add tests & update documentation
- [ ] Create PR & Follow up with the reviews

## Feature Proposal
Creating a new feature starts with a feature proposal. This can come from you, or from a user who has requested a new feature in the [issue tracker](https://github.com/MarkBind/markbind/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22c.Feature+%F0%9F%9A%80%22). At this stage, the feature proposal should be discussed extensively to ensure that the feature is well-defined and that it is something that MarkBind should support. There are also enhancements to existing features that can be proposed (see [here](https://github.com/MarkBind/markbind/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Ac.Enhancement)) and worked on.

In this part, we will be mentioning a few completed PRs as examples of how a feature was implemented. You can use them as a reference to get a better idea of how a feature is implemented.


<box type="info" seamless>

[Issue #983](https://github.com/MarkBind/markbind/pull/983) is an example where a proposed feature was worked on in [PR #985](https://github.com/MarkBind/markbind/pull/985) but later closed due to a potential lack of user value.
</box>

## Design & Iterate
When there is consensus on the feature proposal, we can start designing the feature. This involves understanding how MarkBind works and how a feature can be implemented. In the broadest sense:
- Additional Markdown-like syntax can be added by tapping into [markdown-it](https://github.com/markdown-it/markdown-it) which does Markdown parsing and rendering.
  - e.g. [issue #900](https://github.com/MarkBind/markbind/issues/900) and [PR #1657](https://github.com/MarkBind/markbind/pull/1657)
- Dynamic components can be created via [Vue.js](../development/writingComponents.html#writing-components).
  - e.g. [issue #898](https://github.com/MarkBind/markbind/issues/898) and [PR #1858](https://github.com/MarkBind/markbind/pull/1858)
- Creating default or optional plugins can be done with our [plugin system](../development/writingPlugins.html).
  - e.g. [issue #1754](https://github.com/MarkBind/markbind/issues/1754) and [PR #1824](https://github.com/MarkBind/markbind/pull/1824)
- And more!
  - e.g. [issue #1946](https://github.com/MarkBind/markbind/issues/1946) and [PR #1947](https://github.com/MarkBind/markbind/pull/1947)


## Add Tests & Update Documentation

_(Same as what we mentioned in the previous task)_

By this time, you should have a good idea about how tests and documentation are written. Where possible, unit tests should also be added to ensure that the feature works as expected. Utilizing the new feature in our documentation is also encouraged so that we can get a better idea of how the feature can be used.

<box type="important" light>

When adding intra-site links, use tags to differentiate between the deployment environment when appropriate, as mentioned in [Adding Intra-Site Links to Documentation](/devGuide/development/workflow.html#adding-intra-site-links-to-documentation)!

</box>

## Create PR & Follow up with the Reviews

_(Same as what we mentioned in the previous task)_

<include src="contributeToDocs.md#pr-steps" />

For features, it is also crucial to get early feedback on implementation details. This is because some considerations may need to be exercised when introducing new user-facing syntax. Another problem is that the implementation may not be the most appropriate or straightforward one, sometimes due to how existing code is structured.

<box type="info" seamless>

[Issue #1475](https://github.com/MarkBind/markbind/issues/1475) is an example where the work in [PR #1988](https://github.com/MarkBind/markbind/pull/1988) involved changing the implementation midway.
</box>


## Summary
In this part, we have reviewed the steps to implement a new feature. Working on a new feature can be a daunting task, but it is also very rewarding to own a feature from start to finish.

Here are some additional tasks for you to try out:
- [ ] Look through the mentioned PRs and try to understand how the features were implemented.
- [ ] Look through the issue tracker and see if there are any features that you would like to work on.

And...that's it!:rocket::rocket::rocket:

You have completed the bootcamp! Take a well-deserved rest and we look forward to your contributions!

{% from "njk/common.njk" import previous_next %}
{{ previous_next('fixABug', '../development/settingUp') }}