// eslint-disable-next-line import/no-extraneous-dependencies
import MarkBindVue from '@markbind/vue-components/src';
import initScrollTopButton from './scrollTopButton';
import './styles/index.css';

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

function detectAndApplyFixedHeaderStyles() {
  jQuery(':header').each((index, heading) => {
    if (heading.id) {
      jQuery(heading).removeAttr('id'); // to avoid duplicated id problem
    }
  });

  const headerSelector = jQuery('header[fixed]');
  const isFixed = headerSelector.length !== 0;
  if (!isFixed) {
    return;
  }

  const headerHeight = headerSelector.height();
  const bufferHeight = 1;
  insertCss(`.fixed-header-padding { padding-top: ${headerHeight}px !important }`);
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
  insertCss(`.nav-menu-open { max-height: calc(100% - ${headerHeight}px); }`);

  const adjustHeaderClasses = () => {
    const newHeaderHeight = headerSelector.height();
    const sheets = document.styleSheets;
    for (let i = 0; i < sheets.length; i += 1) {
      const rules = sheets[i].cssRules;
      // eslint-disable-next-line lodash/prefer-get
      if (rules && rules[0] && rules[0].selectorText) {
        switch (rules[0].selectorText) {
        case '.fixed-header-padding':
          sheets[i].deleteRule(0);
          sheets[i].insertRule(`.fixed-header-padding { padding-top: ${newHeaderHeight}px !important }`);
          break;
        case 'span.anchor':
          rules[0].style.top = `calc(-${newHeaderHeight}px - ${bufferHeight}rem)`;
          break;
        case 'span.card-container::before':
          rules[0].style.marginTop = `calc(-${newHeaderHeight}px - ${bufferHeight}rem)`;
          rules[0].style.height = `calc(${newHeaderHeight}px + ${bufferHeight}rem)`;
          break;
        case '.nav-menu-open':
          rules[0].style.maxHeight = `calc(100% - ${newHeaderHeight}px + 50px)`;
          break;
        default:
          break;
        }
      }
    }
  };

  const toggleHeaderOverflow = () => {
    const headerMaxHeight = headerSelector.css('max-height');
    // reset overflow when header shows again to allow content
    // in the header such as search dropdown etc. to overflow
    if (headerMaxHeight === '100%') {
      headerSelector.css('overflow', '');
      adjustHeaderClasses();
    }
  };

  let lastOffset = 0;
  const toggleHeaderOnScroll = () => {
    // prevent toggling of header on desktop site
    if (window.innerWidth > 767) { return; }
    const currentOffset = window.pageYOffset;
    const isEndOfPage = (window.innerHeight + currentOffset) >= document.body.offsetHeight;
    // to prevent page from auto scrolling when header is toggled at the end of page
    if (isEndOfPage) { return; }
    if (currentOffset > lastOffset) {
      headerSelector.addClass('hide-header');
    } else {
      headerSelector.removeClass('hide-header');
    }
    lastOffset = currentOffset;
  };

  const resizeObserver = new ResizeObserver(() => {
    const headerMaxHeight = headerSelector.css('max-height');
    // hide header overflow when user scrolls to support transition effect
    if (headerMaxHeight !== '100%') {
      headerSelector.css('overflow', 'hidden');
      return;
    }
    adjustHeaderClasses();
  });
  resizeObserver.observe(headerSelector[0]);
  headerSelector[0].addEventListener('transitionend', toggleHeaderOverflow);
  window.addEventListener('scroll', toggleHeaderOnScroll);
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
  detectAndApplyFixedHeaderStyles();
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
window.popoverInnerGetters = {
  title: makeMbSlotGetter('header'),
  content: makeMbSlotGetter('content'),
};
// Used via vb-tooltip.html="popoverInnerGenerator" for tooltips
window.tooltipInnerContentGetter = makeMbSlotGetter('_content');

initScrollTopButton();

export default { setup, setupWithSearch };
