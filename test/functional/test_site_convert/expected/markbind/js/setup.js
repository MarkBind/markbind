/* eslint-disable no-undef */

Vue.use(VueStrap);

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

function flattenModals() {
  jQuery('.modal').each((index, modal) => {
    jQuery(modal).detach().appendTo(jQuery('#app'));
  });
}

function setupAnchors() {
  jQuery('h1, h2, h3, h4, h5, h6, .header-wrapper').each((index, heading) => {
    if (heading.id) {
      jQuery(heading).on('mouseenter',
                         () => jQuery(heading).find('.fa.fa-anchor').css('visibility', 'visible'));
      jQuery(heading).on('mouseleave',
                         () => jQuery(heading).find('.fa.fa-anchor').css('visibility', 'hidden'));
    }
  });
  jQuery('.fa-anchor').each((index, anchor) => {
    jQuery(anchor).on('click', function () {
      window.location.href = jQuery(this).attr('href');
    });
  });
}

function updateSearchData(vm) {
  jQuery.getJSON(`${baseUrl}/siteData.json`)
    .then((siteData) => {
      // eslint-disable-next-line no-param-reassign
      vm.searchData = siteData.pages;
    });
}

const MarkBind = {
  executeAfterSetupScripts: jQuery.Deferred(),
};

MarkBind.afterSetup = (func) => {
  if (document.readyState !== 'loading') {
    func();
  } else {
    MarkBind.executeAfterSetupScripts.then(func);
  }
};

function removeTemporaryStyles() {
  jQuery('.temp-navbar').removeClass('temp-navbar');
  jQuery('.temp-dropdown').removeClass('temp-dropdown');
  jQuery('.temp-dropdown-placeholder').remove();
}

function executeAfterCreatedRoutines() {
  removeTemporaryStyles();
}

function executeAfterMountedRoutines() {
  flattenModals();
  scrollToUrlAnchorHeading();
  setupAnchors();
  MarkBind.executeAfterSetupScripts.resolve();
}

function setupSiteNav() {
  // Add event listener for site-nav-btn to toggle itself and site navigation elements.
  const siteNavBtn = document.getElementById('site-nav-btn');
  if (siteNavBtn) {
    siteNavBtn.addEventListener('click', function () {
      this.classList.toggle('shift');
      document.getElementById('site-nav').classList.toggle('open');
      document.getElementById('site-nav-btn-wrap').classList.toggle('open');
    });
  }
  // Creates event listener for all dropdown-btns in page.
  Array.prototype.forEach.call(
    document.getElementsByClassName('dropdown-btn'),
    dropdownBtn => dropdownBtn.addEventListener('click', function () {
      this.classList.toggle('dropdown-btn-open');
      const dropdownContent = this.nextElementSibling;
      const dropdownIcon = this.lastElementChild;
      dropdownContent.classList.toggle('dropdown-container-open');
      dropdownIcon.classList.toggle('rotate-icon');
    }),
  );
}

function setReadingBarWidth(progress) {
  const amountScrolled = document.documentElement.scrollTop || document.body.scrollTop;
  const pageHeight = (document.documentElement.scrollHeight || document.body.scrollHeight)
    - document.documentElement.clientHeight;
  const scrollPercentage = (amountScrolled / pageHeight) * 100;
  progress.style.setProperty('--scroll', `${scrollPercentage}%`);
}

function checkHeightChange(prevHeight, callback) {
  const curHeight = document.body.clientHeight;
  if (prevHeight !== curHeight) {
    callback();
  }
  if (document.body.onElementHeightChangeTimer) {
    clearTimeout(document.body.onElementHeightChangeTimer);
  }

  document.body.onElementHeightChangeTimer = setTimeout(checkHeightChange, 200,
                                                        curHeight, callback);
}

function onElementHeightChange(callback) {
  const prevHeight = document.body.clientHeight;
  checkHeightChange(prevHeight, callback);
}

function setupReadingProgress() {
  const progress = document.querySelector('.progress');

  // In case the author has not enabled the indicator
  if (progress === null) {
    return;
  }

  onElementHeightChange(() => {
    setReadingBarWidth(progress);
  });

  window.onscroll = () => {
    setReadingBarWidth(progress);
  };

  window.onresize = () => {
    setReadingBarWidth(progress);
  };
}

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
  setupSiteNav();
  setupReadingProgress();
}

function setupWithSearch() {
  const { searchbar } = VueStrap.components;
  // eslint-disable-next-line no-unused-vars
  const vm = new Vue({
    el: '#app',
    components: {
      searchbar,
    },
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
  setupSiteNav();
  setupReadingProgress();
}

if (enableSearch) {
  setupWithSearch();
} else {
  setup();
}
