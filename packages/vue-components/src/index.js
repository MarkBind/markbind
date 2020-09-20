// Components and directives from bootstrap-vue
/* eslint-disable import/no-extraneous-dependencies */
import {
  ModalPlugin,
  PopoverPlugin,
  TooltipPlugin,
} from 'bootstrap-vue';
/* eslint-enable import/no-extraneous-dependencies */

// Custom / modified components and components from yuche/vue-strap
import closeable from './directives/Closeable';
import dropdown from './Dropdown.vue';
import navbar from './Navbar.vue';
import panel from './Panel.vue';
import pic from './Pic.vue';
import quiz from './questions/Quiz.vue';
import question from './questions/Question.vue';
import qOption from './questions/QOption.vue';
import retriever from './Retriever.vue';
import searchbar from './Searchbar.vue';
import tab from './Tab.vue';
import tabGroup from './TabGroup.vue';
import tabset from './Tabset.vue';
import thumbnail from './Thumbnail.vue';
import tipBox from './TipBox.vue';
import trigger from './Trigger.vue';

const components = {
  box: tipBox,
  dropdown,
  navbar,
  panel,
  pic,
  quiz,
  question,
  qOption,
  retriever,
  searchbar,
  tab,
  tabGroup,
  tabs: tabset,
  thumbnail,
  tipBox,
  trigger,
};

const directives = {
  closeable,
};

function install(Vue) {
  Object.keys(directives).forEach((key) => {
    Vue.directive(key, directives[key]);
  });
  Object.keys(components).forEach((key) => {
    Vue.component(key, components[key]);
  });
  Vue.use(ModalPlugin);
  Vue.use(PopoverPlugin);
  Vue.use(TooltipPlugin);
}

const MarkBindVue = { install };

export default MarkBindVue;
