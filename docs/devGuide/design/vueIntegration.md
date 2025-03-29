{% set title = "Vue Integration" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead mb-2">
This page provides an overview of how Vue is integrated into MarkBind's architecture, including its usage in Server-side Rendering (SSR), setup, Client-side Hydration, and the abstraction layers involved in rendering content.
</div>

## Overview

Vue is the frontend framework used to power MarkBind’s dynamic UI components and client-side interactivity. Vue components are rendered both on the server and browser depending on the context:

* **Server-side Rendering (SSR)**: Used for better performance, SEO, and to reduce Flash-of-Unstyled-Content (FOUC).
* **Client-side Hydration**: After the server-rendered HTML is delivered to the browser, the Vue app takes over to hydrate the static HTML. This process involves attaching event listeners and enabling interactivity, ensuring the page becomes fully interactive.
* **Client-side Rendering (CSR)**: Used to load additional content dynamically, enabling interactivity after the page loads. For example, components like `<panel>` with `preload='false'` are dynamically loaded via CSR.

<box type="info">

For more details on how MarkBind uses Vue for server-side rendering and hydration (and the common caveats developers should be aware of, including hydration issues), refer to the [Server Side Rendering](serverSideRendering.md) page.
</box>

## Custom Vue Components

MarkBind uses a library of custom Vue components, which are a mix of Bootstrap-based components and those tailored for educational websites. These components are designed to meet the specific needs of MarkBind's use cases. For a list of some components and directives added for MarkBind's use, refer to the [UI components library](projectStructure.md#ui-components-library).

Vue components are particularly useful for implementing complex features and interactivity that go beyond what static HTML and Markdown can provide. For details implementing a MarkBind component as a Vue component, refer [here](../development/writingComponents.md#vue-components).

### What Vue is Used For

Vue components in MarkBind are used for:

* **Encapsulating Complex Behavior**: Vue components allow for reusable, self-contained logic and interactivity.

* **Dynamic Content Loading**: Components like `<panel>` with `preload='false'` use Vue to dynamically load content after the page is rendered.

* **Interactive Features**: Components like modals, quizzes, and tooltips rely on Vue for their interactive behavior.

* **Integration with External Libraries**: Vue components can wrap external libraries (e.g., Vue Final Modal for modals) to provide a seamless user experience.

## Custom Vue Directives

In addition to custom Vue components, MarkBind also makes use of custom Vue directives to provide enhanced interactivity and DOM manipulation behaviors. These directives encapsulate logic that operates directly on the DOM elements, complementing the declarative nature of Vue templates.

* For example, the `v-closeable` directive, used here to <a tags="environment--combined" href="/userGuide/reusingContents.html#allowing-users-to-remove-some-contents">remove content</a><a tags="environment--dg" href="https://markbind.org/userGuide/reusingContents.html#allowing-users-to-remove-some-contents">remove content</a>, provides functionality to toggle the visibility of content sections. It dynamically wraps the directive’s target content in a container, adds a close button and show label, and sets up the necessary event handlers.

## Markbind's Server-Side Rendering (SSR) using Vue

MarkBind leverages [Server-side Rendering (SSR)](https://vuejs.org/guide/scaling-up/ssr.html#server-side-rendering-ssr) to pre-render Vue components into static HTML during the build process. This pre-rendered HTML is served to the client, reducing the time required for the page to become interactive. It also ensures that the content is visible immediately, even before JavaScript is executed, eliminating the Flash-of-Unstyled-Content (FOUC).

### SSR Workflow Overview

MarkBind uses Server-side Rendering (SSR) to pre-render page content into static HTML during the build process. Here is an overview of the workflow during the build process:

1. **Server-side Compilation of Render Function**: MarkBind takes the final HTML page content (product of [Content Processing Flow](architecture.md#content-processing-flow)) and compiles it into a render function using the `compileTemplate` function from [`vue/compiler-sfc`](https://www.npmjs.com/package/@vue/compiler-sfc). This render function is saved as a JavaScript file  (e.g., `<page-name>.page-vue-render.js`) in the same directory as the HTML file. This script file is served alongside the static HTML and injected into the final page template, for the purpose of hydration. It is also directly used in SSR to generate the static HTML.


1. **Server-side Render of HTML**: On the server, MarkBind initializes a separate Vue instance solely for SSR. It registers the custom Vue components and directives bundled by core-web onto this Vue instance. The Vue instance uses the render function previously compiled to generate static HTML via the `renderToString` function from [`vue/server-renderer`](https://www.npmjs.com/package/@vue/server-renderer).


1. **Client-side Hydration**: On the client side (e.g., a web browser), the HTML is served with the injected render function. The Vue app is initialized using `createSSRApp` in index.js. Thereafter, the Vue instance takes over and hydrates the static HTML. For more details on hydration and potential hydration issues, refer to [Client-side Hydration](serverSideRendering.md#client-side-hydration). 



## Dynamic Content Loading (Client-Side Rendering)

In specific cases, MarkBind uses **Client-side Rendering (CSR)** exclusively to dynamically load content. A key example is the `<panel>` component. When the `src` attribute is set to a remote page to be loaded as the content, the `preload` attribute is `false` by default. As the content is not preloaded and loaded dynamically after the page is rendered, it wil conduct CSR, where:
* **Generated Separately**: Content is generated outside the main content flow.
* **Mounted as CSR-Only Vue Apps**: Content is mounted as a separate Vue app after being loaded into the browser.

## Detailed Vue App Setup and Execution Flow

<box type="tip" seamless>

This section provides a deeper look into how MarkBind sets up and initializes the Vue application on the client side. It is intended for developers who are interested in understanding the underlying execution flow in more detail.
</box>

The core Vue app is initialized in `core-web/src/index.js`, which serves as the entry point for the client-side Vue application. This file is part of the `packages/core-web/` library — a client-side bundle generated by MarkBind. It contains initialization scripts, the bundled UI components library, and shared logic used across all rendered sites. This bundle is included in the final site HTML and executed in the web browser when a user visits a generated MarkBind site.

### **Initialization Flow**
1. **Loading the Core-Web Bundle**:
* The SSR-generated HTML includes a `<script>` tag that loads the `core-web` bundle.
* When this script runs in the browser, it imports and executes `core-web/src/index.js`.

2. **Setting Up the Vue App**:
* The entry file (`index.js`) defines the `setup()` function, which is exported and later called in the HTML template (`page.njk`).
* Inside `setup()`, the Vue app is initialized using `createSSRApp()`, where the `render` function was previously attached as a global variable, generated during SSR and served in `<page-name>.page-vue-render.js`. (injected via SSR in `PageVueServerRenderer.ts`).

3. **Registering the custom MarkBind Vue Plugin**:
* The global MarkBind plugin is registered, which sets up **Global Vue components** (e.g., `<modal>`, `<tooltip>`),  **Custom directives** (e.g., `v-tooltip`, `v-closeable` and **Global configuration** (e.g., `$vfm` for modals).

4. **Mounting the Vue App**:
* The Vue app is mounted onto the pre-rendered SSR DOM element (typically `#app`) using `app.mount('#app')`.
* This step hydrates the server-rendered HTML into an interactive client-side app.

5. **Running Client-Only Setup Routines**:
* After the app is mounted, the mounted() lifecycle hook executes client-only setup routines, such as:
  * **Header style detection**: Detects and applies styles for sticky headers.
  * **Scrolling to anchor headings**: Ensures the page scrolls to the correct section based on the URL hash.
  * **Restoring bypassed `<style>` tags**: Replaces placeholder `<script>` tags with their original `<style>` tags.
  * **Dynamic search setup**: Fetches and initializes search data from `siteData.json`.

This architecture allows MarkBind to combine fast server-side initial rendering with interactive client-side behavior, ensuring a seamless and performant experience.
