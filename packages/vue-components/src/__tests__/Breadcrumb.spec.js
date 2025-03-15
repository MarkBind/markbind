import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import Breadcrumb from '../Breadcrumb.vue';

const SITENAV_START = `
<nav id="site-nav">
<div class="nav-component slim-scroll">
<div class="site-nav-root">
<ul class="site-nav-list site-nav-list-root">
`;

const SITENAV_END = `
</ul>
</div>
</div>
</nav>
`;

const SITENAV_LINK = `
<li>
<div class="site-nav-default-list-item">
<a href="#link" class="current">
Link
</a>
</div>
</li>
`;

const oneLinkSiteNav = {
  template: `
  ${SITENAV_START}
  ${SITENAV_LINK}
  ${SITENAV_END}
  `,
};

const dropdownNonLinkSiteNav = {
  template: `
  ${SITENAV_START}
  <li>
  <div class="site-nav-default-list-item">
  Non-Link Dropdown
  </div>
  <ul>
  ${SITENAV_LINK}
  </ul>
  </li>
  ${SITENAV_END}
  `,
};

const dropdownLinkSiteNav = {
  template: `
  ${SITENAV_START}
  <li>
  <div class="site-nav-default-list-item">
  <a href="#link-dropdown">
  Link Dropdown
  </a>
  </div>
  <ul>
  ${SITENAV_LINK}
  </ul>
  </li>
  ${SITENAV_END}
  `,
};

describe('Breadcrumb', () => {
  test('empty breadcrumb', async () => {
    const wrapper = mount(Breadcrumb, {
      data() {
        return {
          items: [],
        };
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('one non-link', async () => {
    const wrapper = mount(Breadcrumb, {
      data() {
        return {
          items: [
            {
              'title': 'non-link one',
              'link': null,
            },
          ],
        };
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('one link', async () => {
    const wrapper = mount(Breadcrumb, {
      data() {
        return {
          items: [
            {
              'title': 'link one',
              'link': '#link',
            },
          ],
        };
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('two non-link', async () => {
    const wrapper = mount(Breadcrumb, {
      data() {
        return {
          items: [
            {
              'title': 'link one',
              'link': null,
            },
            {
              'title': 'link two',
              'link': null,
            },
          ],
        };
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('two link', async () => {
    const wrapper = mount(Breadcrumb, {
      data() {
        return {
          items: [
            {
              'title': 'link one',
              'link': '#linkone',
            },
            {
              'title': 'link two',
              'link': '#linktwo',
            },
          ],
        };
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('no sitenav', async () => {
    const wrapper = mount(Breadcrumb, {
      attachTo: document.body,
    });

    expect(wrapper.element).toMatchSnapshot();
    wrapper.unmount();
  });

  test('one link from sitenav', async () => {
    const sitenav = mount(oneLinkSiteNav, {
      attachTo: document.body,
    });
    const wrapper = mount(Breadcrumb, {
      attachTo: document.body,
    });
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
    sitenav.unmount();
    wrapper.unmount();
  });

  test('dropdown non-link from sitenav', async () => {
    const sitenav = mount(dropdownNonLinkSiteNav, {
      attachTo: document.body,
    });
    const wrapper = mount(Breadcrumb, {
      attachTo: document.body,
    });
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
    sitenav.unmount();
    wrapper.unmount();
  });

  test('dropdown link from sitenav', async () => {
    const sitenav = mount(dropdownLinkSiteNav, {
      attachTo: document.body,
    });
    const wrapper = mount(Breadcrumb, {
      attachTo: document.body,
    });
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
    sitenav.unmount();
    wrapper.unmount();
  });
});
