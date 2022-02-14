// eslint-disable-next-line import/no-extraneous-dependencies
import MarkBindVue from '@markbind/vue-components/src';

/*
  VueCommonAppFactory provides common data to both the Vue App on server-side and client-side.
  This is to ensure that our Vue App is a universal application.
*/

const appFactory = () => ({
  /*
   * On the server-side, Vue will log warnings for any undefined variables and methods during SSR.
   * Thus, we have to pass these data and method variables into the Vue App instantiation before
   * server-side rendering is carried out, to prevent such warnings from being logged into console.
   */
  data() {
    return {
      searchData: [],
    };
  },
  methods: {
    searchCallback(match) {
      const page = `${baseUrl}/${match.src.replace(/.(md)$/, '.html')}`;
      const anchor = match.heading ? `#${match.heading.id}` : '';
      window.location = `${page}${anchor}`;
    },
  },
});

export default {
  MarkBindVue,
  appFactory,
};
