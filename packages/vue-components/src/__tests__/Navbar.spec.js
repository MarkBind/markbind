import { mount } from '@vue/test-utils';
import Navbar from '../Navbar.vue';
import Overlay from '../Overlay.vue';
import PageNavButton from '../PageNavButton.vue';
import SiteNavButton from '../SiteNavButton.vue';

const DEFAULT_STUBS = {
  'page-nav-button': PageNavButton,
  'site-nav-button': SiteNavButton,
  'Overlay': Overlay,
};

const NAVBAR_BRAND = '<a href="#" title="Home" class="navbar-brand">Your Logo</a>';

const NAVBAR_CONTENT = `
<li><a href="#" class="nav-link">Topic 1</a></li>
<li><a href="#" class="nav-link">Topic 2</a></li>
`;

const OMIT_PAGE_AND_SITE_NAV_BUTTONS = '<div></div>';

const SITE_NAV_BUTTON = `
<div class="nav-menu-container">
  <site-nav-button />
</div>
`;

const PAGE_NAV_BUTTON = `
<div class="nav-menu-container">
  <page-nav-button />
</div>
`;

const SITE_AND_PAGE_NAV_BUTTONS = `
<div class="nav-menu-container">
  <site-nav-button />
  <page-nav-button />
</div>
`;

describe('Navbar and secondary navbar', () => {
  test('navbar without site and page nav buttons', async () => {
    const wrapper = mount(Navbar, {
      slots: {
        brand: NAVBAR_BRAND,
        default: NAVBAR_CONTENT,
        'lower-navbar': OMIT_PAGE_AND_SITE_NAV_BUTTONS,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('navbar with site nav button', async () => {
    const wrapper = mount(Navbar, {
      slots: {
        brand: NAVBAR_BRAND,
        default: NAVBAR_CONTENT,
        'lower-navbar': SITE_NAV_BUTTON,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('navbar with page nav button', async () => {
    const wrapper = mount(Navbar, {
      slots: {
        brand: NAVBAR_BRAND,
        default: NAVBAR_CONTENT,
        'lower-navbar': PAGE_NAV_BUTTON,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('navbar with site and page nav buttons', async () => {
    const wrapper = mount(Navbar, {
      slots: {
        brand: NAVBAR_BRAND,
        default: NAVBAR_CONTENT,
        'lower-navbar': SITE_AND_PAGE_NAV_BUTTONS,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});

describe('Mobile nav buttons test:', () => {
  beforeEach(() => {
    const rootDiv = document.createElement('div');
    const navbarDiv = document.createElement('div');
    const navContentDiv = document.createElement('div');

    rootDiv.id = 'root';
    navbarDiv.id = 'navbarTarget';
    navContentDiv.id = 'navContentTarget';

    rootDiv.appendChild(navbarDiv);
    rootDiv.appendChild(navContentDiv);
    document.body.appendChild(rootDiv);
  });

  afterEach(() => {
    document.body.removeChild(document.getElementById('root'));
  });

  test.each([
    // Should not show up
    ['<div id="site-nav">no link here</div>', SITE_NAV_BUTTON, SiteNavButton, undefined],
    ['<div class="site-nav-root">no link here</div>', SITE_NAV_BUTTON, SiteNavButton, undefined],
    ['<div id="page-nav">no link here</div>', PAGE_NAV_BUTTON, PageNavButton, undefined],
    ['<div id="mb-site-nav">no link here</div>', PAGE_NAV_BUTTON, PageNavButton, undefined],
    // Should show up
    ['<div id="site-nav"><a href="x">dummy</a></div>', SITE_NAV_BUTTON, SiteNavButton, 'site-nav'],
    ['<div class="site-nav-root"><a href="x">dummy</a></div>', SITE_NAV_BUTTON, SiteNavButton, 'mb-site-nav'],
    ['<div id="page-nav"><a href="x">dummy</a></div>', PAGE_NAV_BUTTON, PageNavButton, 'page-nav'],
    ['<div id="mb-page-nav"><a href="x">dummy</a></div>', PAGE_NAV_BUTTON, PageNavButton, 'mb-page-nav'],
  ])('Nav buttons set the portal name accordingly if the respective selectors are not found.',
     async (navContent, lowerNavbarSlot, NavComponent, portalName) => {
       document.getElementById('navContentTarget').innerHTML = navContent;

       const wrapper = mount(Navbar, {
         attachTo: '#navbarTarget',
         slots: {
           brand: NAVBAR_BRAND,
           default: NAVBAR_CONTENT,
           'lower-navbar': lowerNavbarSlot,
         },
         global: {
           stubs: {
             ...DEFAULT_STUBS,
             'overlay': true,
           },
         },
       });

       const navComponent = wrapper.findComponent(NavComponent);
       expect(navComponent.exists()).toBe(true);

       expect(navComponent.vm.portalName).toBe(portalName);

       wrapper.unmount();
     });
});

describe('Navbar Highlight Logic', () => {
  test('correctly highlights the deepest matching link (Best Match)', async () => {
    const deepUrl = 'http://localhost/lessons/trail/recordingFolderHistory/index.html';
    const TEST_NAVBAR_CONTENT = `
      <li><a href="/index.html" class="nav-link">Home</a></li>
      <li><a href="/lessons/index.html" class="nav-link">Lessons</a></li>
      <li><a href="/about/index.html" class="nav-link">About</a></li>
    `;

    // Test highlightLink(url) method on the component.
    // Mount it, then call highlightLink manually with test URL.
    const wrapper = mount(Navbar, {
      slots: {
        brand: NAVBAR_BRAND,
        default: TEST_NAVBAR_CONTENT,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });

    // Clear any initial highlighting from mounted()
    wrapper.findAll('li').forEach(li => li.element.classList.remove('current'));

    // Manually trigger highlight with the problematic URL
    wrapper.vm.highlightLink(deepUrl);
    await wrapper.vm.$nextTick();

    const homeLink = wrapper.find('a[href="/index.html"]').element;
    const lessonsLink = wrapper.find('a[href="/lessons/index.html"]').element;

    const homeLi = homeLink.closest('li');
    const lessonsLi = lessonsLink.closest('li');

    // Expectation: Lessons should be current because it is deeper / more specific
    expect(lessonsLi.classList.contains('current')).toBe(true);

    // Expectation: Home should NOT be current (it is a match, but a worse one)
    expect(homeLi.classList.contains('current')).toBe(false);
  });
});
