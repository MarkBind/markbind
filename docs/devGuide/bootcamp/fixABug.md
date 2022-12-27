{% set title = "Fix a Bug" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: 3
</frontmatter>

# {{ title }}

<div class="lead">

Bug fixes are a great way to improve MarkBind. As the project evolves, bugs are inevitably introduced, reported, and waiting to be fixed.

</div>

## TLDR

- [ ] Triage
- [ ] Make experimental changes
- [ ] Add tests
- [ ] Update documentation
- [ ] Create PR & Follow up with the reviews

## Triage

As bugs can be of varying complexity and involve different parts of the codebase, we will work through a concrete example of a fixed bug to illustrate the process. As the bug has been fixed, in some steps we will be looking at the codebase at the time of the bug report.

**!!Let's suppose we want to fix the bug reported in [issue #1954](https://github.com/MarkBind/markbind/issues/1954).!!**

The initial steps when a bug is reported are to:
1. Read and understand the bug report.
   1. This is to ensure that the bug is not duplicated and that the bug reported needs to be fixed.
1. Make any necessary clarifications with the reporter.
1. Reproduce the bug locally

To experiment with the bug, we will check out the commit that was made before the bug was fixed. This is to ensure that we are able to reproduce the bug locally.

Run the following command to check out the commit before the bug was fixed:
```bash
git checkout 9bb130e1ddb8ac0686d2b7e45bc8b89b79fcb2e4
```

Now, we will create a new test site to experiment with the bug. (In some cases we can reuse an existing test site, but in this case as it invovles changing the default template,)

## Make Experimental Changes

## Create PR & Follow up with the reviews

## Summary

In this task, you have learned how to deal with a bug.


When you are ready, move on to learn how to implement a new feature!

{% from "njk/common.njk" import previous_next %}
{{ previous_next('contributeToDocs', '../styleGuides') }}