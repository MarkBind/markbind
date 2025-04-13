import { mount } from '@vue/test-utils';
import Tab from '../Tab.vue';
import TabGroup from '../TabGroup.vue';
import Tabset from '../Tabset.vue';

const DEFAULT_STUBS = {
  'tab': Tab,
  'tab-group': TabGroup,
};

const DEFAULT_GLOBAL_MOUNT_OPTIONS = {
  stubs: DEFAULT_STUBS,
};

const TABSET_HEADER = 'Tabset Header';

const TAB_COMPONENT = `
  <tab header="Tab 1">
      Text in the first tab
  </tab>
  <tab header="Tab 2">
      Text in the second tab
  </tab>
`;

const TABGROUP_COMPONENT = `
  <tab-group header="Third tab group :milky_way:">
    <tab header="Stars :star:">
      Some stuff about stars ...
    </tab>
    <tab header="Disabled Moon :new_moon:" disabled>
    </tab>
  </tab-group>
  <tab-group header="Disabled fourth tab group" disabled>
    <tab header="Hidden tab">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ullamcorper ultrices lobortis.
    </tab>
  </tab-group>
`;

const TAB_AND_TABGROUP_COMPONENT = `
  ${TAB_COMPONENT}
  ${TABGROUP_COMPONENT}
`;

describe('Tabset (Tabs) with Tab and Tab-Group Components', () => {
  test('renders tabset with tabs', () => {
    const wrapper = mount(Tabset, {
      slots: {
        header: TABSET_HEADER,
        default: TAB_COMPONENT,
      },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('renders tabset with tab-group', () => {
    const wrapper = mount(Tabset, {
      slots: {
        header: TABSET_HEADER,
        default: TABGROUP_COMPONENT,
      },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('renders tabset with both tabs and tab-group', () => {
    const wrapper = mount(Tabset, {
      slots: {
        header: TABSET_HEADER,
        default: TAB_AND_TABGROUP_COMPONENT,
      },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('renders tabset with no-page-break option', () => {
    const wrapper = mount(Tabset, {
      slots: {
        header: TABSET_HEADER,
        default: TAB_COMPONENT,
      },
      props: {
        noPageBreak: true,
      },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
