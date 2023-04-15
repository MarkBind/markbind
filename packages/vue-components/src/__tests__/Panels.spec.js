import { mount } from '@vue/test-utils';
import NestedPanel from '../panels/NestedPanel.vue';

describe.skip('NestedPanels', () => {
  test('should show header when collapsed with expandHeaderless as false', async () => {
    const wrapper = mount(NestedPanel, {
      propsData: {
        expandHeaderless: false,
      },
      slots: {
        header: 'test header',
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should show header after expand with expandHeaderless as false', async () => {
    const wrapper = mount(NestedPanel, {
      propsData: {
        expandHeaderless: false,
      },
      slots: {
        header: 'test header',
      },
    });

    // click on header
    await wrapper.find('div.card-header').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should show header when collapsed with expandHeaderless as true', async () => {
    const wrapper = mount(NestedPanel, {
      propsData: {
        expandHeaderless: true,
      },
      slots: {
        header: 'test header',
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should not show header after expand with expandHeaderless as true', async () => {
    const wrapper = mount(NestedPanel, {
      propsData: {
        expandHeaderless: true,
      },
      slots: {
        header: 'test header',
      },
    });

    // click on header
    await wrapper.find('div.card-header').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('transition height is correctly calculated', async () => {
    const wrapper = mount(NestedPanel, {
      slots: {
        header: 'test header',
        default: 'Some panel content\nsome other text',
      },
      propsData: {
        preload: true,
      },
      attachTo: document.body,
    });
    const panelElement = wrapper.element.querySelector('.card-collapse');
    Object.defineProperty(panelElement, 'scrollHeight', { configurable: true, value: 10 });
    const bottomSwitch = wrapper.element.querySelector('.card-body > .collapse-button');
    bottomSwitch.style.marginBottom = '13px';
    // click on header
    await wrapper.find('div.card-header').trigger('click');
    expect(wrapper.element).toMatchSnapshot();
  });

  test('should have span.anchor when id is present', async () => {
    const wrapper = mount(NestedPanel, {
      propsData: {
        panelId: 'test-id',
      },
      slots: {
        header: 'test header',
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
