---
  layout: default.md
  title: "Tutorial: Removing feature"
  pageNav: 3
---

# Tutorial: Removing Feature

> Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.
>
> —  Antoine de Saint-Exupery

<box type="tip">
This page can be taken as a reference on a tutorial on how to remove components or functions from your project.
</box>

When working on an existing code base, you will most likely find that some features that are no longer necessary.
This tutorial aims to give you some practice on such a code 'removal' activity by removing `FeatureX`.

<box type="success">

**If you have done the [Add `FeatureX` tutorial](AddingFeature.html)  already**, you should know where the code had to be updated to add `FeatureX`. From that experience, you can deduce where the code needs to be changed to _remove_ it too. The removing of the `FeatureX` can be done similarly.
<br>
<br>
However, if you have no such prior knowledge, removing a feature can take a quite a bit of detective work. This tutorial takes you through that process.
</box>


<!-- * Table of Contents -->
<!-- {:toc} -->

## Safely deleting `FeatureX`

Its important to ensure that no errors are introduced in the process of removing `FeatureX`.

### Refactoring using IDE

Since removing the `FeatureX` class will break the application, we start by identifying `FeatureX`'s usages. This allows us to see code that depends on `FeatureX` to function properly and edit them on a case-by-case basis.

<box type="tip" seamless>

**Tip:** You can use a combination of Markbind's [**Images and Diagrams**](https://markbind.org/userGuide/components/imagesAndDiagrams.html) features such as `puml` and `pic` tags to provide a visual representation of the steps to be taken.
</box>

Remove usages of `FeatureX` by slowly deleting references to it, one by one, in the code.

   <box type="warning" seamless>

   **Warning:** Removing usages may result in errors. Exercise discretion and fix them.
   </box>

After you are done, verify that the application still works by compiling and running it again.

After removing `FeatureX`, we can proceed to formally test our code. If everything went well, you should have most of your tests pass. Fix any remaining errors until the tests all pass.

## Tidying up

At this point, your application is working as intended and all your tests are passing. What’s left to do is to clean up references to `FeatureX` in test data and documentation.

You can go through each individual relevant file and manually remove `FeatureX` references.
