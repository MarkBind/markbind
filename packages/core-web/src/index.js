// eslint-disable-next-line import/no-extraneous-dependencies
import MarkBindVue from '@markbind/vue-components/src';
import './styles/index.css';

/* global Vue, window, document, jQuery, baseUrl */

Vue.use(MarkBindVue);

function scrollToUrlAnchorHeading() {
  if (window.location.hash) {
    // remove leading hash to get element ID
    const headingElement = document.getElementById(window.location.hash.slice(1));
    if (headingElement) {
      headingElement.scrollIntoView();
      window.scrollBy(0, -document.body.style.paddingTop.replace('px', ''));
    }
  }
}

function insertCss(cssCode) {
  const newNode = document.createElement('style');
  newNode.innerHTML = cssCode;
  document.getElementsByTagName('head')[0].appendChild(newNode);
}

function setupAnchorsForFixedNavbar() {
  const headerSelector = jQuery('header[fixed]');
  const isFixed = headerSelector.length !== 0;
  if (!isFixed) {
    return;
  }

  const headerHeight = headerSelector.height();
  const bufferHeight = 1;
  jQuery('.nav-inner').css('padding-top', `calc(${headerHeight}px + 1rem)`);
  jQuery('#content-wrapper').css('padding-top', `calc(${headerHeight}px)`);
  insertCss(
    `span.anchor {
    position: relative;
    top: calc(-${headerHeight}px - ${bufferHeight}rem)
    }`,
  );
  insertCss(`span.card-container::before {
        display: block;
        content: '';
        margin-top: calc(-${headerHeight}px - ${bufferHeight}rem);
        height: calc(${headerHeight}px + ${bufferHeight}rem);
      }`);
  jQuery('h1, h2, h3, h4, h5, h6, .header-wrapper').each((index, heading) => {
    if (heading.id) {
      jQuery(heading).removeAttr('id'); // to avoid duplicated id problem
    }
  });
}

function updateSearchData(vm) {
  jQuery.getJSON(`${baseUrl}/siteData.json`)
    .then((siteData) => {
      vm.searchData = siteData.pages;
    });
}

function removeTemporaryStyles() {
  jQuery('.temp-navbar').removeClass('temp-navbar');
  jQuery('.temp-dropdown').removeClass('temp-dropdown');
  jQuery('.temp-dropdown-placeholder').remove();
}

function executeAfterCreatedRoutines() {
  removeTemporaryStyles();
}

function executeAfterMountedRoutines() {
  scrollToUrlAnchorHeading();
  setupAnchorsForFixedNavbar();
}

window.handleSiteNavClick = function (elem, useAnchor = true) {
  if (useAnchor) {
    const anchorElements = elem.getElementsByTagName('a');
    if (anchorElements.length) {
      window.location.href = anchorElements[0].href;
      return;
    }
  }
  const dropdownContent = elem.nextElementSibling;
  const dropdownIcon = elem.lastElementChild;
  dropdownContent.classList.toggle('site-nav-dropdown-container-open');
  dropdownIcon.classList.toggle('site-nav-rotate-icon');
};

window.handleScrollTop = function () {
  document.body.scrollIntoView({ block: 'start', behavior: 'smooth' });
};

function displayOrHideScrollTopButton(scrollTopButton) {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollTopButton.style.display = 'block';
  } else {
    scrollTopButton.style.display = 'none';
  }
}

function triggerScrollTopButton(timers) {
  clearTimeout(timers.displayButtonTimer);
  clearTimeout(timers.lightenButtonTimer);
  const scrollTopButton = document.querySelector('#scroll-top-button');
  scrollTopButton.classList.remove('lighten');
  timers.displayButtonTimer = setTimeout(() => {
    displayOrHideScrollTopButton(scrollTopButton);
    timers.lightenButtonTimer = setTimeout(() => {
      // lightens the scroll-top-button after 1 seconds of button inactivity
      // prevents the button from obscuring the content
      if (!scrollTopButton.classList.contains('lighten')) {
        scrollTopButton.classList.add('lighten');
      }
    }, 1000);
  }, 100);
}

function initDisplayScrollTopButton() {
  const timers = {
    displayButtonTimer: 0,
    lightenButtonTimer: 0,
  };
  window.addEventListener('scroll', () => {
    triggerScrollTopButton(timers);
  });
}

initDisplayScrollTopButton();

function setup() {
  // eslint-disable-next-line no-unused-vars
  const vm = new Vue({
    el: '#app',
    created() {
      executeAfterCreatedRoutines();
    },
    mounted() {
      executeAfterMountedRoutines();
    },
  });
}

function setupWithSearch() {
  // eslint-disable-next-line no-unused-vars
  const vm = new Vue({
    el: '#app',
    data() {
      return {
        searchData: [],
      };
    },
    methods: {
      searchCallback(match) {
        const page = `${baseUrl}/${match.src.replace(/.(md|mbd)$/, '.html')}`;
        const anchor = match.heading ? `#${match.heading.id}` : '';
        window.location = `${page}${anchor}`;
      },
    },
    created() {
      executeAfterCreatedRoutines();
    },
    mounted() {
      executeAfterMountedRoutines();
      updateSearchData(this);
    },
  });
}

function makeInnerGetterFor(attribute) {
  return (element) => {
    const innerElement = element.querySelector(`[data-mb-html-for="${attribute}"]`);
    return innerElement === null ? '' : innerElement.innerHTML;
  };
}

function makeHtmlGetterFor(componentType, attribute) {
  return (element) => {
    const contentWrapper = document.getElementById(element.attributes.for.value);
    return contentWrapper.dataset.mbComponentType === componentType
      ? makeInnerGetterFor(attribute)(contentWrapper) : '';
  };
}

/*
 These getters are used by triggers to get their popover/tooltip content.
 We need to create a completely new popover/tooltip for each trigger due to bootstrap-vue's implementation,
 so this is how we retrieve our contents.
*/
const popoverContentGetter = makeHtmlGetterFor('popover', 'content');
const popoverHeaderGetter = makeHtmlGetterFor('popover', 'header');
const popoverInnerContentGetter = makeInnerGetterFor('content');
const popoverInnerHeaderGetter = makeInnerGetterFor('header');

window.popoverGenerator = { title: popoverHeaderGetter, content: popoverContentGetter };
window.popoverInnerGenerator = { title: popoverInnerHeaderGetter, content: popoverInnerContentGetter };

window.tooltipContentGetter = makeHtmlGetterFor('tooltip', '_content');
window.tooltipInnerContentGetter = makeInnerGetterFor('_content');

export default { setup, setupWithSearch };
