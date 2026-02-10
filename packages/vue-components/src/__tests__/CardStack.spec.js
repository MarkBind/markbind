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
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
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
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to parse tag-configs'),
      expect.any(SyntaxError),
    );
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

  test('should initialize tag count correctly for custom tag configs', async () => {
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

    const { tagCounts } = wrapper.vm;
    // Custom tags in config that appear in cards should be counted (Success and Failure appear once each)
    expect(tagCounts.Success).toBe(1);
    expect(tagCounts.Failure).toBe(1);
    // Remaining tags not in config should have count 1
    expect(tagCounts.Neutral).toBe(1);
  });

  test('should increment tag count when same tag appears in multiple cards', async () => {
    const CARDS_WITH_DUPLICATE_TAGS = `
      <card header="Card 1" tag="Tag1"></card>
      <card header="Card 2" tag="Tag1"></card>
      <card header="Card 3" tag="Tag1"></card>
      <card header="Card 4" tag="Tag2"></card>
      <card header="Card 5" tag="Tag2"></card>
    `;
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_WITH_DUPLICATE_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const { tagCounts } = wrapper.vm;
    // Tag1 appears 3 times, Tag2 appears 2 times
    expect(tagCounts.Tag1).toBe(3);
    expect(tagCounts.Tag2).toBe(2);
  });

  test('should display tag count in the badge', async () => {
    const CARDS_WITH_DUPLICATE_TAGS = `
      <card header="Card 1" tag="Success"></card>
      <card header="Card 2" tag="Success"></card>
      <card header="Card 3" tag="Failure"></card>
    `;
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_WITH_DUPLICATE_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Check that count badge exists and displays correct numbers
    const tagBadges = wrapper.findAll('.tag-badge');
    // First tag (Success) should show count 2
    expect(tagBadges[0].text()).toContain('Success');
    const firstTagCountBadge = tagBadges[0].find('.tag-count');
    expect(firstTagCountBadge.text()).toBe('2');

    // Second tag (Failure) should show count 1
    expect(tagBadges[1].text()).toContain('Failure');
    const secondTagCountBadge = tagBadges[1].findAll('.tag-count')[0];
    expect(secondTagCountBadge.text()).toBe('1');
  });

  test('should show count badge before the select indicator badge', async () => {
    const CARDS_WITH_DUPLICATE_TAGS = `
      <card header="Card 1" tag="Tag1"></card>
      <card header="Card 2" tag="Tag1"></card>
    `;
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_WITH_DUPLICATE_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const firstTagBadge = wrapper.find('.tag-badge');
    const tagIndicators = firstTagBadge.findAll('.badge');
    // Should have two indicators: count badge and select badge
    expect(tagIndicators.length).toBe(2);
    // First one is count, should display "2"
    expect(tagIndicators[0].text()).toBe('2');
    // Second one is select indicator, should display ✓ (since allSelected is true initially)
    expect(tagIndicators[1].text()).toContain('✓');
  });

  test('should hide tag count when disableTagCount is true', async () => {
    const CARDS_WITH_DUPLICATE_TAGS = `
      <card header="Card 1" tag="Tag1"></card>
      <card header="Card 2" tag="Tag1"></card>
      <card header="Card 3" tag="Tag2"></card>
    `;
    const wrapper = mount(CardStack, {
      propsData: {
        disableTagCount: true,
      },
      slots: { default: CARDS_WITH_DUPLICATE_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const firstTagBadge = wrapper.find('.tag-badge');
    const countBadge = firstTagBadge.find('.tag-count');
    // Count badge should not exist when disableTagCount is true
    expect(countBadge.exists()).toBe(false);

    // Should only have select indicator badge
    const tagIndicators = firstTagBadge.findAll('.tag-indicator');
    expect(tagIndicators.length).toBe(1);
    // The only indicator should be the select indicator with ✓
    expect(tagIndicators[0].text()).toContain('✓');
  });

  test('should show tag count by default when disableTagCount is false', async () => {
    const CARDS_WITH_DUPLICATE_TAGS = `
      <card header="Card 1" tag="Tag1"></card>
      <card header="Card 2" tag="Tag1"></card>
      <card header="Card 3" tag="Tag2"></card>
    `;
    const wrapper = mount(CardStack, {
      propsData: {
        disableTagCount: false,
      },
      slots: { default: CARDS_WITH_DUPLICATE_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const firstTagBadge = wrapper.find('.tag-badge');
    const countBadge = firstTagBadge.find('.tag-count');
    // Count badge should exist when disableTagCount is false
    expect(countBadge.exists()).toBe(true);
    expect(countBadge.text()).toBe('2');

    // Should have both count and select indicator badges
    const tagIndicators = firstTagBadge.findAll('.badge');
    expect(tagIndicators.length).toBe(2);
  });

  test('should update tag counts reactively when search filters cards', async () => {
    const CARDS_WITH_SEARCHABLE_TAGS = `
      <card header="Alpha Card" tag="Tag1" keywords="alpha"></card>
      <card header="Beta Card" tag="Tag1" keywords="beta"></card>
      <card header="Gamma Card" tag="Tag1" keywords="gamma"></card>
      <card header="Delta Card" tag="Tag2" keywords="delta"></card>
      <card header="Epsilon Card" tag="Tag2" keywords="epsilon"></card>
    `;
    const wrapper = mount(CardStack, {
      propsData: {
        searchable: true,
      },
      slots: { default: CARDS_WITH_SEARCHABLE_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Initially, Tag1 has 3 cards and Tag2 has 2 cards
    expect(wrapper.vm.tagCounts.Tag1).toBe(3);
    expect(wrapper.vm.tagCounts.Tag2).toBe(2);

    // Simulate a search for "alpha" which only matches the first card (Tag1)
    const searchInput = wrapper.find('input.search-bar');
    await searchInput.setValue('alpha');
    await searchInput.trigger('input');
    await wrapper.vm.$nextTick();

    // After search, only "Alpha Card" (Tag1) matches
    expect(wrapper.vm.tagCounts.Tag1).toBe(1);
    expect(wrapper.vm.tagCounts.Tag2).toBeUndefined();

    // Verify the DOM reflects the updated count
    const tagBadges = wrapper.findAll('.tag-badge');
    const tag1Badge = tagBadges.find(b => b.text().includes('Tag1'));
    const tag1Count = tag1Badge.find('.tag-count');
    expect(tag1Count.text()).toBe('1');

    const tag2Badge = tagBadges.find(b => b.text().includes('Tag2'));
    const tag2Count = tag2Badge.find('.tag-count');
    expect(tag2Count.text()).toBe('0');

    // Clear search - counts should go back to original
    await searchInput.setValue('');
    await searchInput.trigger('input');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.tagCounts.Tag1).toBe(3);
    expect(wrapper.vm.tagCounts.Tag2).toBe(2);
  });

  test('tag counts should not change when tags are toggled off', async () => {
    const CARDS = `
      <card header="Card A" tag="Tag1"></card>
      <card header="Card B" tag="Tag1"></card>
      <card header="Card C" tag="Tag2"></card>
    `;
    const wrapper = mount(CardStack, {
      slots: { default: CARDS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Initially both tags are selected
    expect(wrapper.vm.tagCounts.Tag1).toBe(2);
    expect(wrapper.vm.tagCounts.Tag2).toBe(1);

    // Deselect Tag1 - counts should remain the same since counts ignore tag selection
    wrapper.vm.updateTag('Tag1');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.tagCounts.Tag1).toBe(2);
    expect(wrapper.vm.tagCounts.Tag2).toBe(1);
  });

  test('should show tag count by default when disableTagCount is not specified', async () => {
    const CARDS_WITH_DUPLICATE_TAGS = `
      <card header="Card 1" tag="Success"></card>
      <card header="Card 2" tag="Success"></card>
      <card header="Card 3" tag="Success"></card>
    `;
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_WITH_DUPLICATE_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const firstTagBadge = wrapper.find('.tag-badge');
    const countBadge = firstTagBadge.find('.tag-count');
    // Count badge should exist by default (disableTagCount defaults to false)
    expect(countBadge.exists()).toBe(true);
    expect(countBadge.text()).toBe('3');
  });

  test('should cover card mounted lifecycle hook registration', async () => {
    const CARDS_FOR_MOUNTED = `
      <card header="Card 1" tag="Tag1" keywords="keyword1"></card>
      <card header="Card 2" tag="Tag2" keywords="keyword2"></card>
    `;
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_FOR_MOUNTED },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Verify cards were registered in cardStack children
    expect(wrapper.vm.cardStackRef.children.length).toBe(2);

    // Verify tags were added to rawTags
    expect(wrapper.vm.cardStackRef.rawTags).toContain('Tag1');
    expect(wrapper.vm.cardStackRef.rawTags).toContain('Tag2');

    // Verify tagMapping was updated
    expect(wrapper.vm.cardStackRef.tagMapping.length).toBe(2);

    // Verify searchData was populated
    expect(wrapper.vm.cardStackRef.searchData.size).toBe(2);
  });

  test('should display correct results count text for single and multiple results', async () => {
    // Use cards with content to prevent them from being disabled
    const SINGLE_CARD = `
      <card header="Only Card" tag="Tag1">Content</card>
    `;
    const wrapper = mount(CardStack, {
      slots: { default: SINGLE_CARD },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Single result should show "1 result"
    const resultsCount = wrapper.find('.results-count');
    expect(resultsCount.text()).toBe('1 result');

    // Add another card and verify plural form
    const MULTIPLE_CARDS = `
      <card header="Card 1" tag="Tag1">Content 1</card>
      <card header="Card 2" tag="Tag2">Content 2</card>
    `;
    const wrapper2 = mount(CardStack, {
      slots: { default: MULTIPLE_CARDS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper2.vm.$nextTick();

    const resultsCount2 = wrapper2.find('.results-count');
    expect(resultsCount2.text()).toBe('2 results');
  });

  test('should handle cards with comma-separated tags', async () => {
    const CARDS_WITH_COMMA_TAGS = `
      <card header="Card 1" tag="Tag1, Tag2, Tag3"></card>
      <card header="Card 2" tag="Tag2, Tag4"></card>
    `;
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_WITH_COMMA_TAGS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Verify all unique tags are in the mapping
    const tagNames = wrapper.vm.cardStackRef.tagMapping.map(t => t[0]);
    expect(tagNames).toContain('Tag1');
    expect(tagNames).toContain('Tag2');
    expect(tagNames).toContain('Tag3');
    expect(tagNames).toContain('Tag4');

    // Verify tag counts
    expect(wrapper.vm.tagCounts.Tag1).toBe(1);
    expect(wrapper.vm.tagCounts.Tag2).toBe(2);
    expect(wrapper.vm.tagCounts.Tag3).toBe(1);
    expect(wrapper.vm.tagCounts.Tag4).toBe(1);
  });

  test('should handle cards with comma-separated keywords', async () => {
    const CARDS_WITH_KEYWORDS = `
      <card header="Card 1" tag="Tag1" keywords="key1, key2, key3"></card>
    `;
    const wrapper = mount(CardStack, {
      propsData: { searchable: true },
      slots: { default: CARDS_WITH_KEYWORDS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const cards = wrapper.findAllComponents(Card);
    // Verify keywords are formatted correctly with comma and space
    expect(cards.at(0).vm.computeKeywords).toBe('key1, key2, key3');
  });

  test('should handle search with multiple terms', async () => {
    const CARDS_FOR_SEARCH = `
      <card header="Alpha Card" tag="Tag1" keywords="alpha beta">Alpha content</card>
      <card header="Beta Card" tag="Tag2" keywords="beta gamma">Beta content</card>
      <card header="Gamma Card" tag="Tag3" keywords="gamma delta">Gamma content</card>
    `;
    const wrapper = mount(CardStack, {
      propsData: { searchable: true },
      slots: { default: CARDS_FOR_SEARCH },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Initially all 3 cards should be visible
    expect(wrapper.vm.matchingCardsCount).toBe(3);

    // Search for "alpha beta" - should match only first card
    const searchInput = wrapper.find('input.search-bar');
    await searchInput.setValue('alpha beta');
    await searchInput.trigger('input');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.matchingCardsCount).toBe(1);
  });

  test('should show empty state when all tags are deselected', async () => {
    const CARDS = `
      <card header="Card 1" tag="Tag1">Content 1</card>
      <card header="Card 2" tag="Tag2">Content 2</card>
    `;
    const wrapper = mount(CardStack, {
      slots: { default: CARDS },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Initially both cards visible
    expect(wrapper.vm.matchingCardsCount).toBe(2);

    // Deselect all tags
    wrapper.vm.hideAllTags();
    await wrapper.vm.$nextTick();

    // No cards should be visible
    expect(wrapper.vm.matchingCardsCount).toBe(0);
    const resultsCount = wrapper.find('.results-count');
    expect(resultsCount.text()).toBe('0 result');
  });

  test('should correctly handle disabled cards in tag count', async () => {
    const CARDS_WITH_DISABLED = `
      <card header="Card 1" tag="Tag1"></card>
      <card header="Card 2" tag="Tag1" disabled></card>
      <card header="Card 3" tag="Tag1"></card>
    `;
    const wrapper = mount(CardStack, {
      slots: { default: CARDS_WITH_DISABLED },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    // Disabled cards should not be counted
    // Only 2 non-disabled cards with Tag1
    expect(wrapper.vm.tagCounts.Tag1).toBe(2);
  });
});
