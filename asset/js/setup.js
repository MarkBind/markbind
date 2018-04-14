/* eslint-disable no-undef */

Vue.use(VueStrap);

function setup() {
  const vm = new Vue({
    el: '#app',
  });
  VueStrap.installEvents(vm);
}

function setupWithSearch(siteData) {
  const { typeahead } = VueStrap.components;
  const vm = new Vue({
    el: '#app',
    components: {
      typeahead,
    },
    data() {
      const utilMethods = {
        value() { return [this.title].concat(this.keywords).join(' '); },
        indexOf(query) { return this.value().indexOf(query); },
        toLowerCase() { return this.value().toLowerCase(); },
      };
      return {
        searchData: siteData.pages.map(currentPage => Object.assign({}, currentPage, utilMethods)),
        titleTemplate: '{{ item.title }}<br><sub>{{ item.keywords }}</sub>',
      };
    },
    methods: {
      searchCallback(match) {
        window.location.pathname = match.src.replace('.md', '.html');
      },
    },
  });
  VueStrap.installEvents(vm);
}

jQuery.getJSON(`${window.location.origin}/siteData.json`)
  .then(siteData => setupWithSearch(siteData))
  .catch(() => setup());
