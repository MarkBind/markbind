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

const LINK_CURRENT = `
<li>
<div>
<a href="#current">
CURRENT
</a>
</div>
</li>
`;

const LINK_ONE = `
<li>
<div>
<a href="#one">
ONE
</a>
</div>
</li>
`;

const LINK_TWO = `
<li>
<div>
<a href="#two">
TWO
</a>
</div>
</li>
`;

const SITENAV_NO_LINK = `
${SITENAV_START}
${SITENAV_END}
`;

const SITENAV_ONE_LINK = `
${SITENAV_START}
${LINK_CURRENT}
${SITENAV_END}
`;

const SITENAV_ONE_LEVEL = `
${SITENAV_START}
${LINK_ONE}
${LINK_TWO}
${LINK_CURRENT}
${SITENAV_END}
`;

const SITENAV_TWO_LEVEL_NONLINK = `
${SITENAV_START}
${LINK_ONE}
${LINK_TWO}
<li>
<div> DROPDOWN </div>
<ul>
${LINK_CURRENT}
</ul>
</li>
${SITENAV_END}
`;

const SITENAV_TWO_LEVEL_LINK = `
${SITENAV_START}
${LINK_ONE}
${LINK_TWO}
<li>
<div> 
<a href="#dropdown">
DROPDOWN
</div>
</a>
<ul>
${LINK_CURRENT}
</ul>
</li>
${SITENAV_END}
`;

describe('Breadcrumbs', () => {
  test('empty breadcrumb', async () => {
    mount(SITENAV_NO_LINK);
    const wrapper = mount(Breadcrumb);

    expect(wrapper.element).toMatchSnapshot();
  });

  test('one link', async () => {
    mount(SITENAV_ONE_LINK);
    const wrapper = mount(Breadcrumb);

    expect(wrapper.element).toMatchSnapshot();
  });

  test('one level', async () => {
    mount(SITENAV_ONE_LEVEL);
    const wrapper = mount(Breadcrumb);

    expect(wrapper.element).toMatchSnapshot();
  });

  test('two level nonlink', async () => {
    mount(SITENAV_TWO_LEVEL_NONLINK);
    const wrapper = mount(Breadcrumb);

    expect(wrapper.element).toMatchSnapshot();
  });

  test('two level link', async () => {
    mount(SITENAV_TWO_LEVEL_LINK);
    const wrapper = mount(Breadcrumb);

    expect(wrapper.element).toMatchSnapshot();
  });
});
