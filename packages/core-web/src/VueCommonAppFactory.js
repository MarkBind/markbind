// eslint-disable-next-line import/no-extraneous-dependencies
import MarkBindVue from '@markbind/vue-components/src';

/*
  VueCommonAppFactory provides common data to both the Vue App on server-side and client-side.
  This is to ensure that our Vue App is a universal application.
*/

/*
 These getters are used by popovers and tooltips to get their popover/tooltip content/title.

 For triggers, refer to Trigger.vue.
 We need to create a completely new popover/tooltip for each trigger due to bootstrap-vue's implementation,
 so this is how we retrieve our contents.
*/
function makeMbSlotGetter(slotName) {
  return (element) => {
    const innerElement = element.querySelector(`[data-mb-slot-name="${slotName}"]`);
    return innerElement === null ? '' : innerElement.innerHTML;
  };
}

// Used via vb-popover.html="popoverInnerGetters" for popovers
const popoverInnerGetters = {
  title: makeMbSlotGetter('header'),
  content: makeMbSlotGetter('content'),
};

// Used via vb-tooltip.html="popoverInnerGenerator" for tooltips
const tooltipInnerContentGetter = makeMbSlotGetter('_content');

const appFactory = () => ({
  /*
   * On the server-side, Vue will log warnings for any undefined variables and methods during SSR.
   * Thus, we have to pass these data and method variables into the Vue App instantiation before
   * server-side rendering is carried out, to prevent such warnings from being logged into console.
   */
  data() {
    return {
      searchData: [],
      popoverInnerGetters,
      tooltipInnerContentGetter,
    };
  },
  methods: {
    searchCallback(match) {
      const page = `${baseUrl}/${match.src.replace(/.(md|mbd)$/, '.html')}`;
      const anchor = match.heading ? `#${match.heading.id}` : '';
      window.location = `${page}${anchor}`;
    },
  },
});

export default {
  MarkBindVue,
  appFactory,
};
