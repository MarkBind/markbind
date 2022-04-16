import { mount } from '@vue/test-utils';
import Popover from '../Popover.vue';

const DEFAULT_POPOVER_TRIGGER = 'click to show popover';
const DEFAULT_POPOVER_HEADER_ATTRIBUTE = 'test popover header attribute';
const DEFAULT_POPOVER_HEADER_SLOT = 'test popover header slot';
const DEFAULT_POPOVER_CONTENT_ATTRIBUTE = 'Popover content slot: Lorem ipsum dolor sit amet, '
+ 'consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
const DEFAULT_POPOVER_CONTENT_SLOT = 'Popover content slot: Lorem ipsum dolor sit amet, '
+ 'consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

describe('Popover', () => {
  test('should not be shown until triggered', async () => {
    const wrapper = mount(Popover, {
      propsData: {
        trigger: 'click',
        content: DEFAULT_POPOVER_CONTENT_ATTRIBUTE,
      },
      slots: {
        default: DEFAULT_POPOVER_TRIGGER,
      },
      stubs: ['v-popover'],
    });

    // don't click on trigger
    expect(wrapper.element).toMatchSnapshot();
  });

  test('should not show header when no header is given', async () => {
    const wrapper = mount(Popover, {
      propsData: {
        trigger: 'click',
        content: DEFAULT_POPOVER_CONTENT_ATTRIBUTE,
      },
      slots: {
        default: DEFAULT_POPOVER_TRIGGER,
      },
      stubs: ['v-popover'],
    });

    // click on trigger
    await wrapper.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should show header and content', async () => {
    const wrapper = mount(Popover, {
      propsData: {
        trigger: 'click',
        content: DEFAULT_POPOVER_CONTENT_ATTRIBUTE,
        header: DEFAULT_POPOVER_HEADER_ATTRIBUTE,
      },
      slots: {
        default: DEFAULT_POPOVER_TRIGGER,
      },
      stubs: ['v-popover'],
    });

    // click on trigger
    await wrapper.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should show header and content slots correctly', async () => {
    const wrapper = mount(Popover, {
      propsData: {
        trigger: 'click',
      },
      slots: {
        default: DEFAULT_POPOVER_TRIGGER,
        header: DEFAULT_POPOVER_HEADER_SLOT,
        content: DEFAULT_POPOVER_CONTENT_SLOT,
      },
      stubs: ['v-popover'],
    });

    // click on trigger
    await wrapper.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should respect the placement attribute', async () => {
    const wrapper = mount(Popover, {
      propsData: {
        trigger: 'click',
        content: DEFAULT_POPOVER_CONTENT_ATTRIBUTE,
        header: DEFAULT_POPOVER_HEADER_ATTRIBUTE,
        placement: 'right',
      },
      slots: {
        default: DEFAULT_POPOVER_TRIGGER,
      },
      stubs: ['v-popover'],
    });

    // click on trigger
    await wrapper.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });
});
