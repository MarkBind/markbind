import { mount } from '@vue/test-utils';
import Box from '../Box.vue';

describe('Box', () => {
  test('of default type with content renders correctly ', () => {
    const wrapper = mount(Box, {
      slots: {
        default: 'This is the default box',
      },
    });
    // TODO: Consider whether to make the test more robust and specific
    // for example: expect(wrapper.classes()).toContain('alert-default');
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of info type renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'info',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of warning type renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'warning',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of success type renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'success',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of important type renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'important',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of wrong type renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'wrong',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of tip type renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'tip',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of definition type renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'definition',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with dismissible option renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        dismissible: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with header renders correctly', () => {
    const wrapper = mount(Box, {
      slots: {
        header: 'A header',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of info type light style renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'info',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of warning type light style renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'warning',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of success type light style renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'success',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of important type light style renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'important',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of wrong type light style renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'wrong',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of tip type light style renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'tip',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of definition type light style renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'definition',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of seamless style renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        seamless: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('having custom background color renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        backgroundColor: 'white',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('having custom border color renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        borderColor: 'grey',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('having custom border left color renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        borderLeftColor: 'blue',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('should have light style take priority over seamless', () => {
    const wrapper = mount(Box, {
      propsData: {
        light: true,
        seamless: true,
      },
    });
    const boxLightStyle = mount(Box, {
      propsData: {
        light: true,
      },
    });
    expect(wrapper).toEqual(boxLightStyle);
  });

  test('with no-background option renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        noBackground: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with no-background option does not affect background-color', () => {
    const wrapper = mount(Box, {
      propsData: {
        noBackground: true,
        backgroundColor: 'yellow',
      },
    });
    const boxYellowBackground = mount(Box, {
      propsData: {
        backgroundColor: 'yellow',
      },
    });
    expect(wrapper).toEqual(boxYellowBackground);
  });

  test('with no-border option renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        noBorder: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with no-page-break option renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        noPageBreak: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with no-border option does not affect border-color', () => {
    const wrapper = mount(Box, {
      propsData: {
        noBorder: true,
        borderColor: 'grey',
      },
    });
    const boxGreyBorder = mount(Box, {
      propsData: {
        borderColor: 'grey',
      },
    });
    expect(wrapper).toEqual(boxGreyBorder);
  });

  test('with no-border option does not affect border-left-color', () => {
    const wrapper = mount(Box, {
      propsData: {
        noBorder: true,
        borderLeftColor: 'grey',
      },
    });
    const boxGreyLeftBorder = mount(Box, {
      propsData: {
        borderLeftColor: 'grey',
      },
    });
    expect(wrapper).toEqual(boxGreyLeftBorder);
  });

  test('with no-icon option renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        type: 'success',
        noIcon: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with icon renders correctly', () => {
    const wrapper = mount(Box, {
      slots: {
        icon: ':rocket:',
      },
      propsData: {
        type: 'info',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with no-icon option does not affect icon set by icon', () => {
    const wrapper = mount(Box, {
      slots: {
        icon: ':rocket:',
      },
      propsData: {
        type: 'info',
        noIcon: true,
      },
    });
    const boxWithIcon = mount(Box, {
      slots: {
        icon: ':rocket:',
      },
      propsData: {
        type: 'info',
      },
    });
    expect(wrapper).toEqual(boxWithIcon);
  });

  test('with icon and icon-size renders correctly', () => {
    const wrapper = mount(Box, {
      slots: {
        icon: ':rocket:',
      },
      propsData: {
        type: 'info',
        iconSize: '2x',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with custom color renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        color: 'pink',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with custom icon color and header renders correctly', () => {
    const wrapper = mount(Box, {
      slots: {
        icon: ':fas-plus:',
        header: 'A header',
      },
      propsData: {
        iconColor: 'red',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with custom icon color and no header renders correctly', () => {
    const wrapper = mount(Box, {
      slots: {
        icon: ':fas-plus:',
      },
      propsData: {
        iconColor: 'red',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with custom icon color and light renders correctly', () => {
    const wrapper = mount(Box, {
      propsData: {
        iconColor: 'red',
        light: true,
        type: 'warning',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
