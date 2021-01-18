import { mount } from '@vue/test-utils';
import NestedPanel from '../panels/NestedPanel.vue';

describe('NestedPanels', () => {
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
});
