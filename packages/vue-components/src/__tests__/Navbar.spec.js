import { mount } from '@vue/test-utils';
import Navbar from '../Navbar.vue';
import PageNavButton from '../PageNavButton.vue';
import SiteNavButton from '../SiteNavButton.vue';

const DEFAULT_STUBS = {
  'page-nav-button': PageNavButton,
  'site-nav-button': SiteNavButton,
};

const NAVBAR_CONTENT = `
<a slot="brand" href="#" title="Home" class="navbar-brand">Your Logo</a>
  <li><a href="#" class="nav-link">Topic 1</a></li>
  <li><a href="#" class="nav-link">Topic 2</a></li>
</a>
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
        default: NAVBAR_CONTENT,
        'lower-navbar': OMIT_PAGE_AND_SITE_NAV_BUTTONS,
      },
      stubs: DEFAULT_STUBS,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('navbar with site nav button', async () => {
    const wrapper = mount(Navbar, {
      slots: {
        default: NAVBAR_CONTENT,
        'lower-navbar': SITE_NAV_BUTTON,
      },
      stubs: DEFAULT_STUBS,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('navbar with page nav button', async () => {
    const wrapper = mount(Navbar, {
      slots: {
        default: NAVBAR_CONTENT,
        'lower-navbar': PAGE_NAV_BUTTON,
      },
      stubs: DEFAULT_STUBS,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('navbar with site and page nav buttons', async () => {
    const wrapper = mount(Navbar, {
      slots: {
        default: NAVBAR_CONTENT,
        'lower-navbar': SITE_AND_PAGE_NAV_BUTTONS,
      },
      stubs: DEFAULT_STUBS,
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
