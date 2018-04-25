/* eslint-disable no-undef */

Vue.use(VueStrap);

function setup() {
  const vm = new Vue({
    el: '#app',
  });
  VueStrap.installEvents(vm);
}

let baseUrl = '';

// Support gh-pages
if (window.location.origin.endsWith('github.io')) {
  const repository = window.location.pathname.split('/')[1];
  baseUrl = `/${repository}`;
}

function setupWithSearch(siteData) {
  const { typeahead } = VueStrap.components;
  const vm = new Vue({
    el: '#app',
    components: {
      typeahead,
    },
    data() {
      const helpers = {
        value() { return [this.title].concat(this.keywords).join(' '); },
        indexOf(query) { return this.value().indexOf(query); },
        toLowerCase() { return this.value().toLowerCase(); },
      };
      return {
        searchData: siteData.pages.map(page => Object.assign({}, page, helpers)),
        titleTemplate: '{{ item.title }}<br><sub>{{ item.keywords }}</sub>',
      };
    },
    methods: {
      searchCallback(match) {
        window.location = `${baseUrl}/${match.src.replace('.md', '.html')}`;
      },
    },
  });
  VueStrap.installEvents(vm);
}

jQuery.getJSON(`${baseUrl}/siteData.json`)
  .then(siteData => setupWithSearch(siteData))
  .catch(() => setup());
