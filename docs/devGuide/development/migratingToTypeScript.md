{% set title = "Migrating to TypeScript" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

In order to improve the quality and security of our backend code, we are introducing TypeScript to our codebase to leverage the type-checking system. This page outlines the steps of migrating existing files into TypeScript.
</div>

## Migration Steps

The TypeScript migration process is a little different than normal development work, as maintainers would not follow the normal procedure of creating a squash commit. Instead, they will do a **normal merge commit**, and therefore migration developers will need to structure the commits in a particular way.

We have decided on structuring the commits as two commits: a "Rename" commit and an "Adapt" commit. If you need further context on the approach, feel free to read the [Explanation Notes](#explanation-notes) section below.

### Step 1: Preparation

1. **If running, stop automatic compilation on change/save**. More on this at [Editing backend features](workflow.md#editing-backend-features) section in the Workflow page.

2. **Install typings of external dependencies** relevant to the files, if there's any that hasn't been installed yet.

   Generally, external modules have their typings published as another module named `@types/<lib-name>` (e.g. `@types/jest`) or bundled alongside their implementation. You can check which is the case [here](https://www.typescriptlang.org/dt/search?search=). Check for `@types/<lib-name>` first, then check for `<lib-name>` itself if not found.

   If the dependency has its typings:

   - Bundled alongside their implementation, you don't need to do anything else.

   - In a `@types/<lib-name>` module, install it as a development dependency for the `core` package by navigating to `packages/core` and running `npm i -D @types/<lib-name>`.

     After installing all necessary typings, delete the generated `packages/core/package-lock.json`, navigate back to the root directory, and run `npm run setup`.

     <box type="info">

     It's recommended to try to match the `@types/<lib-name>` version with the associated module. In general, try to match the major and minor version as closely as possible.
     </box>

3. **Stash the changes** (`packages/core/package.json` and root `package-lock.json`).
   <br>
   This will be added back during the "Adapt" commit later.

### Step 2: "Rename" Commit

1. **Add the paths of the `.js` files to `.gitignore` and `.eslintignore`**.
   <br>
   This instructs Git and ESLint to ignore the compiled JavaScript from the files that are going to be renamed.

2. **Rename the files** from having `.js` extensions to `.ts` extensions.

3. **Stage the changes** (the renamed files, `.gitignore`, and `.eslintignore`) for commit.
   <br>
   Ensure the renamed files are regarded by Git as `renamed` and not `added`.

4. **Commit the staged changes** with the message `Rename <file-or-folder> to TypeScript`.
   <br>
   For example: `Rename core/src/html to TypeScript`.

### Step 3: "Adapt" Commit

1. **Start automatic compilation on change/save**. More on this at [Editing backend features](workflow.md#editing-backend-features) section in the Workflow page.

2. **Change the CommonJS module import/export syntax** to TypeScript's equivalent syntax (use ES6 syntax only if possible).

   A common error in newly renamed files comes from the way modules are imported/exported. Those statements can be converted according to the [Import/Export Syntax Reference](#importexport-syntax-reference) section below. The steps are as follows:

   1. Start by changing the import/export statements into TypeScript equivalent syntax. Be careful with imports as you have to match them with the export syntax that the modules use, be it TypeScript equivalent or ES6.

   2. Check whether it is possible to change the export to use ES6 syntax. As mentioned in the syntax reference, ES6 should not be used if the module only exports a single thing. Change to ES6 syntax only if possible, otherwise keep with TypeScript equivalent syntax.

   3. You might have to **adjust how the files are imported by other TypeScript (`.ts`) files**. If you are changing the export to the TypeScript equivalent syntax, then it must be imported the same way as well. The same goes for the ES6 syntax.

3. **Adapt the files** fully to TypeScript.

   The errors from TypeScript and `typescript-eslint` can guide you on what to fix. Only fix what is necessary and be careful with accidentally modifying any code functionality. Avoid using `any` as best as you can.

   If you happen to encounter type errors related to using names (of constant, properties, members, etc.) from another MarkBind import that is still in JavaScript (`.js`), you can try to infer simple types in your file first as a "stand-in" of the more robust types when that internal dependency is eventually migrated.

   On the flip side of the above situation, once you have developed a robust type for your own file, **adjust how other TypeScript (`.ts`) files type names referenced from your files** as applicable. Some type declarations might need to be made stricter, or can be removed if it's not necessary anymore, and so on. This will ensure that the files will be incrementally stricter.

4. **Make sure everything is in order** by running `npm run test` in the root directory.

   The `core` package tests can directly run on the `.ts` files (powered by `ts-jest`), and the `cli` package tests uses the compiled files from `core`. Therefore, passing the `cli` tests means that it is very likely the compiled files work as expected.

5. **Stage the adapted files and the typings from Step 1** for commit. Verify the changes before committing.

6. **Commit the changes** with the message `Adapt <file-or-folder> to TypeScript`.
   <br>
   For example, `Adapt core/src/html to TypeScript`.

You are now ready to create a pull request for the changes to the repository.

## Example of Migrated Works

You can see these pull requests to observe the finished migration works:

- [#1877: Adopt TypeScript for core package](https://github.com/MarkBind/markbind/pull/1877)

## Import/Export Syntax Reference

Here is the reference on changing the import/export statements from CommonJS syntax into those that TypeScript support: TypeScript equivalent syntax, and ES6 syntax.

The TypeScript equivalent syntax is designed to compile to the exact same code as CommonJS. You can read more about this syntax in the [official documentation](https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require).

The ES6 syntax is the newer JavaScript syntax that TypeScript recommends, but in certain cases it does not compile to the exact same code as CommonJS. We simplify the concepts here for illustration, refer to the StackOverflow post [here](https://stackoverflow.com/questions/40294870/module-exports-vs-export-default-in-node-js-and-es6) for more details.

In the tables below, a "thing" is defined as a JavaScript construct that can be exported, such as constants, functions, classes, etc. In ES6 syntax, a "thing" can also be TypeScript constructs like types, interfaces, enums, etc.

!!**Exports**!!

| What to Export            | CommonJS                       | TypeScript equivalent  | ES6                            |
|---------------------------|--------------------------------|------------------------|--------------------------------|
| One thing only            | `module.exports = x`           | `export = x`           | `export default x` **&nbsp;^** |
| Object of one/more things | `module.exports = { x, y, z }` | `export = { x, y, z }` | `export { x, y, z }`           |

**^**: For compatibility, **do not use** `export default` during migration. It is compiled differently and does not play well with dependants that are still in `.js`, unless some clunky modifications are made in the `.js` files (refer to the StackOverflow post previously [linked](https://stackoverflow.com/questions/40294870/module-exports-vs-export-default-in-node-js-and-es6)).

!!**Imports from a module that exports one thing only**!!

| What to Import | CommonJS               | TypeScript equivalent               | ES6                           |
|----------------|------------------------|-------------------------------------|-------------------------------|
| Exported thing | `const x = require(a)` | `import x = require(a)` **&nbsp;^** | `import x from a` **&nbsp;^** |

**^**: You can only use TypeScript equivalent syntax when the exported module is also in the TypeScript equivalent syntax. The same goes for the ES6 syntax.

!!**Imports from a module that exports an object of one/more things**!!

| What to Import  | CommonJS                   | TypeScript equivalent   | ES6                    |
|-----------------|----------------------------|-------------------------|------------------------|
| Entire object   | `const w = require(a)`     | `import w = require(a)` | `import * as w from a` |
| Selected things | `const { x } = require(a)` | N/A  **&nbsp;^**        | `import { x } from a`  |

**^**: While not equivalent on the compile-level, this can be achieved by importing the entire object then destructuring the object.

## Explanation Notes

### Why do we need to separate "Rename" and "Adapt" commits

We want to keep the file history intact throughout this migration, meaning that we should still be able to see the change history of the `.ts` files even from the time when they were still in `.js`.

When we rename files, we have to keep the Git similarity index between the old file and the new file above a certain threshold (50%) to keep the history, or else it will be regarded as a different file with its own history.

Combining the two steps into one - that is, adapting files immediately after renaming - will lower the similarity index, therefore making it possible for the files, especially small ones or those that need a lot of changes when adapting, to hit below the similarity threshold and lose their history.

The solution to this is to make the rename and adapt commits separate, in order for Git to recognize first that the file has changed into `.ts`, and so the changes are compared not against the old `.js` file, but to the renamed `.ts` file instead.

### Why do we need a normal merge commit

Even if the migration developer has kept the history intact through the separate "Rename" and "Adapt" commits, this is only intact at their working branch. At the end of the day, the totality of the changes in the working branch is compared against the target branch, in which the same consideration would apply.

If we do the usual squash commit, the changes from the two commits are combined into a new commit and only that commit will be pushed into the target branch. The original two commits are omitted, therefore the history of the working branch that we have tried to keep intact is stripped away.

The normal merge commit also creates another commit (the merge commit), but the merge process interleaves the commits from the working branch to the target branch, therefore retaining the change history.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('writingPlugins', '../design/projectStructure') }}