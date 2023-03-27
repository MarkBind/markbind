import { mount } from '@vue/test-utils';
import Breadcrumb from '../Breadcrumb.vue';

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
});
