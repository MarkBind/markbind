/* eslint-disable no-undef */

Vue.use(VueStrap);

function setup() {
  const vm = new Vue({
    el: '#app',
  });
  VueStrap.installEvents(vm);
}

function setupWithSearch(siteData) {
  const { searchbar } = VueStrap.components;
  const vm = new Vue({
    el: '#app',
    components: {
      searchbar,
    },
    data() {
      return {
        searchData: siteData.pages,
      };
    },
    methods: {
      searchCallback(match) {
        const page = `${baseUrl}/${match.src.replace('.md', '.html')}`;
        const anchor = match.heading ? `#${match.heading.id}` : '';
        window.location = `${page}${anchor}`;
      },
    },
  });
  VueStrap.installEvents(vm);
}

jQuery.getJSON(`${baseUrl}/siteData.json`)
  .then(siteData => setupWithSearch(siteData))
  .catch(() => setup());
