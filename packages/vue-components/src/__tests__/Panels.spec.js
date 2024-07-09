import { mount } from '@vue/test-utils';
import NestedPanel from '../panels/NestedPanel.vue';

const DEFAULT_STUBS = { 'nested-panel': NestedPanel };

const BOX_CONTAINER = `
  <div style="color:white;">
    <nested-panel type="seamless">
      <template #header>Test Header</template>
      <p>Test Content</p>
    </nested-panel>
  </div>
`;

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

  test('renders a seamless panel with a transparent background', async () => {
    const wrapper = mount(NestedPanel, {
      propsData: {
        type: 'seamless',
      },
      slots: {
        header: 'test header',
      },
    });

    expect(wrapper.find('.card').classes()).toContain('card-seamless');
    expect(wrapper.find('.card-header').classes()).toContain('bg-transparent');
    expect(wrapper.element).toMatchSnapshot();
  });

  test('seamless panel should inherit parent background color', () => {
    const ParentComponent = {
      template: BOX_CONTAINER,
    };

    const wrapper = mount(ParentComponent, {
      stubs: DEFAULT_STUBS,
    });

    const parentElement = wrapper.find('div');
    const seamlessPanel = wrapper.findComponent(NestedPanel);

    expect(seamlessPanel.props('type')).toBe('seamless');
    expect(window.getComputedStyle(seamlessPanel.element).backgroundColor).toBe(
      window.getComputedStyle(parentElement.element).backgroundColor,
    );
  });
});
