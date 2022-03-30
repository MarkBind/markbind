{% set title = "Writing Components" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

This page explains various concerns related to MarkBind components, focused on implementation and testing.
</div>

## Implementing Components

There are multiple ways to implement MarkBind components.

<box type='warning' light>

If an author has a conflicting slot and attribute, MarkBind should **log a warning** to let them know!
</box>

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

Vue components are registered in `vue-components/src/index.js`, which allows them to be used in any Vue instance without needing to be imported first.

<panel header="How do MarkBind attributes/slots get passed to the Vue component?">

##### Attributes

MarkBind attributes are passed to the Vue component as **props**. The type of the prop will be a `String`.

##### Slots

MarkBind slots are passed as **named slots** to the Vue component. The name of the MarkBind slot will be the same as the name of the Vue slot.
Hence, MarkBind slots can be accessed in a Vue component either through the [named slots](https://v2.vuejs.org/v2/guide/components-slots.html#Named-Slots) or through the [`$slots` API](https://v2.vuejs.org/v2/api/#vm-slots).
</panel>

<br>

{{ icon_examples }} 
* As a wrapper for an external library (Modal component)
* To implement a set of customised behaviours (Quiz component)

### As a Plugin

MarkBind components can be implemented as a plugin as well. 
This is suitable for more lightweight components where the implementation is largely in processing the node, making it suitable to use MarkBind Plugins' `processNode` or `postRender` interfaces.

{{ icon_examples }} 
* The `tree` component is implemented as a default plugin

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

Components should be compatible with SSR. 
Minimally, there should be no SSR issues (viewable from the browser console), though a lack of warnings does **not** mean that there are no SSR problems. 
A guide on SSR for MarkBind can be found [here]({{baseUrl}}/devGuide/serverSideRendering.html). 

Vue-component-specific tips for resolving SSR issues:
* The `mount` and `beforeMount` lifecycle hooks will only be executed on the client, not the server
* When using `v-if`, ensure that it will evaluate to the same value on both the client and server 
* Take note of how the Vue component will be compiled, ensure that the HTML is correct and aligns on both client- and server- side
* Conditionally render data when it has been fully loaded

#### Bundle size

When creating a new component, you may need to import a package or library to support some functionality. 
Ideally, this should not increase MarkBind's bundle size too much.

#### Dependencies

When choosing to use an external library, it should ideally be well-maintained and not have too many dependencies, especially high-level dependencies. High-level dependencies may lag behind the most recent releases of other libraries, which may become a blocker for MarkBind to migrate to these recent releases as well.

