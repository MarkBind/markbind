import { mount } from '@vue/test-utils';
import CollapseExpandButtons from '../CollapseExpandButtons.vue';

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
<a href="#link">
Link
</a>
</div>
</li>
`;

const SiteNavDropdownExpanded = {
  template: `
  ${SITENAV_START}
  <li>
  <div class="site-nav-default-list-item">
  Non-Link Dropdown
  <div class="site-nav-dropdown-btn-container">
  <i class="site-nav-dropdown-btn-icon site-nav-rotate-icon"></i>
  </div>
  </div>
  <ul class="site-nav-dropdown-container site-nav-list site-nav-dropdown-container-open">
  ${SITENAV_LINK}
  </ul>
  </li>
  ${SITENAV_END}
  `,
};

const SiteNavDropdownCollapsed = {
  template: `
  ${SITENAV_START}
  <li>
  <div class="site-nav-default-list-item">
  Non-Link Dropdown
  <div class="site-nav-dropdown-btn-container">
  <i class="site-nav-dropdown-btn-icon"></i>
  </div>
  </div>
  <ul class="site-nav-dropdown-container site-nav-list">
  ${SITENAV_LINK}
  </ul>
  </li>
  ${SITENAV_END}
  `,
};

const SiteNavDropdownBoth = {
  template: `
  ${SITENAV_START}
  <li>
  <div class="site-nav-default-list-item">
  Expanded Dropdown
  <div class="site-nav-dropdown-btn-container">
  <i class="site-nav-dropdown-btn-icon site-nav-rotate-icon"></i>
  </div>
  </div>
  <ul class="site-nav-dropdown-container site-nav-list site-nav-dropdown-container-open">
  ${SITENAV_LINK}
  </ul>
  </li>
  <li>
  <div class="site-nav-default-list-item">
  Collapsed Dropdown
  <div class="site-nav-dropdown-btn-container">
  <i class="site-nav-dropdown-btn-icon"></i>
  </div>
  </div>
  <ul class="site-nav-dropdown-container site-nav-list">
  ${SITENAV_LINK}
  </ul>
  </li>
  ${SITENAV_END}
  `,
};

describe('CollapseExpandButtons', () => {
  test('collapse expanded sitenav', async () => {
    const sitenav = mount(SiteNavDropdownExpanded, {
      attachTo: document.body,
    });
    const wrapper = mount(CollapseExpandButtons, {
      attachTo: document.body,
    });
    await wrapper.findComponent('div.collapse-all-button').trigger('click');

    expect(sitenav.element).toMatchSnapshot();
    sitenav.destroy();
    wrapper.destroy();
  });

  test('expand expanded sitenav', async () => {
    const sitenav = mount(SiteNavDropdownExpanded, {
      attachTo: document.body,
    });
    const wrapper = mount(CollapseExpandButtons, {
      attachTo: document.body,
    });
    await wrapper.findComponent('div.expand-all-button').trigger('click');

    expect(sitenav.element).toMatchSnapshot();
    sitenav.destroy();
    wrapper.destroy();
  });

  test('expand collapsed sitenav', async () => {
    const sitenav = mount(SiteNavDropdownCollapsed, {
      attachTo: document.body,
    });
    const wrapper = mount(CollapseExpandButtons, {
      attachTo: document.body,
    });
    await wrapper.findComponent('div.expand-all-button').trigger('click');

    expect(sitenav.element).toMatchSnapshot();
    sitenav.destroy();
    wrapper.destroy();
  });

  test('collapse collapsed sitenav', async () => {
    const sitenav = mount(SiteNavDropdownCollapsed, {
      attachTo: document.body,
    });
    const wrapper = mount(CollapseExpandButtons, {
      attachTo: document.body,
    });
    await wrapper.findComponent('div.collapse-all-button').trigger('click');

    expect(sitenav.element).toMatchSnapshot();
    sitenav.destroy();
    wrapper.destroy();
  });

  test('expand both sitenav', async () => {
    const sitenav = mount(SiteNavDropdownBoth, {
      attachTo: document.body,
    });
    const wrapper = mount(CollapseExpandButtons, {
      attachTo: document.body,
    });
    await wrapper.findComponent('div.expand-all-button').trigger('click');

    expect(sitenav.element).toMatchSnapshot();
    sitenav.destroy();
    wrapper.destroy();
  });

  test('collapse both sitenav', async () => {
    const sitenav = mount(SiteNavDropdownBoth, {
      attachTo: document.body,
    });
    const wrapper = mount(CollapseExpandButtons, {
      attachTo: document.body,
    });
    await wrapper.findComponent('div.collapse-all-button').trigger('click');

    expect(sitenav.element).toMatchSnapshot();
    sitenav.destroy();
    wrapper.destroy();
  });
});
