/* eslint-disable import/no-extraneous-dependencies */
import { Dropdown, Tooltip } from 'floating-vue';
import { vfmPlugin } from 'vue-final-modal';
import PortalVue from 'portal-vue';
import 'floating-vue/dist/style.css';

// Custom / modified components and components from yuche/vue-strap
import box from './Box.vue';
import breadcrumb from './Breadcrumb.vue';
import closeable from './directives/Closeable';
import dropdown from './Dropdown.vue';
import navbar from './Navbar.vue';
import panel from './Panel.vue';
import annotate from './annotations/Annotate.vue';
import aPoint from './annotations/AnnotatePoint.vue';
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
import trigger from './Trigger.vue';
import siteNav from './SiteNav.vue';
import submenu from './Submenu.vue';
import siteNavButton from './SiteNavButton.vue';
import pageNavButton from './PageNavButton.vue';
import overlay from './Overlay.vue';
import overlaySource from './OverlaySource.vue';
import popover from './Popover.vue';
import tooltip from './Tooltip.vue';
import modal from './Modal.vue';
import scrollTopButton from './ScrollTopButton.vue';
import cardstack from './cardstack/CardStack.vue';
import card from './cardstack/Card.vue';

const components = {
  box,
  breadcrumb,
  cardstack,
  card,
  dropdown,
  navbar,
  panel,
  annotate,
  aPoint,
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
  trigger,
  siteNav,
  submenu,
  siteNavButton,
  pageNavButton,
  overlay,
  overlaySource,
  popover,
  tooltip,
  modal,
  'VPopover': Dropdown,
  'VTooltip': Tooltip,
  scrollTopButton,
};

const directives = {
  closeable,
};

// eslint-disable-next-line no-unused-vars
function install(app, options) {
  Object.keys(components).forEach((key) => {
    app.component(key, components[key]);
  });
  Object.keys(directives).forEach((key) => {
    app.directive(key, directives[key]);
  });
  app.use(vfmPlugin);
  app.use(PortalVue);
}

const plugin = { install };

export default {
  plugin,
};
