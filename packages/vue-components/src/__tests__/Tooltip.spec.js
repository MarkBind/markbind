import { mount } from '@vue/test-utils';
import Tooltip from '../Tooltip.vue';

const DEFAULT_TOOLTIP_TRIGGER = 'click to show tooltip';
const DEFAULT_TOOLTIP_CONTENT = 'Lorem ipsum dolor sit amet';

describe('Tooltip', () => {
  test('should not be shown until triggered', async () => {
    const wrapper = mount(Tooltip, {
      propsData: {
        trigger: 'click',
        content: DEFAULT_TOOLTIP_CONTENT,
      },
      slots: {
        default: DEFAULT_TOOLTIP_TRIGGER,
      },
      stubs: ['v-tooltip'],
    });

    // don't click on trigger
    expect(wrapper.element).toMatchSnapshot();
  });

  test('should show contents correctly when triggered', async () => {
    const wrapper = mount(Tooltip, {
      propsData: {
        trigger: 'click',
        content: DEFAULT_TOOLTIP_CONTENT,
      },
      slots: {
        default: DEFAULT_TOOLTIP_TRIGGER,
      },
      stubs: ['v-tooltip'],
    });

    // click on trigger
    await wrapper.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should respect the placement attribute', async () => {
    const wrapper = mount(Tooltip, {
      propsData: {
        trigger: 'click',
        content: DEFAULT_TOOLTIP_CONTENT,
        placement: 'right',
      },
      slots: {
        default: DEFAULT_TOOLTIP_TRIGGER,
      },
      stubs: ['v-tooltip'],
    });

    // click on trigger
    await wrapper.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });
});
