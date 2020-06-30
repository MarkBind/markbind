import { mount } from '@vue/test-utils';
import TipBox from '../TipBox.vue';

describe('TipBox', () => {
  test('of default type with content renders correctly ', () => {
    const wrapper = mount(TipBox, {
      slots: {
        default: 'This is the default box',
      },
    });
    // TODO: Consider whether to make the test more robust and specific
    // for example: expect(wrapper.classes()).toContain('alert-default');
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of info type renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'info',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of warning type renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'warning',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of success type renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'success',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of important type renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'important',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of wrong type renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'wrong',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of tip type renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'tip',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of definition type renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'definition',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with dismissible option renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        dismissible: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with header renders correctly', () => {
    const wrapper = mount(TipBox, {
      slots: {
        _header: 'A header',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of info type light style renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'info',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of warning type light style renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'warning',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of success type light style renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'success',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of important type light style renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'important',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of wrong type light style renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'wrong',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of tip type light style renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'tip',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of definition type light style renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'definition',
        light: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('of seamless style renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        seamless: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('having custom background color renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        backgroundColor: 'white',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('having custom border color renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        borderColor: 'grey',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('having custom border left color renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        borderLeftColor: 'blue',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('should have light style take priority over seamless', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        light: true,
        seamless: true,
      },
    });
    const boxLightStyle = mount(TipBox, {
      propsData: {
        light: true,
      },
    });
    expect(wrapper).toEqual(boxLightStyle);
  });

  test('with no-background option renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        noBackground: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with no-background option does not affect background-color', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        noBackground: true,
        backgroundColor: 'yellow',
      },
    });
    const boxYellowBackground = mount(TipBox, {
      propsData: {
        backgroundColor: 'yellow',
      },
    });
    expect(wrapper).toEqual(boxYellowBackground);
  });

  test('with no-border option renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        noBorder: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with no-border option does not affect border-color', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        noBorder: true,
        borderColor: 'grey',
      },
    });
    const boxGreyBorder = mount(TipBox, {
      propsData: {
        borderColor: 'grey',
      },
    });
    expect(wrapper).toEqual(boxGreyBorder);
  });

  test('with no-border option does not affect border-left-color', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        noBorder: true,
        borderLeftColor: 'grey',
      },
    });
    const boxGreyLeftBorder = mount(TipBox, {
      propsData: {
        borderLeftColor: 'grey',
      },
    });
    expect(wrapper).toEqual(boxGreyLeftBorder);
  });

  test('with no-icon option renders correctly', () => {
    const wrapper = mount(TipBox, {
      propsData: {
        type: 'success',
        noIcon: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with icon renders correctly', () => {
    const wrapper = mount(TipBox, {
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
    const wrapper = mount(TipBox, {
      slots: {
        icon: ':rocket:',
      },
      propsData: {
        type: 'info',
        noIcon: true,
      },
    });
    const boxWithIcon = mount(TipBox, {
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
    const wrapper = mount(TipBox, {
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
    const wrapper = mount(TipBox, {
      propsData: {
        color: 'pink',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
