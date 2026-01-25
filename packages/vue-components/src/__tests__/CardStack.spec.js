import { mount } from '@vue/test-utils';
import CardStack from '../cardstack/CardStack.vue';
import Card from '../cardstack/Card.vue';

const DEFAULT_STUBS = {
  card: Card,
};

const DEFAULT_GLOBAL_MOUNT_OPTIONS = {
  stubs: DEFAULT_STUBS,
};

const CARDS_FOR_SELECT_ALL = `
  <card header="Card 1" tag="Tag1"></card>
  <card header="Card 2" tag="Tag2"></card>
  <card header="Card 3" tag="Tag3"></card>
  <card header="Card 4" tag="Tag4"></card>
`;

const CARDS_CUSTOMISATION = `
  <card header="Normal Body" tag="Normal" keywords="Body" disabled>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor 
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
      exercitation ullamco laboris nisi ut aliquip ex ea commodo
  </card>
  <card header="Short Body" tag="Short" keywords="Body">
      Lorem ipsum dolor sit amet, consectetur adipisicing
  </card>
`;

const EMPTY_CARDS = `
  <card>
  </card>
  <card>
  </card>
`;

const MARKDOWN_CARDS = `
  <card header="### Headers">
  </card>
  <card header="### Italics">
  </card>
`;

describe('CardStack', () => {
  test('should not hide cards when no filter is provided', async () => {
    const wrapper = mount(CardStack, {
      propsData: {
        blocks: '2',
        searchable: true,
      },
      slots: {
        default: CARDS_CUSTOMISATION,
      },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('should not hide cards when no filter is provided', async () => {
    const wrapper = mount(CardStack, {
      propsData: {
        blocks: '2',
        searchable: true,
      },
      slots: {
        default: EMPTY_CARDS,
      },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const cardArray = wrapper.findAllComponents(Card);
    let visible = false;
    for (let i = 0; i < cardArray.length; i += 1) {
      if (cardArray.at(i).isVisible()) {
        visible = true;
        break;
      }
    }

    expect(visible).toBe(false);
    expect(wrapper.element).toMatchSnapshot();
  });

  test('markdown in header, content', async () => {
    const wrapper = mount(CardStack, {
      propsData: {
        blocks: '2',
        searchable: true,
      },
      slots: {
        default: MARKDOWN_CARDS,
      },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('should have all tags checked by default on load', async () => {
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_CUSTOMISATION },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();
    const allTags = wrapper.vm.cardStackRef.tagMapping.map(key => key[0]);
    expect(wrapper.vm.selectedTags).toEqual(expect.arrayContaining(allTags));
    expect(wrapper.vm.allSelected).toBe(true);
  });

  test('toggleAllTags should unselect everything and then select everything', async () => {
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_FOR_SELECT_ALL },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // selected all initially
    expect(wrapper.vm.allSelected).toBe(true);

    // deselect everything
    const selectAllBadge = wrapper.find('.select-all-toggle');
    await selectAllBadge.trigger('click');
    expect(wrapper.vm.selectedTags.length).toBe(0);
    expect(wrapper.vm.allSelected).toBe(false);

    // all cards should be hidden
    const cards = wrapper.findAllComponents(Card);
    cards.forEach((card) => {
      if (card.props('tag') === 'Short') {
        expect(card.vm.disableTag).toBe(true);
      }
    });

    // select all again -> everything should be selected back
    await selectAllBadge.trigger('click');
    expect(wrapper.vm.allSelected).toBe(true);
    expect(wrapper.vm.selectedTags.length).toBeGreaterThan(0);
  });

  test('Select All checkbox should sync with individual tag clicks', async () => {
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_FOR_SELECT_ALL },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // uncheck first tag
    const firstTagBadge = wrapper.findAll('.tag-badge').at(1);
    await firstTagBadge.trigger('click');

    // select all should no longer be checked
    expect(wrapper.vm.allSelected).toBe(false);
    const selectAllIndicator = wrapper.find('.select-all-toggle .tag-indicator');
    expect(selectAllIndicator.text()).not.toContain('✓');

    // Check first tag -> select all should be checked again
    await firstTagBadge.trigger('click');
    expect(wrapper.vm.allSelected).toBe(true);
  });

  test('should show Select All badge by default', async () => {
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_FOR_SELECT_ALL },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // The first badge with .bg-dark is the "Select All" badge
    const selectAllBadge = wrapper.find('.select-all-toggle');
    expect(selectAllBadge.exists()).toBe(true);
    expect(selectAllBadge.text()).toContain('Select All');
  });

  test('should hide Select All badge when showSelectAll is false', async () => {
    const wrapper = mount(CardStack, {
      propsData: {
        showSelectAll: false, // Testing boolean false
      },
      slots: { default: CARDS_FOR_SELECT_ALL },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const selectAllBadge = wrapper.find('.select-all-toggle');
    expect(selectAllBadge.exists()).toBe(false);
  });

  test('should hide Select All badge when showSelectAll is "false" string (case-insensitive)', async () => {
    // This simulates the parser passing show-select-all="fAlse"
    const wrapper = mount(CardStack, {
      propsData: {
        searchable: true,
        showSelectAll: 'fAlse',
      },
      slots: { default: CARDS_FOR_SELECT_ALL },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const selectAllBadge = wrapper.find('.select-all-toggle');
    expect(selectAllBadge.exists()).toBe(false);
  });

  test('should show Select All badge when showSelectAll is "true" string', async () => {
    const wrapper = mount(CardStack, {
      propsData: {
        searchable: true,
        showSelectAll: 'true',
      },
      slots: { default: CARDS_FOR_SELECT_ALL },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const selectAllBadge = wrapper.find('.select-all-toggle');
    expect(selectAllBadge.exists()).toBe(true);
  });

  test('should hide Select All badge when below threshold (<=3 tags)', async () => {
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_CUSTOMISATION }, // Only 2 tags
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const selectAllBadge = wrapper.find('.select-all-toggle');
    expect(selectAllBadge.exists()).toBe(false);
  });
});
