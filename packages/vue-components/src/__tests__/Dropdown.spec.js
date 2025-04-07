import { mount } from '@vue/test-utils';
import Dropdown from '../Dropdown.vue';

const DEFAULT_STUBS = {
  'dropdown': Dropdown,
};

const DROPDOWN = `
<li><a href="#" class="dropdown-item">Dropdown Item 1</a></li>
<li><a href="#" class="dropdown-item">Dropdown Item 2</a></li>
<li><a href="#" class="dropdown-item">Dropdown Item 3</a></li>
`;

const FIRST_LEVEL_NESTED_DROPDOWN = `
${DROPDOWN}
<dropdown header="Submenu Level 1">
  <li><a href="#" class="dropdown-item">Nested Dropdown Item 1</a></li>
  <li><a href="#" class="dropdown-item">Nested Dropdown Item 2</a></li>
</dropdown>
`;

const SECOND_LEVEL_NESTED_DROPDOWN = `
<dropdown header="Submenu Level 1">
  <li><a href="#" class="dropdown-item">Nested Dropdown Item 1</a></li>
  <li><a href="#" class="dropdown-item">Nested Dropdown Item 2</a></li>
  <dropdown header="Submenu Level 2">
    <li><a href="#" class="dropdown-item">Nested Submenu Item</a></li>
  </dropdown>
</dropdown>
`;

describe('Dropdown with submenu', () => {
  test('dropdown', async () => {
    const wrapper = mount(Dropdown, {
      slots: {
        header: 'Test Dropdown',
        default: DROPDOWN,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('dropdown with one level of submenu', async () => {
    const wrapper = mount(Dropdown, {
      slots: {
        header: 'Test Dropdown',
        default: FIRST_LEVEL_NESTED_DROPDOWN,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('dropdown with two levels of submenu', async () => {
    const wrapper = mount(Dropdown, {
      slots: {
        header: 'Test Dropdown',
        default: SECOND_LEVEL_NESTED_DROPDOWN,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
