/* eslint-disable no-undef */

Vue.use(VueStrap);

function setup() {
  const vm = new Vue({
    el: '#app',
  });
  VueStrap.installEvents(vm);
}

function setupWithSearch(siteData) {
  const { frontmattersearch } = VueStrap.components;
  const vm = new Vue({
    el: '#app',
    components: {
      frontmattersearch,
    },
    data() {
      return {
        searchData: siteData.pages,
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
