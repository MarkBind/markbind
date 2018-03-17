/* eslint-disable no-undef */

Vue.use(VueStrap);

function setup() {
  const vm = new Vue({
    el: '#app',
  });
  VueStrap.installEvents(vm);
}

function setupWithSearch(siteData) {
  const routeArray = jQuery.map(siteData.pages, object => object.src);
  const titleArray = jQuery.map(siteData.pages, object => object.title);
  const { typeahead } = VueStrap.components;
  const vm = new Vue({
    el: '#app',
    components: {
      typeahead,
    },
    data() {
      return {
        searchData: titleArray,
      };
    },
    methods: {
      searchCallback(match) {
        const index = titleArray.indexOf(match);
        const route = routeArray[index];
        window.location.pathname = route.replace('.md', '.html');
      },
    },
  });
  VueStrap.installEvents(vm);
}

jQuery.getJSON('../../site.json')
  .then(siteData => setupWithSearch(siteData))
  .catch(() => setup());
