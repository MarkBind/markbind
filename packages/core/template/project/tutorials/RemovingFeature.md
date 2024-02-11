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
However, if you have no such prior knowledge, removing a feature can take a quite a bit of detective work. This tutorial takes you through that process. **At least have a read even if you don't actually do the steps yourself.**
</box>


<!-- * Table of Contents -->
<!-- {:toc} -->

## Safely deleting `FeatureX`

If you are using IntelliJ IDEA, it provides a refactoring tool that can identify *most* parts of a removal easily. Let’s try to use it as much as we can.

### Assisted refactoring

Since removing the `FeatureX` class will break the application, we start by identifying `FeatureX`'s usages. This allows us to see code that depends on `FeatureX` to function properly and edit them on a case-by-case basis. Right-click the `FeatureX` class and select `Refactor` \> `Safe Delete` through the menu.
* :bulb: To make things simpler, you can unselect the options `Search in comments and strings` and `Search for text occurrences`

<box type="tip" seamless>

**Tip:** You can use a combination of Markbind's [**Images and Diagrams** features](https://markbind.org/userGuide/components/imagesAndDiagrams.html) such as `puml` and `pic` tags to provide a visual representation of the steps to be taken.
</box>

Choose to `View Usages` and you should be presented with a list of `Safe Delete Conflicts`. These conflicts describe locations in which the `FeatureX` class is used.

Remove usages of `FeatureX` by performing `Safe Delete`s on each entry i.e., double-click on the entry (which takes you to the code in concern, right-click on that entity, and choose `Refactor` -> `Safe delete` as before). You will need to exercise discretion when removing usages of `FeatureX`. Functions can be safely removed but its usages must be removed as well.

Let’s try removing references to `FeatureX` in `EditPersonDescriptor`.

1. Safe delete the field `FeatureX` in `FileA`.

1. Select `Yes` when prompted to remove getters and setters.

1. Select `View Usages` again.

1. Remove the usages of `FeatureX` and select `Do refactor` when you are done.

   <box type="warning" seamless>

   **Warning:** Removing usages may result in errors. Exercise discretion and fix them.
   </box>

1. Repeat the steps for the remaining usages of `FeatureX`

After you are done, verify that the application still works by compiling and running it again.

### Manual refactoring

Unfortunately, there are usages of `FeatureX` that IntelliJ IDEA cannot identify. You can find them by searching for instances of the word `FeatureX` in your code (`Edit` \> `Find` \> `Find in path`).

After removing `FeatureX`, we can proceed to formally test our code. If everything went well, you should have most of your tests pass. Fix any remaining errors until the tests all pass.

## Tidying up

At this point, your application is working as intended and all your tests are passing. What’s left to do is to clean up references to `FeatureX` in test data and documentation.

In `src/test/data/`, data meant for testing purposes are stored. While keeping `FeatureX` in the files, while it may not cause the tests to fail, it is not good practice to let cruft from old features accumulate.

You can go through each individual file and manually remove `FeatureX` references.
