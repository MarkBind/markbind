# vue-strap
*This is a forked project from VueStrap, modified for use in MarkBind.*

Bootstrap components built with Vue.js.

This repository contains a set of native Vue.js components based on Bootstrap's markup and CSS. As a result no dependency on jQuery or Bootstrap's JavaScript is required. The only required dependencies are:

* [Vue.js](http://vuejs.org/) (required ^v2.x.x, test with v2.5.16).
* [Bootstrap CSS](http://getbootstrap.com/) (required 4.x.x, test with 4.1.1). VueStrap doesn't depend on a very precise version of Bootstrap.

## Installation

### Browser globals
The `dist` folder contains `vue-strap.js` and `vue-strap.min.js` with all components exported in the <code>window.VueStrap</code> object.

```html
<script src="path/to/vue.js"></script>
<script src="path/to/vue-strap.js"></script>
<script>
    var vm = new Vue({
        components: {
            alert: VueStrap.alert
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
See the [documentation](https://markbind.github.io/vue-strap/) with live editable examples.

## Local Setup
* Install with `npm install`.
* Build with `npm run build`.

## Lint the code for any code and style errors using ESLint
* For Unix: `npm run lint`
* For Windows: `npm run lintwin`

## License
vue-strap is licensed under [The MIT License](LICENSE).
