const Vue = require('vue');
const cloneDeep = require('lodash/cloneDeep');
const isObject = require('lodash/isObject');

/*
 * @vue/test-utils v1.1.4 source
 * The following files are adapted to fit MarkBind's needs:
 * 1. https://github.com/vuejs/vue-test-utils/blob/dev/packages/shared/create-local-vue.js
 * 2. https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/create-local-vue.js
 *
 * We need the createLocalVue method from @vue/test-utils to give us a fresh instance of Vue for
 * SSR development workflow -- so that when MarkBind Vue source file changes, we are able to install the
 * plugin on a fresh copy of Vue, thus preventing global pollution of Vue.
 *
 * The fresh copy of Vue, which is installed with the new bundle plugin (our Vue source files are watched
 * by Webpack during development workflow and it will provide us the new bundle plugin upon and source file
 * changes), will be used to render built pages into HTML strings (SSR).
 */

/**
 * Used internally by vue-server-test-utils and test-utils to propagate/create vue instances.
 * This method is wrapped by createLocalVue in test-utils to provide a different public API signature
 * @param {Component} _Vue
 * @param {VueConfig} config
 * @returns {Component}
 */
function _createLocalVue(_Vue = Vue, config = {}) {
  const instance = _Vue.extend();

  // clone global APIs
  Object.keys(_Vue).forEach((key) => {
    /* eslint-disable-next-line no-prototype-builtins */
    if (!instance.hasOwnProperty(key)) {
      const original = _Vue[key];
      // cloneDeep can fail when cloning Vue instances
      // cloneDeep checks that the instance has a Symbol
      // which errors in Vue < 2.17 (https://github.com/vuejs/vue/pull/7878)
      try {
        instance[key] = isObject(original) ? cloneDeep(original) : original;
      } catch (e) {
        instance[key] = original;
      }
    }
  });

  // config is not enumerable
  instance.config = cloneDeep(Vue.config);

  // if a user defined errorHandler is defined by a localVue instance via createLocalVue, register it
  instance.config.errorHandler = config.errorHandler;

  // option merge strategies need to be exposed by reference
  // so that merge strats registered by plugins can work properly
  instance.config.optionMergeStrategies = Vue.config.optionMergeStrategies;

  // make sure all extends are based on this instance.
  // this is important so that global components registered by plugins,
  // e.g. router-link are created using the correct base constructor
  instance.options._base = instance;

  // compat for vue-router < 2.7.1 where it does not allow multiple installs
  if (instance._installedPlugins && instance._installedPlugins.length) {
    instance._installedPlugins.length = 0;
  }
  const { use } = instance;
  instance.use = (plugin, ...rest) => {
    if (plugin.installed === true) {
      plugin.installed = false;
    }
    if (plugin.install && plugin.install.installed === true) {
      plugin.install.installed = false;
    }
    use.call(instance, plugin, ...rest);
  };
  return instance;
}

/**
 * Returns a local vue instance to add components, mixins and install plugins
 * without polluting the global Vue class.
 * @param {VueConfig} config
 * @returns {Component}
 */
function createLocalVue(config = {}) {
  return _createLocalVue(undefined, config);
}

module.exports = createLocalVue;
