# MarkBind Vue components

This folder contains MarkBind's [Vue.js](https://vuejs.org/) UI components.

Most of the styles are based on Bootstrap's markup and CSS, but no dependency on Bootstrap's JavaScript is required. The only required dependencies are:

* [Vue.js](http://vuejs.org/) (required ^v2.x.x, test with v2.5.16).
* [Bootstrap CSS](http://getbootstrap.com/) (required 4.x.x, test with 4.1.1). MarkBind's Vue components doesn't depend on a very precise version of Bootstrap.
* [jQuery](https://jquery.com/) (tested with v3.5.1) full build.

## Components / directives

Many of the components under this folder were originally from [MarkBind/vue-strap](https://github.com/MarkBind/vue-strap), forked from [yuche/vue-strap](https://github.com/yuche/vue-strap), and modified to suit MarkBind's needs for educational and documentation websites.

The generated bundle also includes some of [BootstrapVue's](https://bootstrap-vue.org/) components.

Some custom components and directives are also added for MarkBind's use.

### MarkBind components newly created or revamped since moving here
- Question.vue
- QOption.vue
- Quiz.vue
- Popover.vue 
- Tooltip.vue 
- Trigger.vue (built on bootstrap-vue's popovers, modals, tooltips)

### MarkBind components ported from [Markbind/vue-strap](https://github.com/MarkBind/vue-strap):

- Pic.vue
- Retriever.vue
- Searchbar.vue
- SearchbarPageItem.vue
- Thumbnail.vue
- TipBox.vue

### Custom directives ported from [Markbind/vue-strap](https://github.com/MarkBind/vue-strap)

- Closeable.js
- Float.js

### VueStrap components modified for use in MarkBind

- Dropdown.vue
- Navbar.vue
- NestedPanel.vue
- MinimalPanel.vue
- Tab.vue
- TabGroup.vue
- Tabset.vue
- Typeahead.vue

### BootstrapVue components included in the bundle

- Modals

## Installation

### Browser globals

The `dist` folder contains `components.min.js` with all components exported in the `window.MarkBindVue` object.

```html
<script src="path/to/vue.js"></script>
<script src="path/to/components.min.js"></script>
<script>
    var vm = new Vue({
        components: {
            alert: MarkBindVue.alert
        },
        el: "#app",
        data: {
            showRight: false,
            showTop: false
        }
    })
</script>
```

## Docs
See the [documentation](https://markbind.org/userGuide/usingComponents.html) with live editable examples.

## Local Setup
* Install with `npm install`.
* Build with `npm run build`.

## Lint the code for any code and style errors using ESLint
* For Unix: `npm run lint`
* For Windows: `npm run lintwin`

## License
Both vue-strap and the modifications made are licensed under [The MIT License](LICENSE).
