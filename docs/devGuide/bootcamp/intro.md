{% set title = "Onboarding Bootcamp" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
</frontmatter>

# {{ title }}

<div class="lead">

New developers are often confused about how to get started in brown-field projects. This onboarding bootcamp is created to ramp up developer familiarity with the MarkBind codebase and get you started with contributing (in a variety of ways) to MarkBind.

</div>

In the following pages, we will go through a series of tasks and you are encouraged to follow along to walk through some of the typical development workflows. When in doubt, you can always refer to the rest of the developer guide for more information.

**Structure**

Each Task will include a "TLDR" section that summarizes the key objectives. This is intended for developers who wish to attempt the task on their own. The rest of the page will include a step-by-step guide and checkpoints
to help you complete the task.

**Summary of Tasks**

1. [Explore MarkBind as a user](exploreMarkBind.md)
1. [Contribute to our documentation](contributeToDocs.md)
1. [Fix a bug](fixABug.md)
1. [Implement a new feature](implementAFeature.md)

**Maintainers' Note**

This onboarding bootcamp is intended for developers who are keen to make more than just one contribution to the project. It is particularly well-suited for onboarding NUS [Independent Work Module (CP3108A and CP3108B)](https://nus-oss.github.io/pages/iwm.html) and [Thematic Systems Project (CS3281 aka Software Engineering in Live Projects)](https://nus-cs3281.github.io/website/admin/callForApplications.html) students, but may also be useful to any external developers who wish to dive deeper into the codebase. While we encourage all new developers to go through this process, it is optional and developers are welcome to jump straight into making contributions if they prefer.

The maintenance of this onboarding bootcamp document does require effort. If you encounter any issues as the materials become outdated or have suggestions, we **highly encourage** you to [submit an issue](https://github.com/MarkBind/markbind/issues/new/choose) or make a pull request to update the materials. This will help us keep the onboarding process up-to-date and effective for future developers.


{% from "njk/common.njk" import previous_next %}
{{ previous_next('../devGuide', 'exploreMarkBind') }}
