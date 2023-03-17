// eslint-disable-next-line import/no-extraneous-dependencies
import MarkBindVue from '@markbind/vue-components/src';
import { Vue } from '../asset/js/vue.min';
/*
  VueCommonAppFactory provides common data to both the Vue App on server-side and client-side.
  This is to ensure that our Vue App is a universal application.
*/

const appFactory = () => {
  const searchData = Vue.reactive({
    searchData: [],
  });

  const searchCallback = (match) => {
    const page = `${baseUrl}/${match.src.replace(/.md$/, '.html')}`;
    const anchor = match.heading ? `#${match.heading.id}` : '';
    window.location = `${page}${anchor}`;
  };

  return {
    searchData,
    searchCallback,
  };
};

export default {
  MarkBindVue,
  appFactory,
};
