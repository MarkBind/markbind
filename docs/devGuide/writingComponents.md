{% set title = "Writing Components" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

This page explains how MarkBind components work, focused on implementation and testing.
</div>

MarkBind provides a number of components (e.g. expandable panels, tooltips) to dynamically express content. 
In order to serve content on the browser, MarkBind syntax is converted to valid HTML.

<panel header="How are components in MarkBind syntax parsed and converted to HTML?">

The main logic of the node processing flow can be found in [`packages/core/src/html/NodeProcessor.js`](https://github.com/MarkBind/markbind/blob/master/packages/core/src/html/NodeProcessor.js).

A MarkBind source file is first parsed into a series of 
<popover header=":bulb: What is a _**node**_?" content="A HTML file can be represented as a tree structure called the [DOM](https://www.w3schools.com/js/js_htmldom.asp), comprising HTML elements (or _nodes_).">nodes</popover>.
In general, each component will be parsed as a node, which may contain other child nodes (components or otherwise).

Each node is then processed to implement MarkBind functionalities, such as checking for invalid intrasite links and rendering markdown.
Components may undergo further processing (in `processNode`) and/or post-processing (in `postProcessNode`) to further transform the node to the desired HTML.
MarkBind identifies each component by the node's _name_ (e.g. `panel`, `question`). 

`cheerio` is then used to convert all nodes back into HTML, and this HTML is served to the browser as a MarkBind page.
</panel>

<br>
<br>

## Implementing Components

There are multiple ways to implement MarkBind components.

### Transforming the Node Directly

One way to implement a MarkBind component is to transform the node itself.
This is a more low-level implementation that can be useful when a node only needs to be modified slightly.

When a node is processed, MarkBind syntax is converted to HTML, and any remaining attributes will also be converted to HTML attributes. 
This can be useful if you just need to add a HTML attribute to the node, or modify the value of an existing attribute.

These transformations may take place at various stages of node processing: before (`preProcessNode`), during (`processNode`), or after (`postProcessNode`).

{{ icon_examples }} 
* Adding a class to a node (setting line numbers for code blocks)
* Modifying attributes and adding a directive to a node ([former implementation](https://github.com/MarkBind/markbind/blob/502df135e07baebd9d4eea8ccc0654c990047792/packages/core/src/html/bootstrapVueProcessor.js#L73) of popovers)

</box>

### Vue Components

Many MarkBind components are implemented as Vue components, either by creating a component in the `vue-components` package, or by importing a component from an external library.
This can be useful when a more complicated set of features is needed, where a Vue component can provide an interface for us to manage these functionalities.

Vue components are registered in `vue-components/src/index.js`, which allows them to be used in the template section of any Vue instance without needing to be imported first.

<panel header="How do MarkBind attributes/slots get passed to the Vue component?">

##### <trigger for="pop:markbind-attributes">Attributes</trigger>

MarkBind attributes are passed to the Vue component as **props**. The type of the prop will be a `String`.

##### <trigger for="pop:markbind-slots">Slots</trigger>

MarkBind slots are passed as **named slots** to the Vue component. The name of the MarkBind slot will be the same as the name of the Vue slot.
Hence, MarkBind slots can be accessed in a Vue component either through the [named slots](https://v2.vuejs.org/v2/guide/components-slots.html#Named-Slots) or through the [`$slots` API](https://v2.vuejs.org/v2/api/#vm-slots).
</panel>

<br>

{{ icon_examples }} 
* As a wrapper for an external library ([Modal component](https://github.com/MarkBind/markbind/blob/master/packages/vue-components/src/Modal.vue))
* To implement a set of customised behaviours ([Quiz component](https://github.com/MarkBind/markbind/blob/master/packages/vue-components/src/questions/Quiz.vue))

### As a Plugin

MarkBind components can be implemented as a plugin as well. 
This is suitable for more lightweight components where the implementation is largely in processing the node, making it fitting to use MarkBind plugins' `processNode` or `postRender` interfaces. 
These interfaces provide additional entry points for modifying the page generated, and do not replace MarkBind's usual node processing.

The [Writing Plugins]({{baseUrl}}/devGuide/writingPlugins.html) page is a good guide to get started on plugins.

{{ icon_examples }} 
* The [`tree` component](https://github.com/MarkBind/markbind/blob/master/packages/core/src/plugins/default/markbind-plugin-tree.js) is implemented as a default plugin

## Testing Components

Automated tests that are relevant to the components include:

* [Functional tests]({{baseUrl}}/devGuide/workflow.html#adding-test-site-content)
* [Snapshot tests]({{baseUrl}}/devGuide/workflow.html#adding-snapshot-tests-for-components)

The API for Snapshot tests can be found at [Vue Test Utils](https://v1.test-utils.vuejs.org/).

Additionally, it's a good idea to check the deployed PR preview in addition to serving the app locally, to ensure that there are no differences.

## Additional Considerations

Some things you may need to consider when implementing a MarkBind component:

#### Reactivity

_Reactivity_ refers to the ability of a web framework to update your view whenever the application state has changed. 
It is important to consider reactivity when implementing a component that may have dynamic contents that readers can interact with (e.g. opening a panel, triggering a tooltip to show).

#### SSR

Components should be compatible with SSR (Server-Side Rendering). 
Minimally, there should be no SSR issues (viewable from the browser console), though a lack of warnings does **not** mean that there are no SSR problems. 
A guide on SSR for MarkBind can be found [here]({{baseUrl}}/devGuide/design/serverSideRendering.html). 

Vue-specific tips for resolving SSR issues:
* The `mount` and `beforeMount` lifecycle hooks will only be executed on the client, not the server
* When using `v-if`, ensure that it will evaluate to the same value on both the client and server 
* Take note of how the Vue component will be compiled, ensuring that the HTML is correct and aligns on both client- and server- side
* Conditionally render data when it has been fully loaded

#### Bundle size

When creating a new component, you may need to import a package or library to support some functionality. 
Ideally, this should not increase MarkBind's bundle size too much.
[Bundlephobia](https://bundlephobia.com/) may be useful to quickly look up the size of a package!

#### Dependencies

When choosing to use a third-party library or package, it should ideally be well-maintained and not have too many dependencies.
While dependencies may be inevitable, a package with dependencies on large libraries may lag behind the most recent releases of these libraries, which may become a blocker for MarkBind to migrate to these recent releases as well.

For instance, if `bootstrap-vue` depends on Bootstrap and Vue, we will need to wait for `bootstrap-vue` to migrate to the newest versions of both Bootstrap and Vue before MarkBind can migrate to these versions of Bootstrap and Vue as well.

<box type="tip" seamless>

Feel free to raise any concerns during the initial discussion phase for other devs to weigh in on the tradeoffs!
</box>

#### Attributes and Slots

MarkBind components may support <popover id="pop:markbind-attributes" header="`header` is an **attribute** here:" content="`<panel header='Hello'></panel>`">attributes</popover>, <popover id="pop:markbind-slots" header="`header` is a **slot** here:" content="`<div slot='header'>Hello</div>`">slots</popover> or both. 
Some components allow users to supply the same content as either a slot or an attribute.
If an author provides the same content as both a slot and an attribute, in most cases, the slot should override the attribute. 

<box type='warning' seamless>

MarkBind should also **log a warning** to inform the author of this conflict!
</box>

