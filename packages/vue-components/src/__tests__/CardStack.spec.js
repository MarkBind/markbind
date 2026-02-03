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

const CARDS_WITH_CUSTOM_TAGS = `
  <card header="Card 1" tag="Success"></card>
  <card header="Card 2" tag="Failure"></card>
  <card header="Card 3" tag="Neutral"></card>
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
      expect(card.vm.computeDisabled).toBe(true);
      expect(card.isVisible()).toBe(false);
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

  test('should respect custom tag order from tag-configs', async () => {
    const tagConfigs = JSON.stringify([
      { name: 'Neutral', color: '#6c757d' },
      { name: 'Success', color: '#28a745' },
      { name: 'Failure', color: '#dc3545' },
    ]);
    const wrapper = mount(CardStack, {
      propsData: {
        dataTagConfigs: tagConfigs.replace(/"/g, '&quot;'),
      },
      slots: { default: CARDS_WITH_CUSTOM_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const { tagMapping } = wrapper.vm.cardStackRef;
    expect(tagMapping.length).toBe(3);
    expect(tagMapping[0][0]).toBe('Neutral');
    expect(tagMapping[1][0]).toBe('Success');
    expect(tagMapping[2][0]).toBe('Failure');
  });

  test('should apply custom hex colors from tag-configs', async () => {
    const tagConfigs = JSON.stringify([
      { name: 'Success', color: '#28a745' },
      { name: 'Failure', color: '#dc3545' },
    ]);
    const wrapper = mount(CardStack, {
      propsData: {
        dataTagConfigs: tagConfigs.replace(/"/g, '&quot;'),
      },
      slots: { default: CARDS_WITH_CUSTOM_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const { tagMapping } = wrapper.vm.cardStackRef;
    expect(tagMapping[0][1].badgeColor).toBe('#28a745');
    expect(tagMapping[1][1].badgeColor).toBe('#dc3545');
  });

  test('should convert Bootstrap color names to classes', async () => {
    const tagConfigs = JSON.stringify([
      { name: 'Success', color: 'success' },
      { name: 'Failure', color: 'danger' },
      { name: 'Neutral', color: 'warning' },
    ]);
    const wrapper = mount(CardStack, {
      propsData: {
        dataTagConfigs: tagConfigs.replace(/"/g, '&quot;'),
      },
      slots: { default: CARDS_WITH_CUSTOM_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const { tagMapping } = wrapper.vm.cardStackRef;
    expect(tagMapping[0][1].badgeColor).toBe('bg-success');
    expect(tagMapping[1][1].badgeColor).toBe('bg-danger');
    expect(tagMapping[2][1].badgeColor).toBe('bg-warning text-dark');
  });

  test('should use default colors for unconfigured tags', async () => {
    const tagConfigs = JSON.stringify([{ name: 'Success', color: '#28a745' }]);
    const wrapper = mount(CardStack, {
      propsData: {
        dataTagConfigs: tagConfigs.replace(/"/g, '&quot;'),
      },
      slots: { default: CARDS_WITH_CUSTOM_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const { tagMapping } = wrapper.vm.cardStackRef;
    // Success should have custom color
    expect(tagMapping[0][1].badgeColor).toBe('#28a745');
    // Other tags should have default Bootstrap colors
    expect(tagMapping[1][1].badgeColor).toMatch(/^bg-/);
    expect(tagMapping[2][1].badgeColor).toMatch(/^bg-/);
  });

  test('should handle invalid tag-configs gracefully', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(CardStack, {
      propsData: {
        dataTagConfigs: 'invalid-json',
      },
      slots: { default: CARDS_WITH_CUSTOM_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Should still render with default colors
    const { tagMapping } = wrapper.vm.cardStackRef;
    expect(tagMapping.length).toBe(3);
    expect(tagMapping[0][1].badgeColor).toMatch(/^bg-/);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to parse tag-configs'), expect.any(SyntaxError));
    warnSpy.mockRestore();
  });

  test('isBootstrapColor should correctly identify Bootstrap colors', async () => {
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_WITH_CUSTOM_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isBootstrapColor('bg-primary')).toBe(true);
    expect(wrapper.vm.isBootstrapColor('bg-warning text-dark')).toBe(true);
    expect(wrapper.vm.isBootstrapColor('#28a745')).toBe(false);
    expect(wrapper.vm.isBootstrapColor('custom-color')).toBe(false);
  });

  test('getTextColor should return correct contrast color', async () => {
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_WITH_CUSTOM_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Light background should have dark text
    expect(wrapper.vm.getTextColor('#ffffff')).toBe('#000');
    expect(wrapper.vm.getTextColor('#f0f0f0')).toBe('#000');

    // Dark background should have light text
    expect(wrapper.vm.getTextColor('#000000')).toBe('#fff');
    expect(wrapper.vm.getTextColor('#333333')).toBe('#fff');
  });
});
