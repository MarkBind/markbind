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
      props: {
        type: 'info',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of warning type renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'warning',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of success type renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'success',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of important type renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'important',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of wrong type renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'wrong',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of tip type renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'tip',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of definition type renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'definition',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with dismissible option renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
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
      props: {
        type: 'info',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of warning type light style renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'warning',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of success type light style renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'success',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of important type light style renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'important',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of wrong type light style renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'wrong',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of tip type light style renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'tip',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of definition type light style renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        type: 'definition',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of seamless style renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        seamless: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('having custom background color renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        backgroundColor: 'white',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('having custom border color renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        borderColor: 'grey',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('having custom border left color renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        borderLeftColor: 'blue',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('should have light style take priority over seamless', () => {
    const wrapper = mount(Box, {
      props: {
        light: true,
        seamless: true,
      },
    });
    const boxLightStyle = mount(Box, {
      props: {
        light: true,
      },
    });
    expect(wrapper.html()).toEqual(boxLightStyle.html());
  });

  test('with no-background option renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        noBackground: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with no-background option does not affect background-color', () => {
    const wrapper = mount(Box, {
      props: {
        noBackground: true,
        backgroundColor: 'yellow',
      },
    });
    const boxYellowBackground = mount(Box, {
      props: {
        backgroundColor: 'yellow',
      },
    });
    expect(wrapper.html()).toEqual(boxYellowBackground.html());
  });

  test('with no-border option renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        noBorder: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with no-border option does not affect border-color', () => {
    const wrapper = mount(Box, {
      props: {
        noBorder: true,
        borderColor: 'grey',
      },
    });
    const boxGreyBorder = mount(Box, {
      props: {
        borderColor: 'grey',
      },
    });
    expect(wrapper.html()).toEqual(boxGreyBorder.html());
  });

  test('with no-border option does not affect border-left-color', () => {
    const wrapper = mount(Box, {
      props: {
        noBorder: true,
        borderLeftColor: 'grey',
      },
    });
    const boxGreyLeftBorder = mount(Box, {
      props: {
        borderLeftColor: 'grey',
      },
    });
    expect(getComputedStyle(wrapper.element).borderLeftColor)
      .toBe(getComputedStyle(boxGreyLeftBorder.element).borderLeftColor);
  });

  test('with no-icon option renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
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
      props: {
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
      props: {
        type: 'info',
        noIcon: true,
      },
    });
    const boxWithIcon = mount(Box, {
      slots: {
        icon: ':rocket:',
      },
      props: {
        type: 'info',
      },
    });
    expect(wrapper.html()).toEqual(boxWithIcon.html());
  });

  test('with icon and icon-size renders correctly', () => {
    const wrapper = mount(Box, {
      slots: {
        icon: ':rocket:',
      },
      props: {
        type: 'info',
        iconSize: '2x',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with custom color renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
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
      props: {
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
      props: {
        iconColor: 'red',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with custom icon color and light renders correctly', () => {
    const wrapper = mount(Box, {
      props: {
        iconColor: 'red',
        light: true,
        type: 'warning',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
