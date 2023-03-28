import { mount } from '@vue/test-utils';
import ScrollTopButton from '../ScrollTopButton.vue';

function waitTimeout(timeLength) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise(resolve => setTimeout(resolve, timeLength));
}

describe('ScrollTopButton', () => {
  test.skip('button appears with user scrolls', async () => {
    const wrapper = await mount(ScrollTopButton, {
      attachTo: document.body,
    });
    document.body.scrollTop = 1000;
    window.dispatchEvent(new Event('scroll'));
    await waitTimeout(100);
    expect(wrapper.element).toMatchSnapshot();
  });

  test.skip('button lightens after user stops scrolling', async () => {
    const wrapper = await mount(ScrollTopButton, {
      attachTo: document.body,
    });
    document.body.scrollTop = 1000;
    window.dispatchEvent(new Event('scroll'));
    await waitTimeout(1200);
    expect(wrapper.element).toMatchSnapshot();
  });

  test('button position is rendered correctly', async () => {
    const wrapper = await mount(ScrollTopButton, {
      propsData: {
        right: '100%',
        bottom: '100%',
      },
      attachTo: document.body,
    });
    expect(wrapper.element).toMatchSnapshot();
  });
  test('button icon is rendered correctly', async () => {
    const wrapper = await mount(ScrollTopButton, {
      slots: {
        icon: ':fas-plus:',
      },
      propsData: {
        iconSize: '2x',
        iconColor: 'red',
      },
      attachTo: document.body,
    });
    expect(wrapper.element).toMatchSnapshot();
  });
  test('scroll to top when button is pressed', async () => {
    const wrapper = await mount(ScrollTopButton, {
      attachTo: document.body,
    });
    const scrollViewFunc = jest.fn((data) => {
      expect(data.block).toBe('start');
    });
    window.HTMLElement.prototype.scrollIntoView = scrollViewFunc;
    await wrapper.trigger('click');
    expect(scrollViewFunc).toHaveBeenCalled();
    expect(wrapper.element).toMatchSnapshot();
  });
});
